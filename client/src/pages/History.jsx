import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  Loader2,
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import api from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history');
      if (res.data?.history) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all preparation activity logs?')) return;
    try {
      await api.delete('/history');
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const getModuleLink = (moduleName) => {
    switch (moduleName) {
      case 'ATS Scanner':
        return '/ats-scanner';
      case 'Interview Preparation':
        return '/interview-prep';
      case 'Resume Questions':
        return '/resume-questions';
      case 'Skill Gap Analyzer':
        return '/skill-gap';
      case 'Company Research':
        return '/company-research';
      case 'Roadmap Generator':
        return '/roadmap';
      case 'Fast Track Prep':
        return '/fast-track';
      case 'Last Minute Guide':
        return '/last-minute';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Preparation Logs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Preparation History ({history.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and relaunch previous AI generation sessions
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">Loading preparation history...</p>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No History Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            When you run interview modules, ATS scans, or roadmaps, a summary of your session will appear here.
          </p>
        </div>
      )}

      {/* History Timeline */}
      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-md">
                    {item.module}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{item.company || 'General Company'}</span>
                  <span className="text-slate-400 font-normal">&bull;</span>
                  <span className="text-slate-600 font-medium">{item.role || 'Software Role'}</span>
                </h4>

                {item.summary && (
                  <p className="text-xs text-slate-500 leading-relaxed">{item.summary}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={getModuleLink(item.module)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDeleteItem(item._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
