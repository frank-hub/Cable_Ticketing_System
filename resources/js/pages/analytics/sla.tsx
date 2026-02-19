import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, ArrowLeft, TrendingUp,
  TrendingDown, Minus, Info,
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SLARow {
  priority:              string;
  response_time_hours:   number;
  resolution_time_hours: number;
  total:                 number;
  breached:              number;
  compliant:             number;
  compliance_rate:       number;
}

interface PageProps {
  success: boolean;
  data:    SLARow[];
  [key: string]: unknown;
}

// ── Config ────────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<string, {
  color: string; bg: string; border: string;
  ring: string; bar: string; label: string; icon: React.ReactNode;
}> = {
  Critical: {
    color:  'text-red-600',
    bg:     'bg-red-50',
    border: 'border-red-200',
    ring:   '#ef4444',
    bar:    '#ef4444',
    label:  'Critical',
    icon:   <ShieldX size={18} className="text-red-500" />,
  },
  High: {
    color:  'text-orange-600',
    bg:     'bg-orange-50',
    border: 'border-orange-200',
    ring:   '#f97316',
    bar:    '#f97316',
    label:  'High',
    icon:   <ShieldAlert size={18} className="text-orange-500" />,
  },
  Medium: {
    color:  'text-blue-600',
    bg:     'bg-blue-50',
    border: 'border-blue-200',
    ring:   '#3b82f6',
    bar:    '#3b82f6',
    label:  'Medium',
    icon:   <ShieldCheck size={18} className="text-blue-500" />,
  },
  Low: {
    color:  'text-slate-500',
    bg:     'bg-slate-50',
    border: 'border-slate-200',
    ring:   '#94a3b8',
    bar:    '#94a3b8',
    label:  'Low',
    icon:   <ShieldCheck size={18} className="text-slate-400" />,
  },
};

