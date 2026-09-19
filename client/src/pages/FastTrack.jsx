import React, { useState } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  Square,
  CheckSquare,
  AlertTriangle,
  Sparkles,
  Loader2,
  Flame,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const FastTrack = () => {
  const { profile } = useProfile();
  const [selectedTimeframe, setSelectedTimeframe] = useState('3 Hours');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [completedMap, setCompletedMap] = useState({});
  const [error, setError] = useState('');

  const timeframes = ['1 Hour', '3 Hours', '6 Hours', '12 Hours'];

  const handleGenerate = async (tfToUse) => {
    const timeframe = tfToUse || selectedTimeframe;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/fast-track/generate', {
        timeframe,
        company: profile?.company,
        role: profile?.role,
        jobDescription: profile?.jobDescription,
        resumeText: profile?.resumeText,
      });

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate fast track guide.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (idx) => {
    setCompletedMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Emergency Interview Sprint</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Fast Track Preparation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prioritized high-yield revision when you have very limited time before your interview
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setSelectedTimeframe(tf);
                handleGenerate(tf);
              }}
              disabled={loading}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTimeframe === tf
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial Empty State */}
      {!data && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Zap className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Emergency Time Crunch?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select whether you have 1 hour, 3 hours, 6 hours, or 12 hours left to generate an ultra-lean
              high-priority checklist.
            </p>
          </div>
          <button
            onClick={() => handleGenerate(selectedTimeframe)}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate {selectedTimeframe} Fast Track</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-semibold text-slate-700">
            Extracting top-priority revision points for {selectedTimeframe}...
          </p>
        </div>
      )}

      {/* Fast Track Results List */}
      {data && !loading && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Top Priority Sprints ({data.timeframe})
              </span>
            </div>
            <span className="text-xs font-medium text-amber-800">
              Focus on highest ROI topics first
            </span>
          </div>

          <div className="space-y-3">
            {data.urgentChecklist?.map((item, idx) => {
              const isChecked = completedMap[idx];

              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-white border-slate-200/80 hover:border-amber-300 shadow-card'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`font-bold text-sm sm:text-base ${
                          isChecked ? 'line-through text-emerald-800' : 'text-slate-900'
                        }`}
                      >
                        {item.priority}. {item.title}
                      </h4>
                      {item.estTime && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{item.estTime}</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm ${isChecked ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {item.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FastTrack;
