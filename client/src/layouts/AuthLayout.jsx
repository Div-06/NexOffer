import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, CheckCircle, Shield, Zap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient gradient blurs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-brand-600/25 group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900 block">
              NexOffer
            </span>
            <span className="text-xs font-semibold text-brand-600 tracking-wide">
              Your Next Offer Starts Here.
            </span>
          </div>
        </Link>
      </div>

      {/* Card Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft border border-slate-200/80 rounded-3xl">
          <Outlet />
        </div>

        {/* Feature Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Upload Once, Reuse Everywhere
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Multi-LLM Failover
          </span>
          <span className="inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-500" /> Verified OTP Security
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
