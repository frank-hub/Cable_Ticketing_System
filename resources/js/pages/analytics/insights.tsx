import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
  ArrowLeft, Users, AlertTriangle, TrendingUp, UserPlus,
  UserCheck, UserX, ChevronRight, Search, Ticket,
  Flame, Star, Activity, Eye,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Treemap,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TopCustomer {
  customer_name:  string;
  account_number: string;
  ticket_count:   number;
}

interface AttentionCustomer {
  customer_name:  string;
  account_number: string;
  open_count:     number;
  critical_count: number;
}

interface StatusBreakdown {
  status: string;
  count:  number;
}

interface PageProps {
  success:                   boolean;
  top_by_tickets:            TopCustomer[];
  needs_attention:           AttentionCustomer[];
  new_customers_this_month:  number;
  customer_status_breakdown: StatusBreakdown[];
  [key: string]: unknown;
}

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode; pieColor: string }> = {
  Active:    { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <UserCheck size={14} />, pieColor: '#10b981' },
  Inactive:  { color: 'text-slate-500',   bg: 'bg-slate-50',   border: 'border-slate-200',   icon: <UserX size={14} />,    pieColor: '#94a3b8' },
  Suspended: { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     icon: <AlertTriangle size={14} />, pieColor: '#ef4444' },
};

const TICKET_BAR_COLORS = ['#6366f1','#818cf8','#a5b4fc','#c7d2fe','#e0e7ff','#ede9fe','#ddd6fe','#c4b5fd','#a78bfa','#8b5cf6'];

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const avatarBg = (name: string) => {
  const colors = ['bg-indigo-500','bg-violet-500','bg-blue-500','bg-teal-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-pink-500'];
  return colors[name.charCodeAt(0) % colors.length];
};

