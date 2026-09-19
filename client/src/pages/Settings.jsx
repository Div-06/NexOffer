import React from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Cpu,
  LogOut,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Preferences & System</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Account & AI Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your account profile, verification status, and centralized LLM Gateway configuration
        </p>
      </div>

      {/* Profile & Account Details */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-indigo-600" />
          <span>User Account Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Full Name
            </span>
            <p className="font-bold text-slate-900">{user?.name || 'Candidate'}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Email Address
            </span>
            <p className="font-bold text-slate-900 truncate">{user?.email}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Account Security Status
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Email OTP Verified Active</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Platform Edition
            </span>
            <p className="font-bold text-slate-900">NexOffer v1.0.0 (College Course Project)</p>
          </div>
        </div>
      </div>

      {/* LLM Gateway Architecture Info */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Cpu className="w-5 h-5 text-brand-600" />
          <span>Centralized LLM Gateway Failover Architecture</span>
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          NexOffer routes all AI requests through a unified gateway to ensure 100% uptime and resilience:
        </p>

        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              1
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Primary Provider: Google Gemini API
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Handles real-time ATS scoring, 5-category interview Q&A, and roadmap generations.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              2
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Automatic Failover: Grok (xAI) API
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Automatically triggered if the primary provider hits quota or rate limits (HTTP 429).
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              3
            </span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                Zero-Downtime Heuristic Fallback Engine
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Guarantees the demo remains fully interactive even when working offline or without external keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white border border-rose-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <h3 className="text-base font-bold text-rose-900 flex items-center gap-2 border-b border-rose-100 pb-3">
          <LogOut className="w-5 h-5 text-rose-600" />
          <span>Session & Logout</span>
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900">Sign Out of Session</h4>
            <p className="text-xs text-slate-500">
              Clears your stored JWT authentication token from this browser.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
