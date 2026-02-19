<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Ticket;
use App\Models\Customer;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Main dashboard view
     * GET /dashboard
     */
    public function index()
    {
        $now        = Carbon::now();
        $weekAgo    = Carbon::now()->subWeek();
        $prevWeekStart = Carbon::now()->subWeeks(2);
        $prevWeekEnd   = Carbon::now()->subWeek();

        // ── KPI Cards ────────────────────────────────────────────────────────

        $totalTickets     = Ticket::count();
        $totalLastWeek    = Ticket::where('created_at', '<', $weekAgo)->count();

        $openTickets      = Ticket::whereIn('status', ['Open', 'In Progress'])->count();
        $openLastWeek     = Ticket::whereIn('status', ['Open', 'In Progress'])
                                  ->where('created_at', '<', $weekAgo)->count();

        $resolvedTotal    = Ticket::whereIn('status', ['Resolved', 'Closed'])->count();
        $resolutionRate   = $totalTickets > 0
                                ? round(($resolvedTotal / $totalTickets) * 100)
                                : 0;

        // Average response time in hours (first_response_at vs created_at)
        $avgResponseMinutes = Ticket::whereNotNull('first_response_at')
                                    ->avg('response_time_minutes');
        $avgResponseHours   = $avgResponseMinutes
                                ? round($avgResponseMinutes / 60, 1)
                                : 0;

        // Week-over-week changes
        $ticketChangePercent  = $this->weekOverWeekChange($totalTickets, $totalLastWeek);
        $openChangePercent    = $this->weekOverWeekChange($openTickets,  $openLastWeek);

        // ── Revenue Analytics (last 7 days) ──────────────────────────────────
        // Uses customer monthly_bill as a proxy for revenue.
        // Replace with your Billing/Invoice model if available.
        $chartData = [];

        // ── Ticket Volume by Day (last 7 days) ───────────────────────────────
        $ticketVolumeByDay = Ticket::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // ── Recent Tickets ────────────────────────────────────────────────────
        $recentTickets = Ticket::with(['customer', 'assignedUser'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($t) => [
                'id'            => $t->id,
                'ticket_number' => $t->ticket_number,
                'subject'       => $t->subject,
                'customer'      => $t->customer_name,
                'status'        => $t->status,
                'priority'      => strtoupper($t->priority),
                'category'      => $t->category,
                'created_at'    => $t->created_at->toISOString(),
                'time_elapsed'  => $t->time_elapsed,
                'is_overdue'    => $t->is_overdue,
            ]);

        // ── Priority Breakdown ────────────────────────────────────────────────
        $byPriority = Ticket::select('priority', DB::raw('COUNT(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        // ── Status Breakdown ──────────────────────────────────────────────────
        $byStatus = Ticket::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // ── Category Breakdown ────────────────────────────────────────────────
        $byCategory = Ticket::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // ── Agent Performance ─────────────────────────────────────────────────
        $agentPerformance = User::select('users.id', 'users.name')
            ->leftJoin('tickets', 'tickets.assigned_user_id', '=', 'users.id')
            ->selectRaw('COUNT(tickets.id) as total_assigned')
            ->selectRaw("SUM(CASE WHEN tickets.status IN ('Resolved','Closed') THEN 1 ELSE 0 END) as total_resolved")
            ->groupBy('users.id', 'users.name')
            ->having('total_assigned', '>', 0)
            ->orderByDesc('total_assigned')
            ->limit(5)
            ->get()
            ->map(fn($u) => [
                'name'            => $u->name,
                'total_assigned'  => $u->total_assigned,
                'total_resolved'  => $u->total_resolved,
                'resolution_rate' => $u->total_assigned > 0
                                        ? round(($u->total_resolved / $u->total_assigned) * 100)
                                        : 0,
            ]);

        // ── SLA Breach Summary ────────────────────────────────────────────────
        $slaBreaches = $this->getSlaBreachSummary();

        // ── Customer Stats ────────────────────────────────────────────────────
        $totalCustomers  = Customer::count();
        $activeCustomers = Customer::where('status', 'Active')->count();

        return Inertia::render('dashboard', [
            'kpis' => [
                'total_tickets'       => $totalTickets,
                'ticket_change'       => $ticketChangePercent,
                'ticket_positive'     => $ticketChangePercent >= 0,
                'open_issues'         => $openTickets,
                'open_change'         => $openChangePercent,
                'open_positive'       => $openChangePercent <= 0, // fewer open = positive
                'resolution_rate'     => $resolutionRate,
                'avg_response_hours'  => $avgResponseHours,
                'total_customers'     => $totalCustomers,
                'active_customers'    => $activeCustomers,
            ],
            'chart_data'        => $chartData,
            'recent_tickets'    => $recentTickets,
            'by_priority'       => $byPriority,
            'by_status'         => $byStatus,
            'by_category'       => $byCategory,
            'agent_performance' => $agentPerformance,
            'sla_breaches'      => $slaBreaches,
        ]);
    }

    /**
     * JSON endpoint for dashboard data (useful for live refresh without full page reload)
     * GET /api/dashboard
     */
    public function data()
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'stats' => [
                    'total'       => Ticket::count(),
                    'open'        => Ticket::open()->count(),
                    'in_progress' => Ticket::inProgress()->count(),
                    'resolved'    => Ticket::resolved()->count(),
                    'closed'      => Ticket::closed()->count(),
                    'critical'    => Ticket::critical()->count(),
                ],
                'chart_data'     => [],
                'sla_breaches'   => $this->getSlaBreachSummary(),
                'recent_tickets' => Ticket::with('customer')
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'ticket_number', 'subject', 'customer_name', 'status', 'priority', 'category', 'created_at']),
            ]
        ]);
    }

    /**
     * SLA compliance report
     * GET /dashboard/sla
     */
    public function sla()
    {
        $slaConfig = [
            'Critical' => ['response' => 1,  'resolution' => 4],
            'High'     => ['response' => 4,  'resolution' => 24],
            'Medium'   => ['response' => 8,  'resolution' => 48],
            'Low'      => ['response' => 24, 'resolution' => 72],
        ];

        $report = collect($slaConfig)->map(function ($config, $priority) {
            $tickets  = Ticket::where('priority', $priority)->get();
            $breached = $tickets->filter(fn($t) => $t->is_overdue);

            return [
                'priority'             => $priority,
                'response_time_hours'  => $config['response'],
                'resolution_time_hours'=> $config['resolution'],
                'total'                => $tickets->count(),
                'breached'             => $breached->count(),
                'compliant'            => $tickets->count() - $breached->count(),
                'compliance_rate'      => $tickets->count() > 0
                    ? round((($tickets->count() - $breached->count()) / $tickets->count()) * 100)
                    : 100,
            ];
        })->values();

        return Inertia::render('analytics/sla', [
            'success' => true,
            'data'    => $report,
        ]);
    }

    /**
     * Performance analytics
     * GET /dashboard/performance
     */
    public function performance()
    {
        $agentStats = User::select('users.id', 'users.name', 'users.email')
            ->leftJoin('tickets', 'tickets.assigned_user_id', '=', 'users.id')
            ->selectRaw('COUNT(tickets.id) as total_assigned')
            ->selectRaw("SUM(CASE WHEN tickets.status IN ('Resolved','Closed') THEN 1 ELSE 0 END) as total_resolved")
            ->selectRaw('AVG(tickets.resolution_time_minutes) as avg_resolution_minutes')
            ->selectRaw('AVG(tickets.response_time_minutes) as avg_response_minutes')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->get()
            ->map(fn($u) => [
                'name'                   => $u->name,
                'email'                  => $u->email,
                'total_assigned'         => (int) $u->total_assigned,
                'total_resolved'         => (int) $u->total_resolved,
                'resolution_rate'        => $u->total_assigned > 0
                                                ? round(($u->total_resolved / $u->total_assigned) * 100)
                                                : 0,
                'avg_resolution_hours'   => $u->avg_resolution_minutes
                                                ? round($u->avg_resolution_minutes / 60, 1)
                                                : null,
                'avg_response_hours'     => $u->avg_response_minutes
                                                ? round($u->avg_response_minutes / 60, 1)
                                                : null,
            ]);

        $categoryBreakdown = Ticket::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        return Inertia::render('analytics/performance', [
            'success'            => true,
            'agent_stats'        => $agentStats,
            'category_breakdown' => $categoryBreakdown,
        ]);
    }

    /**
     * Customer insights
     * GET /dashboard/insights
     */
    public function insights()
    {
        // Top customers by ticket volume
        $topByTickets = Ticket::select('customer_name', 'account_number', DB::raw('COUNT(*) as ticket_count'))
            ->groupBy('customer_name', 'account_number')
            ->orderByDesc('ticket_count')
            ->limit(10)
            ->get();

        // Customers with most critical/open tickets (needs attention)
        $needsAttention = Ticket::select('customer_name', 'account_number',
                DB::raw('COUNT(*) as open_count'),
                DB::raw("SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical_count")
            )
            ->whereIn('status', ['Open', 'In Progress'])
            ->groupBy('customer_name', 'account_number')
            ->orderByDesc('critical_count')
            ->orderByDesc('open_count')
            ->limit(10)
            ->get();

        // New customers this month
        $newThisMonth = Customer::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Active vs inactive customers
        $customerStatusBreakdown = Customer::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        return Inertia::render('analytics/insights', [
            'success'                    => true,
            'top_by_tickets'             => $topByTickets,
            'needs_attention'            => $needsAttention,
            'new_customers_this_month'   => $newThisMonth,
            'customer_status_breakdown'  => $customerStatusBreakdown,
        ]);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    /**
     * Build last-7-days chart data (tickets + revenue proxy)
     */
    private function buidChartData(): array
    {
        $days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo)->startOfDay();

            $ticketCount = Ticket::whereDate('created_at', $date->toDateString())->count();

            // Revenue proxy: sum of monthly_bill for customers created that day
            // Replace with your Invoice model query if you have one
            $revenue = Customer::whereDate('created_at', $date->toDateString())
                ->sum('monthly_bill');

            return [
                'name'    => $date->format('D'),    // Mon, Tue …
                'date'    => $date->toDateString(),
                'tickets' => $ticketCount,
                'revenue' => (int) $revenue,
            ];
        });

        return $days->toArray();
    }

    /**
     * SLA breach counts per priority for open tickets
     */
    private function getSlaBreachSummary(): array
    {
        $slaHours = [
            'Critical' => 2,
            'High'     => 8,
            'Medium'   => 24,
            'Low'      => 48,
        ];

        $breaches = [];
        foreach ($slaHours as $priority => $hours) {
            $breaches[$priority] = Ticket::where('priority', $priority)
                ->whereNotIn('status', ['Resolved', 'Closed'])
                ->where('created_at', '<', Carbon::now()->subHours($hours))
                ->count();
        }

        return $breaches;
    }

    /**
     * Calculate week-over-week percentage change
     */
    private function weekOverWeekChange(int $current, int $previous): float
    {
        if ($previous === 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
