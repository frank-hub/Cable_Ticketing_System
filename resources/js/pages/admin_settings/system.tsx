import React, { useState } from 'react';
import {
  Settings,
  ArrowLeft,
  Home,
  MessageSquare,
  Mail,
  Save,
  Globe,
  Bell,
  Smartphone,
  Server,
  Key
} from 'lucide-react';
import { SystemSettingsProps, MessagingConfig, EmailConfig } from '../types';

const SystemSettings: React.FC<SystemSettingsProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'messaging' | 'email' | 'general'>('messaging');
  const [isSaving, setIsSaving] = useState(false);

  const [messagingConfig, setMessagingConfig] = useState<MessagingConfig>({
    provider: 'AfricaTalking',
    apiKey: 'sk_live_XXXXXXXXXXXXXXXXXXXXXX',
    apiSecret: '••••••••••••••••',
    senderId: 'NEXUS_NET',
    callbackUrl: 'https://api.nexus.com/callbacks/sms',
    enabled: true
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    username: 'apikey',
    password: '••••••••••••••••',
    senderEmail: 'notifications@nexus.com',
    enabled: true
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200 rounded-xl transition-all font-medium group bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center text-sm text-slate-400">
            <Home className="w-4 h-4 mr-1" />
            <span>/ Settings / System Configuration</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
            <p className="text-slate-500">Configure API integrations and system behaviors</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('messaging')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                activeTab === 'messaging'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messaging API
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                activeTab === 'email'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Configuration
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-left ${
                activeTab === 'general'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              General System
            </button>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 animate-fade-in">

              {/* Messaging Config */}
              {activeTab === 'messaging' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-indigo-600" />
                        SMS Gateway Settings
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Configure provider for transactional SMS</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Enabled</span>
                      <button
                        onClick={() => setMessagingConfig({...messagingConfig, enabled: !messagingConfig.enabled})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${messagingConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${messagingConfig.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 transition-opacity">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider</label>
                      <select
                        value={messagingConfig.provider}
                        onChange={(e) => setMessagingConfig({...messagingConfig, provider: e.target.value as any})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                        disabled={!messagingConfig.enabled}
                      >
                        <option value="AfricaTalking">Africa's Talking</option>
                        <option value="Twilio">Twilio</option>
                        <option value="Infobip">Infobip</option>
                        <option value="Custom">Custom Gateway</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Sender ID</label>
                      <input
                        type="text"
                        value={messagingConfig.senderId}
                        onChange={(e) => setMessagingConfig({...messagingConfig, senderId: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        disabled={!messagingConfig.enabled}
                      />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key / Token</label>
                       <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="password"
                            value={messagingConfig.apiKey}
                            onChange={(e) => setMessagingConfig({...messagingConfig, apiKey: e.target.value})}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
                            disabled={!messagingConfig.enabled}
                          />
                       </div>
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1.5">Callback URL</label>
                       <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="url"
                            value={messagingConfig.callbackUrl}
                            onChange={(e) => setMessagingConfig({...messagingConfig, callbackUrl: e.target.value})}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-600"
                            disabled={!messagingConfig.enabled}
                          />
                       </div>
                       <p className="text-xs text-slate-400 mt-1">Webhook endpoint for delivery reports</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Config */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Server className="w-5 h-5 text-indigo-600" />
                        SMTP Server Settings
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Configure outgoing email server</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">Enabled</span>
                      <button
                        onClick={() => setEmailConfig({...emailConfig, enabled: !emailConfig.enabled})}
                        className={`w-12 h-6 rounded-full transition-colors relative ${emailConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${emailConfig.enabled ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">SMTP Host</label>
                      <input
                        type="text"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
                        disabled={!emailConfig.enabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Port</label>
                      <input
                        type="text"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({...emailConfig, smtpPort: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
                        disabled={!emailConfig.enabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">From Address</label>
                      <input
                        type="email"
                        value={emailConfig.senderEmail}
                        onChange={(e) => setEmailConfig({...emailConfig, senderEmail: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        disabled={!emailConfig.enabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                      <input
                        type="text"
                        value={emailConfig.username}
                        onChange={(e) => setEmailConfig({...emailConfig, username: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        disabled={!emailConfig.enabled}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <input
                        type="password"
                        value={emailConfig.password}
                        onChange={(e) => setEmailConfig({...emailConfig, password: e.target.value})}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        disabled={!emailConfig.enabled}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* General Config Placeholder */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" />
                        General Configuration
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Global application settings</p>
                    </div>
                  </div>
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Settings className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Global system settings configuration will be available here.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
