import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  BookOpen,
  HelpCircle,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const SkillGap = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!profile?.resumeText) {
      setError('Please upload your resume in the Profile section first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/skill-gap/analyze', {
        resumeText: profile.resumeText,
        jobDescription: profile.jobDescription,
        company: profile.company,
        role: profile.role,
      });

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze skill gaps.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Resume vs JD Differential</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Skill Gap Analyzer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Identify exact missing technical proficiencies and prioritize your study time
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !profile?.resumeText}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Skill Gaps...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{data ? 'Re-Analyze Skills' : 'Analyze Skill Gap'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            {!profile?.resumeText && (
              <Link to="/profile" className="text-xs underline font-bold text-rose-900 mt-1 block">
                Go to Profile & Upload Resume →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!data && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-sm">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Compare Resume Against JD</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Find out what skills you have, what you're missing, and the fastest way to bridge each gap.
            </p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!profile?.resumeText}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Comparison</span>
          </button>
        </div>
      )}

      {/* Analysis Results View */}
      {data && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {data.preparationSummary && (
            <div className="bg-teal-50/80 border border-teal-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Strategic Preparation Summary</span>
              </h4>
              <p className="text-xs sm:text-sm text-teal-950 leading-relaxed font-medium">
                {data.preparationSummary}
              </p>
            </div>
          )}

          {/* Missing Skills (Priority Grid) */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>Identified Skill Gaps ({data.missingSkills?.length || 0})</span>
              </h3>
              <span className="text-xs text-slate-400">Prioritized by JD importance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.missingSkills?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{item.skill}</h4>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Why needed:</strong> {item.reason}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 text-xs text-brand-700 bg-brand-50/70 p-2.5 rounded-xl flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Action:</strong> {item.recommendedAction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Skills Breakdown */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Existing Skills in Your Profile ({data.existingSkills?.length || 0})</span>
              </h3>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Ready to Defend
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.existingSkills?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.skill}</h5>
                    <span className="text-[11px] text-slate-500">{item.notes || 'Verified in resume'}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
                    {item.proficiency || 'Intermediate'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
