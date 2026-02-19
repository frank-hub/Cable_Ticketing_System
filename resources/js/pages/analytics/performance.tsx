import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
  ArrowLeft, Users, Clock, CheckCircle2, TrendingUp, TrendingDown,
  Minus, BarChart3, Award, AlertTriangle, ChevronUp, ChevronDown,
  Activity, Zap, Target,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line,
  Cell,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AgentStat {
  name:                  string;
  email:                 string;
  total_assigned:        number;
  total_resolved:        number;
  resolution_rate:       number;
  avg_resolution_hours:  number | null;
  avg_response_hours:    number | null;
}

interface CategoryRow {
  category: string;
  count:    number;
}

interface PageProps {
  success:            boolean;
  agent_stats:        AgentStat[];
  category_breakdown: CategoryRow[];
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type SortKey = 'resolution_rate' | 'total_assigned' | 'total_resolved' | 'avg_resolution_hours' | 'avg_response_hours';

const CAT_COLORS = ['#6366f1','#f59e0b','#10b981','#ef4444','#8b5cf6','#14b8a6','#f97316'];

const getRateStyle = (rate: number) => {
  if (rate >= 90) return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: '#10b981', label: 'Excellent' };
  if (rate >= 75) return { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    bar: '#3b82f6', label: 'Good'      };
  if (rate >= 50) return { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   bar: '#f59e0b', label: 'Fair'      };
  return               { color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',     bar: '#ef4444', label: 'Poor'      };
};

const fmtHours = (h: number | null) => h == null ? '—' : h >= 24 ? `${(h / 24).toFixed(1)}d` : `${h}h`;

const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const avatarColor = (name: string) => {
  const colors = ['bg-indigo-500','bg-violet-500','bg-blue-500','bg-teal-500','bg-emerald-500','bg-amber-500','bg-rose-500'];
  return colors[name.charCodeAt(0) % colors.length];
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricPill({ value, label, positive }: { value: string; label: string; positive?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${positive === undefined ? 'text-slate-800' : positive ? 'text-emerald-600' : 'text-red-600'}`}>
        {value}
      </p>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function SortButton({
  label, sortKey, current, order, onClick,
}: {
  label: string; sortKey: SortKey; current: SortKey; order: 'asc' | 'desc'; onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
        ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
    >
      {label}
      {active && (order === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
    </button>
  );
}

// ── Radar chart for top agent ─────────────────────────────────────────────────

function AgentRadar({ agent }: { agent: AgentStat }) {
  const radarData = [
    { metric: 'Resolution Rate', value: agent.resolution_rate },
    { metric: 'Response Speed', value: agent.avg_response_hours != null ? Math.max(0, 100 - agent.avg_response_hours * 5) : 50 },
    { metric: 'Tickets Handled', value: Math.min(100, agent.total_assigned * 5) },
    { metric: 'Resolve Speed',   value: agent.avg_resolution_hours != null ? Math.max(0, 100 - agent.avg_resolution_hours * 2) : 50 },
    { metric: 'Throughput',      value: agent.total_assigned > 0 ? Math.min(100, (agent.total_resolved / agent.total_assigned) * 100) : 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={radarData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Radar name={agent.name} dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
          formatter={(v: number) => [`${v.toFixed(0)}`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Performance() {
  const { agent_stats, category_breakdown } = usePage<PageProps>().props;

  const [sortKey, setSortKey]   = useState<SortKey>('resolution_rate');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Sort agents
  const sorted = [...agent_stats].sort((a, b) => {
    const av = a[sortKey] ?? -1;
    const bv = b[sortKey] ?? -1;
    return sortOrder === 'desc' ? (bv as number) - (av as number) : (av as number) - (bv as number);
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortOrder('desc'); }
  };

  // Aggregates
  const totalAssigned  = agent_stats.reduce((s, a) => s + a.total_assigned, 0);
  const totalResolved  = agent_stats.reduce((s, a) => s + a.total_resolved, 0);
  const overallRate    = totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0;
  const avgResponseAll = agent_stats.filter(a => a.avg_response_hours != null);
  const avgResponse    = avgResponseAll.length
    ? (avgResponseAll.reduce((s, a) => s + (a.avg_response_hours ?? 0), 0) / avgResponseAll.length).toFixed(1)
    : '—';

  // Top performer
  const topAgent = [...agent_stats].sort((a, b) => b.resolution_rate - a.resolution_rate)[0] ?? null;

  // Category chart data
  const catData = category_breakdown.map((c, i) => ({
    name:  c.category.charAt(0).toUpperCase() + c.category.slice(1),
    count: c.count,
    fill:  CAT_COLORS[i % CAT_COLORS.length],
  }));

  const totalCatTickets = category_breakdown.reduce((s, c) => s + c.count, 0);

  const selectedAgentData = agent_stats.find(a => a.name === selectedAgent) ?? null;

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
              <BarChart3 size={20} className="text-indigo-500" />
              Performance Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Agent productivity and ticket category breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700">
          <Activity size={13} />
          {agent_stats.length} agents tracked
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Summary row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard icon={<Users size={18} className="text-indigo-500" />}   label="Total Agents"       value={agent_stats.length}        sub="active agents"              iconBg="bg-indigo-50" />
          <SummaryCard icon={<Target size={18} className="text-blue-500" />}    label="Tickets Assigned"   value={totalAssigned}             sub="across all agents"          iconBg="bg-blue-50" />
          <SummaryCard icon={<CheckCircle2 size={18} className="text-emerald-500" />} label="Tickets Resolved" value={totalResolved}          sub={`${overallRate}% resolution rate`} iconBg="bg-emerald-50" valueColor={overallRate >= 75 ? 'text-emerald-600' : 'text-red-600'} />
          <SummaryCard icon={<Zap size={18} className="text-amber-500" />}      label="Avg Response Time"  value={avgResponse === '—' ? '—' : `${avgResponse}h`} sub="team average" iconBg="bg-amber-50" />
        </div>

        {/* ── Top Performer spotlight ── */}
        {topAgent && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex items-center gap-6 shadow-lg shadow-indigo-500/20">
            <div className={`w-16 h-16 rounded-2xl ${avatarColor(topAgent.name)} flex items-center justify-center text-white text-xl font-bold shadow-lg shrink-0`}>
              {initials(topAgent.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-amber-300" />
                <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Top Performer</span>
              </div>
              <h2 className="text-white text-xl font-bold">{topAgent.name}</h2>
              <p className="text-indigo-200 text-sm truncate">{topAgent.email}</p>
            </div>
            <div className="hidden md:flex items-center gap-8 shrink-0">
              <div className="text-center">
                <p className="text-white text-2xl font-bold">{topAgent.resolution_rate}%</p>
                <p className="text-indigo-200 text-xs">Resolution Rate</p>
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-bold">{topAgent.total_resolved}</p>
                <p className="text-indigo-200 text-xs">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-white text-2xl font-bold">{fmtHours(topAgent.avg_response_hours)}</p>
                <p className="text-indigo-200 text-xs">Avg Response</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Agent table — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">Agent Leaderboard</h2>
                <span className="text-xs text-slate-400">{agent_stats.length} agents</span>
              </div>
              {/* Sort controls */}
              <div className="flex flex-wrap gap-2">
                <SortButton label="Resolution Rate" sortKey="resolution_rate"    current={sortKey} order={sortOrder} onClick={handleSort} />
                <SortButton label="Assigned"        sortKey="total_assigned"     current={sortKey} order={sortOrder} onClick={handleSort} />
                <SortButton label="Resolved"        sortKey="total_resolved"     current={sortKey} order={sortOrder} onClick={handleSort} />
                <SortButton label="Resolve Time"    sortKey="avg_resolution_hours" current={sortKey} order={sortOrder} onClick={handleSort} />
                <SortButton label="Response Time"   sortKey="avg_response_hours" current={sortKey} order={sortOrder} onClick={handleSort} />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {sorted.map((agent, idx) => {
                const style      = getRateStyle(agent.resolution_rate);
                const isSelected = selectedAgent === agent.name;
                const isTop      = idx === 0 && sortKey === 'resolution_rate' && sortOrder === 'desc';

                return (
                  <div
                    key={agent.email}
                    onClick={() => setSelectedAgent(isSelected ? null : agent.name)}
                    className={`px-6 py-4 cursor-pointer transition-colors
                      ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank + Avatar */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-bold w-5 text-center ${isTop ? 'text-amber-500' : 'text-slate-300'}`}>
                          {isTop ? '🥇' : `#${idx + 1}`}
                        </span>
                        <div className={`w-9 h-9 rounded-xl ${avatarColor(agent.name)} flex items-center justify-center text-white text-sm font-bold`}>
                          {initials(agent.name)}
                        </div>
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{agent.name}</p>
                        <p className="text-xs text-slate-400 truncate">{agent.email}</p>
                      </div>

                      {/* Metrics */}
                      <div className="hidden sm:flex items-center gap-6">
                        <MetricPill value={String(agent.total_assigned)} label="Assigned" />
                        <MetricPill value={String(agent.total_resolved)} label="Resolved" positive={agent.total_resolved > 0} />
                        <MetricPill value={fmtHours(agent.avg_response_hours)} label="Response" />
                        <MetricPill value={fmtHours(agent.avg_resolution_hours)} label="Resolve" />
                      </div>

                      {/* Rate badge */}
                      <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 ${style.color} ${style.bg} ${style.border}`}>
                        {agent.resolution_rate}%
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 ml-14">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${agent.resolution_rate}%`, backgroundColor: style.bar }}
                        />
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div className="mt-4 ml-14 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <DetailCard label="Assigned"         value={String(agent.total_assigned)} icon={<Target size={13} className="text-indigo-500" />} />
                        <DetailCard label="Resolved"         value={String(agent.total_resolved)} icon={<CheckCircle2 size={13} className="text-emerald-500" />} />
                        <DetailCard label="Avg Response"     value={fmtHours(agent.avg_response_hours)} icon={<Zap size={13} className="text-amber-500" />} />
                        <DetailCard label="Avg Resolution"   value={fmtHours(agent.avg_resolution_hours)} icon={<Clock size={13} className="text-blue-500" />} />
                        {agent.total_assigned === 0 && (
                          <div className="col-span-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                            <AlertTriangle size={13} className="text-amber-400" />
                            No tickets assigned to this agent yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {agent_stats.length === 0 && (
                <div className="py-16 text-center">
                  <Users size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No agent data available yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel — 1/3 */}
          <div className="space-y-5">

            {/* Radar for selected or top agent */}
            {(selectedAgentData ?? topAgent) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  {selectedAgentData ? selectedAgentData.name : topAgent!.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4">Performance radar</p>
                <div className="h-52">
                  <AgentRadar agent={selectedAgentData ?? topAgent!} />
                </div>
              </div>
            )}

            {/* Category breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Tickets by Category</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                      formatter={(v: number) => [v, 'Tickets']}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                      {catData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category list */}
              <div className="mt-4 space-y-2">
                {category_breakdown.map((c, i) => {
                  const pct = totalCatTickets > 0 ? Math.round((c.count / totalCatTickets) * 100) : 0;
                  return (
                    <div key={c.category} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                      <span className="text-slate-600 capitalize flex-1">{c.category}</span>
                      <span className="font-semibold text-slate-800">{c.count}</span>
                      <span className="text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall team rate */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Team Overview</h3>
              <div className="space-y-3">
                <OverviewRow label="Overall Resolution Rate" value={`${overallRate}%`} positive={overallRate >= 75} />
                <OverviewRow label="Total Assigned"          value={String(totalAssigned)} />
                <OverviewRow label="Total Resolved"          value={String(totalResolved)} positive={totalResolved > 0} />
                <OverviewRow label="Avg Team Response"       value={avgResponse === '—' ? '—' : `${avgResponse}h`} />
                <OverviewRow label="Active Agents"           value={String(agent_stats.filter(a => a.total_assigned > 0).length)} />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Team resolution rate</span>
                  <span className={`font-bold ${overallRate >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>{overallRate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${overallRate}%`,
                      backgroundColor: overallRate >= 90 ? '#10b981' : overallRate >= 75 ? '#3b82f6' : overallRate >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Navigate</h3>
              <div className="space-y-2">
                {[
                  { label: 'SLA Report',          href: '/dashboard/sla',      color: 'indigo' },
                  { label: 'Customer Insights',   href: '/dashboard/insights', color: 'violet' },
                  { label: 'All Tickets',         href: '/support/tickets',    color: 'blue'   },
                  { label: 'Back to Dashboard',   href: '/dashboard',          color: 'slate'  },
                ].map(({ label, href, color }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl bg-${color}-50 border border-${color}-200 hover:bg-${color}-100 transition-colors group text-xs font-semibold text-${color}-700`}
                  >
                    {label}
                    <TrendingUp size={13} className={`text-${color}-400 group-hover:translate-x-0.5 transition-transform`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Micro components ──────────────────────────────────────────────────────────

function SummaryCard({
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

function DetailCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 flex items-center gap-2 shadow-sm">
      <div className="p-1.5 rounded-lg bg-slate-50">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function OverviewRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${positive === undefined ? 'text-slate-800' : positive ? 'text-emerald-600' : 'text-red-500'}`}>
        {value}
      </span>
    </div>
  );
}

