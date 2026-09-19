import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Building,
  Calendar,
  Zap,
  Clock,
  Bot,
  Bookmark,
  History,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Flame,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isProfileComplete } = useProfile();

  const modules = [
    {
      title: 'Resume ATS Scanner',
      description: 'Analyze ATS score, keyword match %, matched & missing skills against your target JD.',
      path: '/ats-scanner',
      icon: FileSearch,
      color: 'from-blue-500 to-indigo-600',
      badge: 'High Impact',
    },
    {
      title: 'Interview Preparation',
      description: 'Practice 5 categories: Technical, HR, Behavioural, Role-Specific, and Company-Specific.',
      path: '/interview-prep',
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Core Prep',
    },
    {
      title: 'Resume-Based Questions',
      description: 'Deep-dive questions targeting the specific projects, skills, and architecture on your resume.',
      path: '/resume-questions',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-600',
      badge: 'Personalized',
    },
    {
      title: 'Skill Gap Analyzer',
      description: 'Compare your resume against the JD to discover High, Medium, and Low priority gaps.',
      path: '/skill-gap',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Insights',
    },
    {
      title: 'Company Research',
      description: 'Get company overview, major products, typical interview rounds, and preparation tips.',
      path: '/company-research',
      icon: Building,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Intelligence',
    },
    {
      title: 'Roadmap Generator',
      description: 'Generate customized day-by-day prep roadmaps for 3, 7, 15, or 30 days.',
      path: '/roadmap',
      icon: Calendar,
      color: 'from-violet-500 to-indigo-700',
      badge: 'Structured',
    },
    {
      title: 'Fast Track (Urgent)',
      description: 'High-priority emergency revision checklists for 1h, 3h, 6h, or 12h timeframes.',
      path: '/fast-track',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      badge: 'Express',
    },
    {
      title: 'Last Minute Guide',
      description: 'Compact final revision summary: key CS topics, must-know questions, and checklist.',
      path: '/last-minute',
      icon: Clock,
      color: 'from-rose-500 to-red-600',
      badge: 'Quick Scan',
    },
    {
      title: 'AI Career Assistant',
      description: 'Context-aware AI chatbot loaded with your resume, JD, and company background.',
      path: '/career-assistant',
      icon: Bot,
      color: 'from-fuchsia-500 to-indigo-600',
      badge: 'Interactive',
    },
    {
      title: 'Saved Bookmarks & History',
      description: 'Review saved questions, study notes, and browse your past preparation history.',
      path: '/bookmarks',
      icon: Bookmark,
      color: 'from-slate-600 to-slate-800',
      badge: 'Saved',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI-Powered Career Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {user?.name || 'Candidate'}! 👋
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Targeting <strong className="text-white">{profile?.role || 'Software Role'}</strong> at{' '}
              <strong className="text-white">{profile?.company || 'Top Tech Companies'}</strong>.
              Your personalized interview prep ecosystem is ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/interview-prep"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition-all"
            >
              <span>Start Interview Prep</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ats-scanner"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-semibold text-sm transition-all"
            >
              <span>Run ATS Scan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Readiness Callout */}
      {!isProfileComplete && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Setup your Target Profile for Best AI Results
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Upload your resume PDF and paste the target Job Description once in your profile.
                All 10 modules will automatically use this context.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <span>Set Profile Context</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Grid of All 10 Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Interview Preparation Modules</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
              10 Modules
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link
                key={idx}
                to={mod.path}
                className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:shadow-hover hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                      {mod.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                  <span>Open Module</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
