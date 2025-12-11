<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
// use Illuminate\Http\JsonResponse;
use App\Models\Ticket;
use App\Models\Customer;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['customer', 'assignedUser', 'notes']);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('account_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $status = str_replace('-', ' ', $request->status);
            $query->where('status', ucwords($status));
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', ucfirst($request->priority));
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_user_id', $request->assigned_to);
        }

        // Filter by escalation level
        if ($request->has('escalation_level')) {
            $query->where('escalation_level', $request->escalation_level);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tickets = $query->paginate($perPage);

        return Inertia::render('support/tickets', [
            'success' => true,
            'data' => $tickets,
            'stats' => [
                'total' => Ticket::count(),
                'open' => Ticket::open()->count(),
                'in_progress' => Ticket::inProgress()->count(),
                'resolved' => Ticket::resolved()->count(),
                'critical' => Ticket::critical()->count(),
            ]
        ]);
    }

    /**
     * Store a newly created ticket
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'subject' => 'required|string|max:500',
            'ticket_type' => 'required|in:Technical Issue,Support Request,Service Request,Escalation,General Inquiry',
            'escalation_level' => 'required|in:Level 1,Level 2,Level 3',
            'priority' => 'required|in:Low,Medium,High,Critical',
            'category' => 'required|in:Connectivity,Performance,Billing,Equipment,Service Request,Installation,Technical',
            'description' => 'required|string',
            'assigned_to' => 'nullable|string',
            'customer_id' => 'nullable|exists:customers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Auto-link to customer if account number exists
            if (!$request->customer_id) {
                $customer = Customer::where('account_number', $request->account_number)->first();
                $request->merge(['customer_id' => $customer?->id]);
            }

            $ticket = Ticket::create([
                'ticket_number' => Ticket::generateTicketNumber(),
                'customer_id' => $request->customer_id,
                'customer_name' => $request->customer_name,
                'account_number' => $request->account_number,
                'phone' => $request->phone,
                'email' => $request->email,
                'subject' => $request->subject,
                'ticket_type' => $request->ticket_type,
                'escalation_level' => $request->escalation_level,
                'priority' => $request->priority,
                'category' => $request->category,
                'description' => $request->description,
                'assigned_to' => $request->assigned_to,
                'status' => 'Open'
            ]);

            // Add initial note if provided
            if ($request->has('initial_note')) {
                $ticket->addNote(
                    $request->initial_note,
                    Auth::user()?->name ?? 'System',
                    false,
                    Auth::id()
                );
            }

            DB::commit();

            return Inertia::render('support/tickets', [
                'success' => true,
                'message' => 'Ticket created successfully',
                'data' => $ticket->load(['customer', 'notes'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified ticket
     */
    public function show($ticket_number)
    {
        $ticket = Ticket::with(['customer', 'assignedUser', 'notes.user'])->where('ticket_number', $ticket_number)->firstOrFail();

        return Inertia::render('support/ticket_details', [
            'success' => true,
            'data' => $ticket
        ]);
    }

    /**
     * Update the specified ticket
     */
    public function update(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'sometimes|required|string|max:500',
            'ticket_type' => 'sometimes|required|in:Technical Issue,Support Request,Service Request,Escalation,General Inquiry',
            'escalation_level' => 'sometimes|required|in:Level 1,Level 2,Level 3',
            'priority' => 'sometimes|required|in:Low,Medium,High,Critical',
            'category' => 'sometimes|required|in:Connectivity,Performance,Billing,Equipment,Service Request,Installation,Technical',
            'description' => 'sometimes|required|string',
            'assigned_to' => 'nullable|string',
            'status' => 'sometimes|required|in:Open,In Progress,Resolved,Closed,On Hold'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ticket->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ticket updated successfully',
                'data' => $ticket->fresh(['customer', 'assignedUser', 'notes'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update ticket status
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Open,In Progress,Resolved,Closed,On Hold',
            'resolution_summary' => 'required_if:status,Resolved|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
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
                'data' => $ticket->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add note to ticket
     */
    public function addNote(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|string',
            'is_internal' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
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
                'data' => $note
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add note',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Escalate ticket
     */
    public function escalate(Request $request, Ticket $ticket)
    {
        $validator = Validator::make($request->all(), [
            'escalation_level' => 'required|in:Level 1,Level 2,Level 3',
            'reason' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
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
                'data' => $ticket->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to escalate ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate next ticket number
     */
    public function generateTicketNumber()
    {
        return response()->json([
            'success' => true,
            'ticket_number' => Ticket::generateTicketNumber()
        ]);
    }

    /**
     * Get ticket statistics
     */
    public function statistics()
    {
        $stats = [
            'total' => Ticket::count(),
            'open' => Ticket::open()->count(),
            'in_progress' => Ticket::inProgress()->count(),
            'resolved' => Ticket::resolved()->count(),
            'closed' => Ticket::closed()->count(),
            'critical' => Ticket::critical()->count(),
            'by_priority' => [
                'critical' => Ticket::where('priority', 'Critical')->count(),
                'high' => Ticket::where('priority', 'High')->count(),
                'medium' => Ticket::where('priority', 'Medium')->count(),
                'low' => Ticket::where('priority', 'Low')->count(),
            ],
            'by_category' => Ticket::select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->get(),
            'avg_resolution_time' => Ticket::whereNotNull('resolution_time_minutes')
                ->avg('resolution_time_minutes'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Export tickets to CSV
     */
    public function export(Request $request)
    {
        $tickets = Ticket::when($request->status, function($query, $status) {
            return $query->where('status', $status);
        })->get();

        $filename = 'tickets_' . date('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($tickets) {
            $file = fopen('php://output', 'w');
            fputcsv($file, [
                'Ticket Number',
                'Customer Name',
                'Account Number',
                'Subject',
                'Type',
                'Priority',
                'Category',
                'Status',
                'Assigned To',
                'Created At',
                'Resolved At'
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
                    $ticket->resolved_at?->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Remove the specified ticket (soft delete)
     */
    public function destroy(Ticket $ticket)
    {
        try {
            $ticket->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ticket deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
