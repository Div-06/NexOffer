import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Code2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Loader2,
  AlertCircle,
  FileCheck2,
  ListChecks
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const LastMinuteGuide = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/last-minute/generate', {
        company: profile?.company,
        role: profile?.role,
        jobDescription: profile?.jobDescription,
        resumeText: profile?.resumeText,
      });

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate last minute guide.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Final Pre-Interview Sprint</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Last Minute Guide
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ultra-scannable final revision cheat sheet before you hop on your interview call
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Guide...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{data ? 'Regenerate Cheat Sheet' : 'Generate Last Minute Guide'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Initial Empty State */}
      {!data && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <Clock className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Your Pre-Call Survival Sheet</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generate a dense, scannable list of must-know questions, technical bullets, and sanity checks.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Now</span>
          </button>
        </div>
      )}

      {/* Guide Content */}
      {data && (
        <div className="space-y-6">
          {/* Top Technical Topics & Must-Know Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top CS Technical Topics */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Crucial Technical Concepts</span>
              </h3>
              <ul className="space-y-3">
                {data.topTechnicalTopics?.map((topic, idx) => (
                  <li key={idx} className="p-3 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 border border-slate-200 flex items-start gap-2.5 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Must-Know High Probability Questions */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <HelpCircle className="w-5 h-5 text-rose-600" />
                <span>Must-Know Questions</span>
              </h3>
              <div className="space-y-3">
                {data.mustKnowQuestions?.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      Q: {item.q}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-rose-700">Answer Tip:</strong> {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Pre-Call Checklist & Questions to Ask */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pre-Interview Checklist */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ListChecks className="w-5 h-5 text-emerald-600" />
                <span>15-Minute Pre-Call Checklist</span>
              </h3>
              <ul className="space-y-2.5">
                {data.quickChecklist?.map((check, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Smart Questions to Ask */}
            <div className="lg:col-span-6 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>Smart Questions to Ask Interviewer</span>
              </h3>
              <ul className="space-y-2.5">
                {data.smartQuestionsToAsk?.map((q, idx) => (
                  <li key={idx} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                    <span className="font-bold text-amber-700">#{idx + 1}</span>
                    <span>"{q}"</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LastMinuteGuide;
