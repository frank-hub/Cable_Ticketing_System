<?php

namespace App\Http\Controllers;

use App\Models\Installation;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstallationController extends Controller
{

    // =========================================================================
    // SMS METHODS
    // =========================================================================
    public function sendSms($number , $message)
    {
        $data = [
            "api_key"   => env('SMS_API_KEY'),
            "sender_id" => env('SMS_SENDER_ID'),
            "message"   => $message,
            "phone"     => $number
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://sms.blessedtexts.com/api/sms/v1/sendsms', $data);

        if ($response->successful()) {
            return response()->json([
                'status' => 'SMS sent successfully',
                'response' => $response->json()
            ]);
        } else {
            return response()->json([
                'status' => 'Failed to send SMS',
                'error' => $response->body()
            ]);

            Log::info('SMS Error '.$response->body());

        }

        Log::info('SMS Error '.$response->body());

    }

    /**
     * Display a listing of installations
     */
   public function index(Request $request)
{
        $query = Installation::with(['customer', 'assignedTechnician']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('installation_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('account_number', 'like', "%{$search}%")
                ->orWhere('installation_address', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', ucfirst($request->status));
        }

        // Priority filter
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', ucfirst($request->priority));
        }

        // Type filter
        if ($request->filled('type')) {
            $query->where('installation_type', $request->type);
        }

        // Date range
        if ($request->filled('date_from')) {
            $query->whereDate('scheduled_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('scheduled_date', '<=', $request->date_to);
        }

        // Technician filter
        if ($request->filled('technician_id')) {
            $query->where('assigned_technician_id', $request->technician_id);
        }

        // Sorting
        $query->orderBy(
            $request->get('sort_by', 'scheduled_date'),
            $request->get('sort_order', 'asc')
        );

        // Pagination
        $installations = $query->paginate($request->get('per_page', 15));

        // 🔑 Transform data for frontend
        $installations->getCollection()->transform(function ($i) {
            return [
                'idno' => $i->id,
                'id' => (string) $i->installation_number,
                'customerName' => $i->customer_name,
                'address' => $i->address,
                'contactNumber' => $i->contact_number,
                'scheduledDate' => optional($i->scheduled_date)->toISOString(),
                'technician' => $i->assignedTechnician?->name ?? $i->technician,
                'equipment' => $i->equipment,
                'status' => $i->status,
                'notes' => $i->notes,
            ];
        });

        // Technicians dropdown
        $technicians = User::select('id', 'name')
            ->where('role', 'technician')
            ->orderBy('name')
            ->get();

        return Inertia::render('customers/installations', [
            'success' => true,
            'data' => $installations,
            'technicians' => $technicians,
            'stats' => [
                'total' => Installation::count(),
                'pending' => Installation::pending()->count(),
                'scheduled' => Installation::scheduled()->count(),
                'in_progress' => Installation::inProgress()->count(),
                'completed' => Installation::completed()->count(),
            ],
        ]);

    }


    /**
     * Store a newly created installation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'scheduled_date' => 'required|date',
            'technician' => 'nullable|string|max:255',
            'equipment' => 'nullable|string',
            'status' => 'required|in:Pending,Scheduled,In Progress,Completed,Cancelled',
            'notes' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation = Installation::create([
                'installation_number' => Installation::generateInstallationNumber(),
                'customer_id' => $request->customer_id,
                'customer_name' => $request->customer_name,
                'address' => $request->address,
                'contact_number' => $request->contact_number,
                'scheduled_date' => $request->scheduled_date,
                'technician' => $request->technician ?? 'Unassigned',
                'equipment' => $request->equipment,
                'status' => $request->status,
                'notes' => $request->notes,
                'assigned_technician_id' => User::where('name', $request->technician)->value('id')
            ]);

            $user = User::where('name', $request->technician)->first();
                         // SMS notification to the customer
            $this->sendSms(
                $installation->contact_number,
                "Dear {$installation->customer_name}, your installation has been scheduled for {$installation->scheduled_date}. A technician will contact you shortly.");
            // SMS notification to the assigned technician
            $this->sendSms(
                $user->phone,
                "Installation {$installation->installation_number} has been assigned to you. Details:Customer: {$installation->customer_name},{$installation->contact_number}, Status: {$installation->status}. Please address it ASAP thank you.");


            return back()->with('success', 'Installation created successfully');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified installation
     */
    public function show($id)
    {
        $installation = Installation::with(['customer', 'assignedTechnician'])->findOrFail($id);

        return Inertia::render('customers/installation_detail', [
            'installation' => $installation,
            'technicians'  => User::select('id', 'name')->where('role','Technician')->orderBy('name')->get(),
        ]);
    }

    /**
     * Update the specified installation
     */
    public function update(Request $request, Installation $installation)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'email' => 'nullable|email|max:255',
            'installation_address' => 'sometimes|required|string',
            'service_package' => 'sometimes|required|string',
            'monthly_fee' => 'sometimes|required|numeric|min:0',
            'installation_type' => 'sometimes|required|in:New Installation,Relocation,Upgrade,Downgrade',
            'status' => 'sometimes|required|in:Pending,Scheduled,In Progress,Completed,Cancelled,On Hold',
            'priority' => 'sometimes|required|in:Low,Medium,High,Urgent'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation->update($request->all());

            return back()->with('success', 'Installation updated successfully');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Schedule installation
     */
    public function schedule(Request $request, Installation $installation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scheduled_date' => 'required|date',
            'scheduled_time_start' => 'required|date_format:H:i',
            'scheduled_time_end' => 'required|date_format:H:i|after:scheduled_time_start',
            'assigned_technician_id' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation->schedule(
                $request->scheduled_date,
                $request->scheduled_time_start,
                $request->scheduled_time_end,
                $request->assigned_technician_id
            );

            return response()->json([
                'success' => true,
                'message' => 'Installation scheduled successfully',
                'data' => $installation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start installation
     */
    public function start(Installation $installation): JsonResponse
    {
        try {
            $installation->startInstallation();

            return response()->json([
                'success' => true,
                'message' => 'Installation started',
                'data' => $installation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete installation
     */
    public function complete(Request $request, Installation $installation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'router_model' => 'nullable|string',
            'router_serial_number' => 'nullable|string',
            'ont_serial_number' => 'nullable|string',
            'cable_length_meters' => 'nullable|integer',
            'ip_address' => 'nullable|string',
            'vlan_id' => 'nullable|string',
            'signal_strength' => 'nullable|numeric',
            'installation_notes' => 'nullable|string',
            'quality_check_passed' => 'boolean',
            'payment_received' => 'boolean',
            'payment_method' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation->completeInstallation($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Installation completed successfully',
                'data' => $installation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel installation
     */
    public function cancel(Request $request, Installation $installation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation->cancel($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Installation cancelled',
                'data' => $installation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reschedule installation
     */
    public function reschedule(Request $request, Installation $installation): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scheduled_date' => 'required|date',
            'scheduled_time_start' => 'required|date_format:H:i',
            'scheduled_time_end' => 'required|date_format:H:i|after:scheduled_time_start'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $installation->reschedule(
                $request->scheduled_date,
                $request->scheduled_time_start,
                $request->scheduled_time_end
            );

            return response()->json([
                'success' => true,
                'message' => 'Installation rescheduled successfully',
                'data' => $installation->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get installation statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Installation::count(),
            'pending' => Installation::pending()->count(),
            'scheduled' => Installation::scheduled()->count(),
            'in_progress' => Installation::inProgress()->count(),
            'completed' => Installation::completed()->count(),
            'cancelled' => Installation::cancelled()->count(),
            'urgent' => Installation::urgent()->count(),
            'by_type' => Installation::select('installation_type', DB::raw('count(*) as count'))
                ->groupBy('installation_type')
                ->get(),
            'avg_duration' => Installation::whereNotNull('installation_duration_minutes')
                ->avg('installation_duration_minutes'),
            'completion_rate' => Installation::count() > 0
                ? round((Installation::completed()->count() / Installation::count()) * 100, 2)
                : 0
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Generate next installation number
     */
    public function generateInstallationNumber(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'installation_number' => Installation::generateInstallationNumber()
        ]);
    }

    /**
     * Remove the specified installation (soft delete)
     */
    public function destroy(Installation $installation)
    {
        try {
            $installation->delete();

            return redirect()->route('customers.installations')->with('success', 'Installation deleted successfully');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete installation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
