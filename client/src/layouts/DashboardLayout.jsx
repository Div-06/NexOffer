import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Building,
  Calendar,
  Zap,
  Clock,
  Bot,
  Bookmark,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileStatusBanner from '../components/common/ProfileStatusBanner';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Preparation',
      items: [
        { name: 'Interview Prep', path: '/interview-prep', icon: HelpCircle },
        { name: 'Resume Questions', path: '/resume-questions', icon: Sparkles },
        { name: 'Fast Track (Urgent)', path: '/fast-track', icon: Zap },
        { name: 'Last Minute Guide', path: '/last-minute', icon: Clock },
        { name: 'Roadmap Generator', path: '/roadmap', icon: Calendar },
      ],
    },
    {
      group: 'Resume & Skills',
      items: [
        { name: 'ATS Scanner', path: '/ats-scanner', icon: FileSearch },
        { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: TrendingUp },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { name: 'Company Research', path: '/company-research', icon: Building },
        { name: 'AI Career Assistant', path: '/career-assistant', icon: Bot, badge: 'AI' },
      ],
    },
    {
      group: 'Saved & History',
      items: [
        { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
        { name: 'Preparation History', path: '/history', icon: History },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('ats-scanner')) return 'Resume ATS Scanner';
    if (path.includes('interview-prep')) return 'Interview Preparation';
    if (path.includes('resume-questions')) return 'Resume-Based Questions';
    if (path.includes('skill-gap')) return 'Skill Gap Analyzer';
    if (path.includes('company-research')) return 'Company Research';
    if (path.includes('roadmap')) return 'Roadmap Generator';
    if (path.includes('fast-track')) return 'Fast Track Preparation';
    if (path.includes('last-minute')) return 'Last Minute Guide';
    if (path.includes('career-assistant')) return 'AI Career Assistant';
    if (path.includes('bookmarks')) return 'Saved Bookmarks';
    if (path.includes('history')) return 'Preparation History';
    if (path.includes('profile')) return 'My Profile & Resume Context';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-[#0c1322]">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-600/30">
              N
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors">
                NexOffer
              </span>
              <span className="block text-[10px] uppercase font-semibold text-brand-400 tracking-wider">
                Interview AI
              </span>
            </div>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {group.group}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-brand-400/20 text-brand-300 border border-brand-400/30 px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer Profile & Settings */}
        <div className="p-4 border-t border-slate-800 bg-[#0c1322] space-y-2">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>Profile & Resume</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-900">{user?.name || 'Candidate'}</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[150px]">{user?.email}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-indigo-100">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Top context status card */}
          {location.pathname !== '/profile' && <ProfileStatusBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
