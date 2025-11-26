import React, { useState } from 'react';
import { Ticket, Headphones, Clock, BarChart3, ArrowRight, CheckCircle, LogIn } from 'lucide-react';

export default function WelcomePage() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    { icon: Ticket, title: 'Ticket Management', description: 'Create, track, and resolve customer tickets efficiently' },
    { icon: Headphones, title: '24/7 Support', description: 'Round-the-clock customer support system' },
    { icon: Clock, title: 'Quick Response', description: 'Automated workflows for faster resolution times' },
    { icon: BarChart3, title: 'Analytics & Reports', description: 'Comprehensive insights into support performance' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header with Login */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Ticket className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">NetBill Pro</h2>
              <p className="text-sm text-gray-600">Ticketing System</p>
            </div>
          </div>

          <a href="/login" className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-blue-600">
            <LogIn size={20} />
            Login
          </a>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left side - Hero */}
            <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <div className="mb-6">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                  ✨ Professional Ticketing Solution
                </div>
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                  Manage Support Tickets with Ease
                </h1>
                <p className="text-blue-100 text-lg mb-8">
                  Streamline your customer support operations with our powerful ticketing system. Handle inquiries, track issues, and deliver exceptional service.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-blue-200" />
                  <span>Unlimited ticket creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-blue-200" />
                  <span>Real-time status tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-blue-200" />
                  <span>Automated notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-blue-200" />
                  <span>Detailed analytics dashboard</span>
                </div>
              </div>

              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-fit"
              >
                <span>Get Started Free</span>
                <ArrowRight
                  className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                  size={24}
                />
              </button>
            </div>

            {/* Right side - Features */}
            <div className="p-12 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                        <feature.icon className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg mb-1">{feature.title}</h4>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-gray-700 font-medium mb-2">🎯 Start improving your support today</p>
                <p className="text-xs text-gray-600">Join hundreds of companies using NetBill Pro for their customer support management.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 NetBill Pro. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </div>
  );
}
