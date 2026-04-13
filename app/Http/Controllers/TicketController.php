<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Customer;
use App\Models\TicketNote;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Env;

class TicketController extends Controller
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


    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Ticket::with(['customer', 'assignedUser', 'notes']);

        // ── Technician: scope everything to their own tickets ──────────────
        $isTechnician = $user->role === 'Technician';
        if ($isTechnician) {
            $query->where('assigned_to', $user->name);
        }

        // ── Filters ────────────────────────────────────────────────────────
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $status = str_replace('-', ' ', $request->status);
            $query->where('status', ucwords($status));
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', ucfirst($request->priority));
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Technician must not be able to filter by other users' tickets
        if ($request->has('assigned_to') && !$isTechnician) {
            $query->where('assigned_user_id', $request->assigned_to);
        }

        if ($request->has('escalation_level')) {
            $query->where('escalation_level', $request->escalation_level);
        }

        // ── Sorting & pagination ───────────────────────────────────────────
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $tickets = $query->paginate($perPage);

        // ── Stats: scoped to own tickets for Technician ────────────────────
        $statsQuery = $isTechnician
            ? Ticket::where('assigned_to', $user->name)
            : new Ticket;

        $customers = Customer::select('id', 'customer_name', 'account_number', 'primary_phone', 'email_address')
            ->where('status', 'Active')
            ->orderBy('customer_name')
            ->get();

        $users = User::select('id', 'name', 'email')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();


        return Inertia::render('support/tickets', [
            'success'   => true,
            'data'      => $tickets,
            'customers' => $customers,
            'users'     => $users,
            'stats'     => [
                'total'       => $statsQuery->count(),
                'open'        => $statsQuery->clone()->open()->count(),
                'in_progress' => $statsQuery->clone()->inProgress()->count(),
                'resolved'    => $statsQuery->clone()->resolved()->count(),
                'critical'    => $statsQuery->clone()->critical()->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name'    => 'required|string|max:255',
            'account_number'   => 'required|string|max:50',
            'phone'            => 'required|string|max:20',
            'email'            => 'nullable|email|max:255',
            'subject'          => 'required|string|max:500',
            'ticket_type'      => 'required|in:Technical Issue,Support Request,Service Request,Escalation,General Inquiry',
            'escalation_level' => 'required|in:Level 1,Level 2,Level 3',
            'priority'         => 'required|in:Low,Medium,High,Critical',
            'category'         => 'required|in:Connectivity,Performance,Billing,Equipment,Service Request,Installation,Technical',
            'description'      => 'required|string',
            'assigned_to'      => 'nullable|string',
            'customer_id'      => 'nullable|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            if (!$request->customer_id) {
                $customer = Customer::where('account_number', $request->account_number)->first();
                $request->merge(['customer_id' => $customer?->id]);
            }

            $ticket = Ticket::create([
                'ticket_number'    => Ticket::generateTicketNumber(),
                'customer_id'      => $request->customer_id,
                'customer_name'    => $request->customer_name,
                'account_number'   => $request->account_number,
                'phone'            => $request->phone,
                'email'            => $request->email,
                'subject'          => $request->subject,
                'ticket_type'      => $request->ticket_type,
                'escalation_level' => $request->escalation_level,
                'priority'         => $request->priority,
                'category'         => $request->category,
                'description'      => $request->description,
                'assigned_to'      => $request->assigned_to,
                'assigned_user_id' => $request->assigned_to ? User::where('name', $request->assigned_to)->value('id') : null,
                'status'           => 'Open',
            ]);

            if ($request->has('initial_note')) {
                $ticket->addNote(
                    $request->initial_note,
                    Auth::user()?->name ?? 'System',
                    false,
                    Auth::id()
                );
            }

            DB::commit();
            $this->sendSms($ticket->phone, "Your ticket {$ticket->ticket_number} has been created. We will get back to you shortly.");

            return Inertia::render('support/tickets', [
                'success' => true,
                'message' => 'Ticket created successfully',
                'data'    => $ticket->load(['customer', 'notes'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $ticket_number)
    {
        $user   = $request->user();

        $ticket = Ticket::with(['customer', 'assignedUser', 'notes'])
            ->where('ticket_number', $ticket_number)
            ->firstOrFail();

        // Technician can only view their own tickets
        if ($user->role === 'Technician' && $ticket->assigned_to !== $user->name) {
            abort(403, 'You can only view your own tickets.');
        }

        return Inertia::render('support/ticket_details', [
            'success' => true,
            'data'    => [
                'id'                      => $ticket->id,
                'ticket_number'           => $ticket->ticket_number,
                'customer_name'           => $ticket->customer_name,
                'account_number'          => $ticket->account_number,
                'phone'                   => $ticket->phone,
                'email'                   => $ticket->email,
                'subject'                 => $ticket->subject,
                'ticket_type'             => $ticket->ticket_type,
                'escalation_level'        => $ticket->escalation_level,
                'priority'                => $ticket->priority,
                'category'                => $ticket->category,
                'description'             => $ticket->description,
                'assigned_to'             => $ticket->assigned_to,
                'status'                  => $ticket->status,
                'first_response_at'       => $ticket->first_response_at,
                'resolved_at'             => $ticket->resolved_at,
                'closed_at'               => $ticket->closed_at,
                'response_time_minutes'   => $ticket->response_time_minutes,
                'resolution_time_minutes' => $ticket->resolution_time_minutes,
                'started_at'              => $ticket->started_at,
                'paused_at'               => $ticket->paused_at,
                'total_paused_minutes'    => $ticket->total_paused_minutes ?? 0,
                'resolution_summary'      => $ticket->resolution_summary,
                'satisfaction_rating'     => $ticket->satisfaction_rating,
                'created_at'              => $ticket->created_at,
                'updated_at'              => $ticket->updated_at,
                'notes'                   => $ticket->notes->map(fn($note) => [
                    'id'          => $note->id,
                    'note'        => $note->note,
                    'author_name' => $note->author_name,
                    'is_internal' => (bool) $note->is_internal,
                    'created_at'  => $note->created_at,
                ]),
            ],

            // Users for the "Assigned To" dropdown in edit mode
            // Filtered to only roles that handle tickets
            'users' => User::select('id', 'name')
                ->whereIn('role', ['Admin', 'Manager', 'Support Agent', 'Technician'])
                ->where('status', 'active')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'subject'          => 'sometimes|required|string|max:500',
            'ticket_type'      => 'sometimes|required|in:Technical Issue,Support Request,Service Request,Escalation,General Inquiry',
            'escalation_level' => 'sometimes|required|in:Level 1,Level 2,Level 3',
            'priority'         => 'sometimes|required|in:Low,Medium,High,Critical',
            'category'         => 'sometimes|required|in:Connectivity,Performance,Billing,Equipment,Service Request,Installation,Technical',
            'description'      => 'sometimes|required|string',
            'assigned_to'      => 'nullable|string',
            'status'           => 'sometimes|required|in:Open,In Progress,Resolved,Closed,On Hold',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $ticket->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ticket updated successfully',
                'data'    => $ticket->fresh(['customer', 'assignedUser', 'notes'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function addNote(Request $request, Ticket $ticket , $ticket_number = null)
    {
        $validator = Validator::make($request->all(), [
            'note'        => 'required|string',
            'is_internal' => 'boolean',
        ]);

        if ($ticket_number) {
            // If ticket_number is provided, store the note
            TicketNote::create([
                'ticket_id'   => $ticket_number,
                'note'        => $request->note,
                'author_name' => Auth::user()?->name ?? 'System',
                'is_internal' => $request->get('is_internal', false),
                'user_id'   => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Note added successfully',
            ]); 

        }

        

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $note = $ticket->addNote(
                $request->note,
                Auth::user()?->name ?? 'System',
                $request->get('is_internal', false),
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Note added successfully',
                'data'    => $note
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add note',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function escalate(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'escalation_level' => 'required|in:Level 1,Level 2,Level 3',
            'reason'           => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            $ticket->escalate($request->escalation_level);
            $ticket->addNote(
                "Escalated to {$request->escalation_level}. Reason: {$request->reason}",
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket escalated successfully',
                'data'    => $ticket->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to escalate ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // NEW METHODS — required by TicketDetailsPage.tsx
    // =========================================================================

    /**
     * POST /tickets/{ticket}/start
     *
     * Technician clicks "Start Working".
     * - Records started_at and first_response_at
     * - Calculates response_time_minutes from created_at → now
     * - Sets status → In Progress
     */
    public function startWorking(Ticket $ticket)
    {
        if ($ticket->started_at) {
            return response()->json([
                'success' => false,
                'message' => 'Work has already been started on this ticket.',
            ], 422);
        }

        try {
            $startTime       = Carbon::now();
            $responseMinutes = (int) $startTime->diffInMinutes($ticket->created_at);

            $ticket->update([
                'status'                => 'In Progress',
                'started_at'            => $startTime,
                'first_response_at'     => $startTime,
                'response_time_minutes' => $responseMinutes,
            ]);

            $ticket->addNote(
                "Technician started working on ticket. Response time: {$this->formatDuration($responseMinutes)}",
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Work started successfully.',
                'data'    => $ticket->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to start working.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /tickets/{ticket}/hold
     *
     * Technician clicks "Put On Hold".
     * - Records paused_at
     * - Sets status → On Hold
     * SLA timer is effectively paused while paused_at is non-null.
     */
    public function putOnHold(Ticket $ticket)
    {
        if ($ticket->status === 'On Hold') {
            return response()->json([
                'success' => false,
                'message' => 'Ticket is already on hold.',
            ], 422);
        }

        if (!$ticket->started_at) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket must be started before it can be put on hold.',
            ], 422);
        }

        try {
            $ticket->update([
                'status'    => 'On Hold',
                'paused_at' => Carbon::now(),
            ]);

            $ticket->addNote(
                'Ticket put on hold. SLA timer paused.',
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket is now on hold.',
                'data'    => $ticket->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to put ticket on hold.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /tickets/{ticket}/resume
     *
     * Technician clicks "Resume Work".
     * - Calculates paused duration (paused_at → now) and adds to total_paused_minutes
     * - Clears paused_at
     * - Sets status → In Progress
     */
    public function resumeFromHold(Ticket $ticket)
    {
        if ($ticket->status !== 'On Hold' || !$ticket->paused_at) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket is not currently on hold.',
            ], 422);
        }

        try {
            $resumeTime    = Carbon::now();
            $pausedMinutes = (int) $resumeTime->diffInMinutes($ticket->paused_at);

            $ticket->update([
                'status'               => 'In Progress',
                'paused_at'            => null,
                'total_paused_minutes' => ($ticket->total_paused_minutes ?? 0) + $pausedMinutes,
            ]);

            $ticket->addNote(
                "Ticket resumed. Was on hold for {$this->formatDuration($pausedMinutes)}. SLA timer resumed.",
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket resumed successfully.',
                'data'    => $ticket->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resume ticket.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /tickets/{ticket}/resolve
     *
     * Technician submits the Resolve modal.
     * - Requires resolution_summary
     * - resolution_time_minutes = (started_at → now) − total_paused_minutes
     *   If ticket is still On Hold when resolved, current hold duration is also excluded.
     * - Sets status → Resolved
     */
    public function resolve(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'resolution_summary' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        if (!$ticket->started_at) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket must be started before it can be resolved.',
            ], 422);
        }

        try {
            $resolveTime  = Carbon::now();
            $totalMinutes = (int) $resolveTime->diffInMinutes($ticket->started_at);

            // If ticket is still On Hold when resolved, absorb the current hold period too
            $totalPausedMinutes = $ticket->total_paused_minutes ?? 0;
            if ($ticket->status === 'On Hold' && $ticket->paused_at) {
                $totalPausedMinutes += (int) $resolveTime->diffInMinutes($ticket->paused_at);
            }

            $resolutionMinutes = max(0, $totalMinutes - $totalPausedMinutes);

            $ticket->update([
                'status'                  => 'Resolved',
                'resolved_at'             => $resolveTime,
                'resolution_summary'      => $request->resolution_summary,
                'resolution_time_minutes' => $resolutionMinutes,
                'paused_at'               => null,               // clear any active hold
                'total_paused_minutes'    => $totalPausedMinutes,
            ]);

            $ticket->addNote(
                "Ticket resolved. Total active work time: {$this->formatDuration($resolutionMinutes)}",
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            $this->sendSms($ticket->phone, "Your ticket {$ticket->ticket_number} has been resolved. Thank you for choosing us.");

            return response()->json([
                'success' => true,
                'message' => 'Ticket resolved successfully.',
                'data'    => $ticket->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resolve ticket.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /tickets/{ticket}/close
     *
     * Technician clicks "Close Ticket" (only available after Resolved).
     * - Sets status → Closed and records closed_at
     */
    public function close(Ticket $ticket)
    {
        if ($ticket->status !== 'Resolved') {
            return response()->json([
                'success' => false,
                'message' => 'Only resolved tickets can be closed.',
            ], 422);
        }

        try {
            $ticket->update([
                'status'    => 'Closed',
                'closed_at' => Carbon::now(),
            ]);

            $ticket->addNote(
                'Ticket closed.',
                Auth::user()?->name ?? 'System',
                true,
                Auth::id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Ticket closed successfully.',
                'data'    => $ticket->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to close ticket.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // EXISTING METHODS (unchanged)
    // =========================================================================

    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'status'             => 'required|in:Open,In Progress,Resolved,Closed,On Hold',
            'resolution_summary' => 'required_if:status,Resolved|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        try {
            switch ($request->status) {
                case 'In Progress':
                    $ticket->markAsInProgress();
                    break;
                case 'Resolved':
                    $ticket->markAsResolved($request->resolution_summary);
                    break;
                case 'Closed':
                    $ticket->markAsClosed();
                    break;
                default:
                    $ticket->update(['status' => $request->status]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket status updated successfully',
                'data'    => $ticket->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function generateTicketNumber()
    {
        return response()->json([
            'success'       => true,
            'ticket_number' => Ticket::generateTicketNumber()
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total'               => Ticket::count(),
            'open'                => Ticket::open()->count(),
            'in_progress'         => Ticket::inProgress()->count(),
            'resolved'            => Ticket::resolved()->count(),
            'closed'              => Ticket::closed()->count(),
            'critical'            => Ticket::critical()->count(),
            'by_priority'         => [
                'critical' => Ticket::where('priority', 'Critical')->count(),
                'high'     => Ticket::where('priority', 'High')->count(),
                'medium'   => Ticket::where('priority', 'Medium')->count(),
                'low'      => Ticket::where('priority', 'Low')->count(),
            ],
            'by_category'         => Ticket::select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->get(),
            'avg_resolution_time' => Ticket::whereNotNull('resolution_time_minutes')
                ->avg('resolution_time_minutes'),
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }

    public function export(Request $request)
    {
        $tickets  = Ticket::when($request->status, fn($q, $s) => $q->where('status', $s))->get();
        $filename = 'tickets_' . date('Y-m-d_His') . '.csv';
        $headers  = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($tickets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Ticket Number', 'Customer Name', 'Account Number', 'Subject',
                'Type', 'Priority', 'Category', 'Status', 'Assigned To',
                'Created At', 'Resolved At',
            ]);
            foreach ($tickets as $ticket) {
                fputcsv($file, [
                    $ticket->ticket_number,
                    $ticket->customer_name,
                    $ticket->account_number,
                    $ticket->subject,
                    $ticket->ticket_type,
                    $ticket->priority,
                    $ticket->category,
                    $ticket->status,
                    $ticket->assigned_to,
                    $ticket->created_at?->format('Y-m-d H:i:s'),
                    $ticket->resolved_at?->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function destroy(Ticket $ticket)
    {
        try {
            $ticket->delete();
            return response()->json(['success' => true, 'message' => 'Ticket deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /**
     * Mirrors the formatDuration() helper in TicketDetailsPage.tsx
     * so system-generated notes use the same human-readable format.
     */
    private function formatDuration(int $minutes): string
    {
        if ($minutes <= 0) return '0m';
        $hours = intdiv($minutes, 60);
        $mins  = $minutes % 60;
        return $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";
    }
}
