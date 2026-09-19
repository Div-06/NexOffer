import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
  AlertCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const RoadmapGenerator = () => {
  const { profile } = useProfile();
  const [selectedDays, setSelectedDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [completedTopics, setCompletedTopics] = useState({});
  const [error, setError] = useState('');

  const dayOptions = [
    { label: '3 Days', days: 3, subtitle: 'Crash Sprint' },
    { label: '7 Days', days: 7, subtitle: 'Standard Prep' },
    { label: '15 Days', days: 15, subtitle: 'Comprehensive' },
    { label: '30 Days', days: 30, subtitle: 'Mastery' },
  ];

  const handleGenerate = async (daysToUse) => {
    const days = daysToUse || selectedDays;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/roadmap/generate', {
        days,
        company: profile?.company,
        role: profile?.role,
        jobDescription: profile?.jobDescription,
        resumeText: profile?.resumeText,
      });

      if (res.data?.success) {
        setRoadmap(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate preparation roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCheck = (topicKey) => {
    setCompletedTopics((prev) => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Time-Boxed Preparation Schedule</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Roadmap Generator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized day-by-day study schedule prioritizing missing skills from your target JD
          </p>
        </div>

        {/* Days selector pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {dayOptions.map((opt) => (
            <button
              key={opt.days}
              onClick={() => {
                setSelectedDays(opt.days);
                handleGenerate(opt.days);
              }}
              disabled={loading}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDays === opt.days
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial Empty State */}
      {!roadmap && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Build Your Custom Timeline</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your available preparation window (3, 7, 15, or 30 days) to generate a structured
              step-by-step roadmap.
            </p>
          </div>
          <button
            onClick={() => handleGenerate(selectedDays)}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate {selectedDays}-Day Roadmap</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-card flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-sm font-semibold text-slate-700">
            Synthesizing {selectedDays}-day personalized roadmap...
          </p>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmap && !loading && (
        <div className="space-y-6">
          <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-800 block">
                Active Roadmap
              </span>
              <h3 className="text-base font-bold text-violet-950">
                {roadmap.totalDays} Days to {roadmap.targetRole || 'Software Role'} at {roadmap.company || 'Target Company'}
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-white text-violet-700 rounded-full border border-violet-200 shadow-xs self-start sm:self-auto">
              Interactive Checklist
            </span>
          </div>

          <div className="space-y-4">
            {roadmap.schedule?.map((dayPlan, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card hover:border-violet-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-800 font-extrabold flex items-center justify-center text-sm shadow-xs">
                      {dayPlan.day?.replace(/[^0-9]/g, '') || idx + 1}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">
                        {dayPlan.day}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {dayPlan.title}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Topics list with checkboxes */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Focus Topics:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dayPlan.topics?.map((topic, tIdx) => {
                      const topicKey = `${dayPlan.day}-${tIdx}`;
                      const isDone = completedTopics[topicKey];

                      return (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => toggleTopicCheck(topicKey)}
                          className={`p-3 rounded-xl text-left text-xs font-medium flex items-start gap-2.5 transition-all ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 line-through opacity-75'
                              : 'bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deliverable Action */}
                {dayPlan.deliverable && (
                  <div className="p-3 bg-violet-50/60 border border-violet-100 rounded-xl text-xs text-violet-900 flex items-start gap-2">
                    <Award className="w-4 h-4 text-violet-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="font-bold">Daily Milestone:</strong> {dayPlan.deliverable}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