const urgencyStyle = (critical: number, open: number) => {
  if (critical > 0) return { label: 'Critical', color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-500'    };
  if (open > 2)     return { label: 'High',     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' };
  return               { label: 'Medium',   color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400'  };
};

// ── Custom Tooltip for bar chart ──────────────────────────────────────────────

const CustomBarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TopCustomer;
  return (
    <div className="bg-slate-900 rounded-xl px-4 py-3 shadow-xl text-white text-xs">
      <p className="font-bold text-sm mb-1">{d.customer_name}</p>
      <p className="text-slate-300">Account: {d.account_number}</p>
      <p className="text-indigo-300 font-semibold mt-1">{d.ticket_count} tickets</p>
    </div>
  );
};

// ── Treemap custom content ────────────────────────────────────────────────────

const TreemapContent = ({ x, y, width, height, name, value, index }: any) => {
  const tooSmall = width < 60 || height < 40;
  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={width - 2} height={height - 2}
        rx={6} ry={6}
        fill={TICKET_BAR_COLORS[index % TICKET_BAR_COLORS.length]}
        opacity={0.85}
      />
      {!tooSmall && (
        <>
          <text x={x + 10} y={y + 22} fill="#fff" fontSize={11} fontWeight="700">{name?.slice(0, 14)}</text>
          <text x={x + 10} y={y + 38} fill="rgba(255,255,255,0.7)" fontSize={10}>{value} tickets</text>
        </>
      )}
    </g>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Insights() {
  const {
    top_by_tickets,
    needs_attention,
    new_customers_this_month,
    customer_status_breakdown,
  } = usePage<PageProps>().props;

  const [search, setSearch]               = useState('');
  const [attentionSearch, setAttSearch]   = useState('');
  const [view, setView]                   = useState<'bar' | 'treemap'>('bar');

  // Totals
  const totalCustomers = customer_status_breakdown.reduce((s, r) => s + r.count, 0);
  const activeCount    = customer_status_breakdown.find(r => r.status === 'Active')?.count ?? 0;
  const activeRate     = totalCustomers > 0 ? Math.round((activeCount / totalCustomers) * 100) : 0;
  const totalOpenTickets = needs_attention.reduce((s, r) => s + r.open_count, 0);
  const totalCritical    = needs_attention.reduce((s, r) => s + r.critical_count, 0);

  // Pie data
  const pieData = customer_status_breakdown.map(r => ({
    name:  r.status,
    value: r.count,
    fill:  STATUS_META[r.status]?.pieColor ?? '#94a3b8',
  }));

  // Filtered lists
  const filteredTop = top_by_tickets.filter(c =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.account_number.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAttention = needs_attention.filter(c =>
    c.customer_name.toLowerCase().includes(attentionSearch.toLowerCase()) ||
    c.account_number.toLowerCase().includes(attentionSearch.toLowerCase())
  );

  // Chart data for top 8 by tickets
  const barData = filteredTop.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              Customer Insights
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Ticket behaviour, attention signals, and customer health</p>
          </div>
        </div>
        {totalCritical > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 text-xs font-semibold text-red-700 animate-pulse">
            <Flame size={13} />
            {totalCritical} critical open
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users size={18} className="text-indigo-500" />}
            label="Total Customers"
            value={totalCustomers}
            sub="all accounts"
            iconBg="bg-indigo-50"
          />
          <KpiCard
            icon={<UserCheck size={18} className="text-emerald-500" />}
            label="Active"
            value={`${activeCount} (${activeRate}%)`}
            sub="currently active"
            iconBg="bg-emerald-50"
            valueColor="text-emerald-700"
          />
          <KpiCard
            icon={<UserPlus size={18} className="text-blue-500" />}
            label="New This Month"
            value={new_customers_this_month}
            sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            iconBg="bg-blue-50"
            valueColor="text-blue-700"
          />
          <KpiCard
            icon={<AlertTriangle size={18} className="text-red-500" />}
            label="Needs Attention"
            value={needs_attention.length}
            sub={`${totalOpenTickets} open · ${totalCritical} critical`}
            iconBg="bg-red-50"
            valueColor={needs_attention.length > 0 ? 'text-red-600' : 'text-slate-800'}
          />
        </div>

        {/* ── Customer Status Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Pie + status cards */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Customer Status</h2>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={48} outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centre label */}
            <div className="space-y-2 mt-2">
              {customer_status_breakdown.map(r => {
                const meta = STATUS_META[r.status] ?? STATUS_META.Inactive;
                const pct  = totalCustomers > 0 ? Math.round((r.count / totalCustomers) * 100) : 0;
                return (
                  <div key={r.status} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${meta.bg} ${meta.border}`}>
                    <div className={`flex items-center gap-2 ${meta.color} text-xs font-semibold`}>
                      {meta.icon}
                      {r.status}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{r.count}</span>
                      <span className="text-xs text-slate-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active rate bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Active rate</span>
                <span className="font-bold text-emerald-600">{activeRate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeRate}%` }} />
              </div>
            </div>
          </div>

          {/* Top customers chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Top Customers by Tickets</h2>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setView('bar')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${view === 'bar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setView('treemap')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${view === 'treemap' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
                >
                  Treemap
                </button>
              </div>
            </div>

            <div className="h-56">
              {view === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="customer_name"
                      axisLine={false} tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={n => n.split(' ')[0]}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="ticket_count" radius={[5, 5, 0, 0]} maxBarSize={40}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={TICKET_BAR_COLORS[i % TICKET_BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={top_by_tickets.slice(0, 10).map(c => ({ name: c.customer_name, size: c.ticket_count }))}
                    dataKey="size"
                    content={<TreemapContent />}
                  />
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Two tables: top by tickets + needs attention ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top by ticket volume */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  Most Active Customers
                </h2>
                <span className="text-xs text-slate-400">{top_by_tickets.length} customers</span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search customers…"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {filteredTop.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No customers match your search.</div>
              )}
              {filteredTop.map((c, idx) => {
                const max = top_by_tickets[0]?.ticket_count ?? 1;
                const pct = Math.round((c.ticket_count / max) * 100);
                return (
                  <div
                    key={c.account_number}
                    onClick={() => router.visit(`/support/tickets?search=${encodeURIComponent(c.account_number)}`)}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* Rank */}
                    <span className="text-xs font-bold text-slate-300 w-5 shrink-0 text-center">
                      {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                    </span>

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg ${avatarBg(c.customer_name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials(c.customer_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.customer_name}</p>
                      <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: TICKET_BAR_COLORS[idx % TICKET_BAR_COLORS.length] }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Ticket size={12} className="text-indigo-400" />
                        {c.ticket_count}
                      </span>
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Needs Attention
                </h2>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${needs_attention.length > 0 ? 'text-red-600 bg-red-50 border border-red-200' : 'text-emerald-600 bg-emerald-50 border border-emerald-200'}`}>
                  {needs_attention.length > 0 ? `${needs_attention.length} customers` : 'All clear ✓'}
                </span>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={attentionSearch}
                  onChange={e => setAttSearch(e.target.value)}
                  placeholder="Search customers…"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {needs_attention.length === 0 && (
                <div className="py-12 text-center">
                  <Activity size={28} className="text-emerald-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No customers need urgent attention right now.</p>
                </div>
              )}
              {filteredAttention.map((c) => {
                const urg = urgencyStyle(c.critical_count, c.open_count);
                return (
                  <div
                    key={c.account_number}
                    onClick={() => router.visit(`/support/tickets?search=${encodeURIComponent(c.account_number)}&status=open`)}
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    {/* Urgency dot */}
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${urg.dot} ${c.critical_count > 0 ? 'animate-pulse' : ''}`} />

                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-lg ${avatarBg(c.customer_name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {initials(c.customer_name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.customer_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">{c.account_number}</span>
                        {c.critical_count > 0 && (
                          <span className="text-xs font-bold text-red-600">
                            {c.critical_count} critical
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${urg.color} ${urg.bg} ${urg.border}`}>
                        {urg.label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{c.open_count} open</span>
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary footer */}
            {needs_attention.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">{totalOpenTickets}</span> open tickets ·{' '}
                  <span className={`font-bold ${totalCritical > 0 ? 'text-red-600' : 'text-slate-700'}`}>{totalCritical} critical</span>
                </p>
                <Link
                  href="/support/tickets?status=open&priority=critical"
                  className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  View critical <ChevronRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'All Customers',     href: '/customers/list',      color: 'indigo', icon: <Users size={14} /> },
            { label: 'SLA Report',        href: '/dashboard/sla',       color: 'violet', icon: <Eye size={14} /> },
            { label: 'Performance',       href: '/dashboard/performance', color: 'blue', icon: <TrendingUp size={14} /> },
            { label: 'Back to Dashboard', href: '/dashboard',           color: 'slate',  icon: <ArrowLeft size={14} /> },
          ].map(({ label, href, color, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl bg-${color}-50 border border-${color}-200 hover:bg-${color}-100 transition-colors group`}
            >
              <span className={`text-xs font-semibold text-${color}-700 flex items-center gap-2`}>
                {icon} {label}
              </span>
              <ChevronRight size={13} className={`text-${color}-300 group-hover:translate-x-0.5 transition-transform`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, iconBg, valueColor = 'text-slate-900',
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; iconBg: string; valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
