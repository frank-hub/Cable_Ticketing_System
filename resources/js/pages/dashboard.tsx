import React, { useState } from 'react';
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Ticket,
  MessageSquare,
  CreditCard,
  Wifi,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Hexagon,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { JSX } from 'react/jsx-runtime';

const CableOneTicketingSystem = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ 'support': true });
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    accountNumber: '',
    phone: '',
    email: '',
    subject: '',
    category: 'connectivity',
    priority: 'medium',
    description: ''
  });

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (id: React.SetStateAction<string>, path: string) => {
    setActiveMenu(id);
  };

  const isActive = (id: string) => activeMenu === id;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users size={20} />,
      path: '/customers',
      subItems: [
        { id: 'customer-list', label: 'Customer List', path: '/customers/list' },
        { id: 'installations', label: 'Installations', path: '/customers/installations' },
        { id: 'leads', label: 'Leads', path: '/customers/leads' }
      ]
    },
    {
      id: 'support',
      label: 'Customer Support',
      icon: <MessageSquare size={20} />,
      path: '/support',
      subItems: [
        { id: 'tickets', label: 'Tickets', path: '/support/tickets' },
        // { id: 'support-requests', label: 'Support Requests', path: '/support/requests' },
        // { id: 'escalations', label: 'Escalations', path: '/support/escalations' }
      ]
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: <CreditCard size={20} />,
      path: '/billing',
      subItems: [
        { id: 'invoices', label: 'Invoices', path: '/billing/invoices' },
        { id: 'payments', label: 'Payments', path: '/billing/payments' },
        { id: 'packages', label: 'Packages', path: '/billing/packages' }
      ]
    },
    {
      id: 'network',
      label: 'Network',
      icon: <Wifi size={20} />,
      path: '/network',
      subItems: [
        { id: 'routers', label: 'Routers', path: '/network/routers' },
        { id: 'services', label: 'Services', path: '/network/services' },
        { id: 'monitoring', label: 'Monitoring', path: '/network/monitoring' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <BarChart3 size={20} />,
      path: '/analytics',
      subItems: [
        { id: 'sla-reports', label: 'SLA Reports', path: '/analytics/sla' },
        { id: 'performance', label: 'Performance', path: '/analytics/performance' },
        { id: 'customer-insights', label: 'Customer Insights', path: '/analytics/insights' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
      subItems: [
        { id: 'users', label: 'Users & Roles', path: '/settings/users' },
        { id: 'notifications', label: 'Notifications', path: '/settings/notifications' },
        { id: 'sla-config', label: 'SLA Configuration', path: '/settings/sla' },
        { id: 'system', label: 'System Settings', path: '/settings/system' }
      ]
    }
  ];

  const renderMenuItem = (item: { id: string; label: string; icon?: JSX.Element; path: string; subItems?: undefined; } | { id: string; label: string; icon?: JSX.Element; path: string; subItems: { id: string; label: string; path: string; }[]; }, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item.id];
    const active = isActive(item.id);

    const baseClasses = "flex items-center w-full p-3 transition-colors duration-200 cursor-pointer rounded-lg mb-1";
    const activeClasses = "bg-indigo-600 text-white shadow-md shadow-indigo-500/20";
    const inactiveClasses = "text-slate-400 hover:bg-slate-800 hover:text-white";
    const paddingLeft = depth === 0 ? '' : 'pl-11';

    return (
      <div key={item.id}>
        <div
          onClick={() => hasSubItems ? toggleMenu(item.id) : handleNavigate(item.id, item.path)}
          className={`${baseClasses} ${active && !hasSubItems ? activeClasses : inactiveClasses} ${paddingLeft}`}
        >
          <div className="flex items-center flex-1">
            {item.icon && (
              <span className={active && !hasSubItems ? "text-white" : "text-slate-400"}>
                {item.icon}
              </span>
            )}
            <span className="ml-3 font-medium text-sm">{item.label}</span>
          </div>
          {hasSubItems && (
            <span className="text-slate-500">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </div>

        {hasSubItems && isExpanded && (
            <div className="ml-4">
                {item.subItems.map(subItem => (
                    <a key={subItem.id || subItem.path} href={subItem.path}>
                        {renderMenuItem(subItem, depth + 1)}
                    </a>
                ))}
            </div>
        )}
      </div>
    );
  };

  // Chart data
  const chartData = [
    { name: 'Mon', revenue: 4000, tickets: 24 },
    { name: 'Tue', revenue: 3000, tickets: 18 },
    { name: 'Wed', revenue: 5000, tickets: 35 },
    { name: 'Thu', revenue: 2780, tickets: 12 },
    { name: 'Fri', revenue: 6890, tickets: 45 },
    { name: 'Sat', revenue: 2390, tickets: 10 },
    { name: 'Sun', revenue: 3490, tickets: 15 },
  ];

  const recentTickets = [
    { id: 'TK-2401', subject: 'Internet Connection Down', customer: 'SLAUGHTERS', status: 'Open', priority: 'CRITICAL', category: 'Connectivity' },
    { id: 'TK-2402', subject: 'Slow Speed Issue', customer: 'PRESTIGE HOSPITAL', status: 'In Progress', priority: 'HIGH', category: 'Performance' },
    { id: 'TK-2403', subject: 'Billing Inquiry', customer: 'OBAMA ESTATE', status: 'Resolved', priority: 'MEDIUM', category: 'Billing' },
  ];

  type StatCardProps = {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon size={24} className={`text-${color.split('-')[1]}-600`} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {change}
        </span>
        <span className="text-slate-400 ml-2">vs last week</span>
      </div>
    </div>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Hexagon className="text-white fill-current" size={24} />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Cable One</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              AD
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-slate-400">System Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
              <p className="text-slate-500">Welcome back, here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets, customers..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <button
                onClick={() => setShowCreateTicket(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Ticket size={18} />
                Create Ticket
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Tickets</p>
              <h3 className="text-3xl font-bold text-slate-900">20</h3>
              <div className="flex items-center mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full w-fit">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% this week
              </div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Open Issues</p>
              <h3 className="text-3xl font-bold text-slate-900">200</h3>
               <div className="flex items-center mt-2 text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full w-fit">
                <Activity className="w-3 h-3 mr-1" />
                Requires Attention
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Resolution Rate</p>
              <h3 className="text-3xl font-bold text-slate-900">89%</h3>
               <div className="flex items-center mt-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full w-fit">
                <CheckCircle className="w-3 h-3 mr-1" />
                Above Target
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Avg Response</p>
              <h3 className="text-3xl font-bold text-slate-900">2.4h</h3>
               <div className="flex items-center mt-2 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full w-fit">
                <Clock className="w-3 h-3 mr-1" />
                Maintained
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Main Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Revenue Analytics</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ticket Volume Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Ticket Volume</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                    <Tooltip
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Tickets Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Support Tickets</h2>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                View All <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-800">{ticket.subject}</p>
                        <p className="text-xs text-slate-500">{ticket.category}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">{ticket.customer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Create New Ticket</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill in the details to create a support ticket</p>
                </div>
                <button
                  onClick={() => setShowCreateTicket(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTicket.customerName}
                      onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={newTicket.accountNumber}
                      onChange={(e) => setNewTicket({ ...newTicket, accountNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newTicket.phone}
                      onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newTicket.email}
                      onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Ticket Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="connectivity">Connectivity Issue</option>
                        <option value="speed">Speed/Performance</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="equipment">Equipment Problem</option>
                        <option value="installation">Installation Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Provide detailed information about the issue..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateTicket(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle ticket creation here
                  console.log('Creating ticket:', newTicket);
                  setShowCreateTicket(false);
                  // Reset form
                  setNewTicket({
                    customerName: '',
                    accountNumber: '',
                    phone: '',
                    email: '',
                    subject: '',
                    category: 'connectivity',
                    priority: 'medium',
                    description: ''
                  });
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
              >
                <Ticket size={18} />
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CableOneTicketingSystem;