const getComplianceStatus = (rate: number) => {
  if (rate >= 95) return { label: 'Excellent',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', icon: <TrendingUp size={13} /> };
  if (rate >= 80) return { label: 'Good',       color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',  icon: <TrendingUp size={13} /> };
  if (rate >= 60) return { label: 'At Risk',    color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200', icon: <Minus size={13} /> };
  return           { label: 'Critical',  color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   icon: <TrendingDown size={13} /> };
};

const gaugeColor = (rate: number) => {
  if (rate >= 95) return '#10b981';
  if (rate >= 80) return '#3b82f6';
  if (rate >= 60) return '#f59e0b';
  return '#ef4444';
};

// ── Gauge (radial) ────────────────────────────────────────────────────────────

function ComplianceGauge({ rate, priority }: { rate: number; priority: string }) {
  const color = gaugeColor(rate);
  const data  = [{ name: 'compliance', value: rate, fill: color }];

  return (
    <div className="relative w-28 h-28">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="65%" outerRadius="100%"
          startAngle={210} endAngle={-30}
          data={data}
          barSize={10}
        >
          <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f1f5f9' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 leading-none">{rate}%</span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">compliant</span>
      </div>
    </div>
  );
}

// ── Horizontal Breach Bar ─────────────────────────────────────────────────────

function BreachBar({ compliant, breached, total }: { compliant: number; breached: number; total: number }) {
  if (total === 0) return <div className="h-2 bg-slate-100 rounded-full" />;
  const compliantPct = Math.round((compliant / total) * 100);
  const breachedPct  = 100 - compliantPct;

  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
      {compliantPct > 0 && (
        <div className="bg-green-400 rounded-l-full transition-all" style={{ width: `${compliantPct}%` }} />
      )}
      {breachedPct > 0 && (
        <div className="bg-red-400 rounded-r-full transition-all" style={{ width: `${breachedPct}%` }} />
      )}
    </div>
  );
}

// ── Summary bar chart data ────────────────────────────────────────────────────

function SummaryChart({ data }: { data: SLARow[] }) {
  const chartData = data.map(r => ({
    name:      r.priority,
    compliant: r.compliant,
    breached:  r.breached,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 12 }}
          formatter={(v: number, name: string) => [v, name === 'compliant' ? 'Compliant' : 'Breached']}
        />
        <Bar dataKey="compliant" name="compliant" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
        <Bar dataKey="breached"  name="breached"  fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SlaReport() {
  const { data: slaData } = usePage<PageProps>().props;
  const [selected, setSelected] = useState<string | null>(null);

  // Aggregates
  const totalTickets    = slaData.reduce((s, r) => s + r.total, 0);
  const totalBreached   = slaData.reduce((s, r) => s + r.breached, 0);
  const totalCompliant  = slaData.reduce((s, r) => s + r.compliant, 0);
  const overallRate     = totalTickets > 0 ? Math.round((totalCompliant / totalTickets) * 100) : 100;
  const overallStatus   = getComplianceStatus(overallRate);

  const selectedRow = slaData.find(r => r.priority === selected) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-500" />
              SLA Compliance Report
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time tracking of service level agreement performance</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${overallStatus.color} ${overallStatus.bg} ${overallStatus.border}`}>
          {overallStatus.icon}
          Overall: {overallStatus.label}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Overall Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Tickets"
            value={totalTickets}
            sub="across all priorities"
            icon={<Info size={18} className="text-slate-400" />}
            bg="bg-white"
          />
          <SummaryCard
            label="Compliant"
            value={totalCompliant}
            sub={`${overallRate}% compliance rate`}
            icon={<CheckCircle2 size={18} className="text-green-500" />}
            bg="bg-white"
            valueColor="text-green-600"
          />
          <SummaryCard
            label="Breached"
            value={totalBreached}
            sub={totalBreached === 0 ? 'All within SLA 🎉' : 'Needs immediate action'}
            icon={<XCircle size={18} className="text-red-500" />}
            bg="bg-white"
            valueColor={totalBreached > 0 ? 'text-red-600' : 'text-slate-800'}
          />
          <SummaryCard
            label="Overall SLA"
            value={`${overallRate}%`}
            sub={overallStatus.label}
            icon={<ShieldCheck size={18} className={overallRate >= 80 ? 'text-green-500' : 'text-red-500'} />}
            bg={overallRate >= 80 ? 'bg-green-50' : 'bg-red-50'}
            valueColor={overallRate >= 80 ? 'text-green-700' : 'text-red-700'}
          />
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Priority cards — left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            {slaData.map((row) => {
              const meta   = PRIORITY_META[row.priority] ?? PRIORITY_META.Low;
              const status = getComplianceStatus(row.compliance_rate);
              const isSelected = selected === row.priority;

              return (
                <div
                  key={row.priority}
                  onClick={() => setSelected(isSelected ? null : row.priority)}
                  className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all duration-200 overflow-hidden
                    ${isSelected ? `border-indigo-300 ring-2 ring-indigo-100` : 'border-slate-100 hover:border-slate-200 hover:shadow-md'}`}
                >
                  {/* Card header */}
                  <div className="px-6 py-5 flex items-center gap-5">
                    {/* Gauge */}
                    <ComplianceGauge rate={row.compliance_rate} priority={row.priority} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {meta.icon}
                        <span className={`text-base font-bold ${meta.color}`}>{row.priority} Priority</span>
                        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${status.color} ${status.bg} ${status.border}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>

                      {/* Ticket counts */}
                      <div className="flex gap-4 text-sm mb-3">
                        <span className="text-slate-500">
                          <span className="font-bold text-slate-800">{row.total}</span> total
                        </span>
                        <span className="text-green-600">
                          <span className="font-bold">{row.compliant}</span> compliant
                        </span>
                        <span className={row.breached > 0 ? 'text-red-600' : 'text-slate-400'}>
                          <span className="font-bold">{row.breached}</span> breached
                        </span>
                      </div>

                      {/* Breach bar */}
                      <BreachBar compliant={row.compliant} breached={row.breached} total={row.total} />
                    </div>

                    <ChevronRight
                      size={16}
                      className={`text-slate-300 shrink-0 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                    />
                  </div>

                  {/* Expanded SLA targets */}
                  {isSelected && (
                    <div className={`px-6 pb-5 pt-1 border-t ${meta.border} ${meta.bg}`}>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">SLA Targets</p>
                      <div className="grid grid-cols-2 gap-4">
                        <TargetCard
                          label="First Response"
                          target={row.response_time_hours}
                          icon={<Clock size={14} className="text-indigo-500" />}
                        />
                        <TargetCard
                          label="Resolution Time"
                          target={row.resolution_time_hours}
                          icon={<CheckCircle2 size={14} className="text-green-500" />}
                        />
                      </div>

                      {row.breached > 0 && (
                        <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-red-700">
                            <strong>{row.breached} ticket{row.breached > 1 ? 's' : ''}</strong> ha{row.breached === 1 ? 's' : 've'} exceeded
                            the {row.resolution_time_hours}h resolution target for {row.priority.toLowerCase()} priority.
                            {' '}
                            <Link
                              href={`/support/tickets?priority=${row.priority.toLowerCase()}&status=open`}
                              className="underline font-semibold hover:text-red-900"
                              onClick={e => e.stopPropagation()}
                            >
                              View these tickets →
                            </Link>
                          </p>
                        </div>
                      )}

                      {row.breached === 0 && row.total > 0 && (
                        <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                          <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                          <p className="text-xs text-green-700 font-medium">
                            All {row.total} {row.priority.toLowerCase()} priority ticket{row.total !== 1 ? 's' : ''} are within SLA. Well done!
                          </p>
                        </div>
                      )}

                      {row.total === 0 && (
                        <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <Info size={15} className="text-slate-400 shrink-0" />
                          <p className="text-xs text-slate-500">No {row.priority.toLowerCase()} priority tickets at the moment.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Stacked bar chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Compliant vs Breached</h3>
              <div className="h-52">
                <SummaryChart data={slaData} />
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Compliant
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Breached
                </div>
              </div>
            </div>

            {/* SLA targets quick reference */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">SLA Targets Reference</h3>
              <div className="space-y-3">
                {slaData.map(row => {
                  const meta = PRIORITY_META[row.priority] ?? PRIORITY_META.Low;
                  return (
                    <div key={row.priority} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${meta.bg} ${meta.border}`}>
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        <span className={`text-xs font-bold ${meta.color}`}>{row.priority}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">
                          <Clock size={10} className="inline mr-1" />{row.response_time_hours}h response
                        </p>
                        <p className="text-xs text-slate-500">
                          <CheckCircle2 size={10} className="inline mr-1" />{row.resolution_time_hours}h resolve
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/support/tickets?priority=critical&status=open"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldX size={15} className="text-red-500" />
                    <span className="text-xs font-semibold text-red-700">View Critical Tickets</span>
                  </div>
                  <ChevronRight size={14} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/support/tickets?priority=high&status=open"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={15} className="text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700">View High Priority</span>
                  </div>
                  <ChevronRight size={14} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700">Back to Dashboard</span>
                  </div>
                  <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, icon, bg = 'bg-white', valueColor = 'text-slate-900'
}: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; bg?: string; valueColor?: string;
}) {
  return (
    <div className={`${bg} rounded-2xl border border-slate-100 shadow-sm px-5 py-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function TargetCard({ label, target, icon }: { label: string; target: number; icon: React.ReactNode }) {
  const display = target >= 24 ? `${target / 24}d` : `${target}h`;
  return (
    <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-slate-50">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-slate-800">Within {display}</p>
      </div>
    </div>
  );
}
