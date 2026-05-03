<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SOS as SosAlert;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SOSController extends Controller
{

 /**
     * GET /sos
     */
    public function index()
    {
        $history = SosAlert::with([
                'triggeredBy:id,name,role',
                'resolvedBy:id,name',
            ])
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($alert) => [
                'id'              => $alert->id,
                'type'            => $alert->type,
                'type_label'      => $alert->getTypeLabel(),
                'message'         => $alert->message,
                'triggered_by'    => $alert->triggeredBy?->name ?? 'Unknown',
                'triggered_by_id' => $alert->triggered_by,
                'triggered_role'  => $alert->triggeredBy?->role ?? '',
                'notified_count'  => $alert->notified_count,
                'status'          => $alert->status,
                'resolved_by'     => $alert->resolvedBy?->name,
                'resolved_at'     => $alert->resolved_at?->format('Y-m-d H:i:s'),
                'created_at'      => $alert->created_at->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('sos/index', [
            'history' => $history,
        ]);
    }

    /**
     * POST /sos
     * Trigger an SOS — SMS all active technicians.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'    => 'required|in:network_outage,urgent_backup,safety_incident,emergency_sms',
            'message' => 'required|string|max:500',
        ]);

        $technicians = User::where('role', 'Technician')
            ->where('status', 'active')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->get();

        if ($technicians->isEmpty()) {
            return back()->with('error', 'No active technicians with phone numbers found.');
        }

        $typeLabel  = (new SosAlert(['type' => $validated['type']]))->getTypeLabel();
        $smsMessage = "🚨 SOS ALERT [{$typeLabel}]: {$validated['message']} — Sent by: " . $request->user()->name;

        $notifiedCount = 0;
        $failedCount   = 0;

        foreach ($technicians as $technician) {
            $this->sendSms($technician->phone, $smsMessage)
                ? $notifiedCount++
                : $failedCount++;
        }

        $status = match(true) {
            $failedCount === 0   => 'sent',
            $notifiedCount === 0 => 'failed',
            default              => 'partial',
        };

        SosAlert::create([
            'type'           => $validated['type'],
            'message'        => $validated['message'],
            'triggered_by'   => $request->user()->id,
            'notified_count' => $notifiedCount,
            'status'         => $status,
        ]);

        if ($status === 'failed')  return back()->with('error', 'SOS saved but all SMS deliveries failed. Check logs.');
        if ($status === 'partial') return back()->with('error', "SOS partially sent — {$notifiedCount} succeeded, {$failedCount} failed.");

        return back()->with('success', "SOS alert sent to {$notifiedCount} technician(s) successfully.");
    }

    /**
     * POST /sos/{alert}/resolve
     * Only the person who triggered the SOS can resolve it.
     * Sends a thank-you SMS to all technicians who were originally notified.
     */
    public function resolve(Request $request, SosAlert $alert)
    {
        // Only the original triggerer can resolve
        if ($alert->triggered_by !== $request->user()->id) {
            return back()->with('error', 'Only the person who triggered this SOS can resolve it.');
        }

        if ($alert->isResolved()) {
            return back()->with('error', 'This SOS alert has already been resolved.');
        }

        $resolvedBy = $request->user()->name;
        $typeLabel  = $alert->getTypeLabel();

        $thankYouMessage = "✅ SOS RESOLVED [{$typeLabel}]: The situation has been handled. Thank you for your swift response! — {$resolvedBy}";

        // SMS all active technicians (same group who were originally notified)
        $technicians = User::where('role', 'Technician')
            ->where('status', 'active')
            ->whereNotNull('phone')
            ->where('phone', '!=', '')
            ->get();

        $sentCount = 0;
        foreach ($technicians as $technician) {
            $this->sendSms($technician->phone, $thankYouMessage)
                ? $sentCount++
                : null;
        }

        // Mark as resolved
        $alert->update([
            'status'      => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        Log::info("SOS #{$alert->id} resolved by {$resolvedBy}. Thank-you SMS sent to {$sentCount} technician(s).");

        return back()->with('success', "SOS resolved. Thank-you SMS sent to {$sentCount} technician(s).");
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function sendSms(string $number, string $message): bool
    {
        $data = [
            'api_key'   => env('SMS_API_KEY'),
            'sender_id' => env('SMS_SENDER_ID'),
            'message'   => $message,
            'phone'     => $number,
        ];

        Log::info('SOS SMS → ' . $number);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->post('https://sms.blessedtexts.com/api/sms/v1/sendsms', $data);

            if ($response->successful()) {
                Log::info('SOS SMS sent to: ' . $number);
                return true;
            }

            Log::error('SOS SMS failed for: ' . $number, ['body' => $response->body()]);
            return false;

        } catch (\Exception $e) {
            Log::error('SOS SMS exception for: ' . $number, ['error' => $e->getMessage()]);
            return false;
        }
    }
}
