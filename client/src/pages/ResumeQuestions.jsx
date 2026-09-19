import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FolderGit2,
  Cpu,
  Briefcase,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const ResumeQuestions = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!profile?.resumeText) {
      setError('Please upload your resume in the Profile section first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/resume-questions/generate', {
        resumeText: profile.resumeText,
        company: profile.company,
        role: profile.role,
      });

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resume-based questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (q, catName) => {
    const qKey = q.question;
    if (bookmarkedMap[qKey]) return;

    try {
      await api.post('/bookmarks', {
        question: q.question,
        category: 'Resume-Based',
        difficulty: q.difficulty || 'Medium',
        topic: q.category || catName,
        suggestedAnswer: q.suggestedAnswer || '',
      });

      setBookmarkedMap((prev) => ({ ...prev, [qKey]: true }));
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const renderSection = (title, items, icon, colorClass, defaultCategory) => {
    const Icon = icon;
    if (!items || items.length === 0) return null;

    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className={`w-9 h-9 rounded-xl ${colorClass} flex items-center justify-center font-bold`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <span className="text-xs text-slate-500">{items.length} Questions</span>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((q, idx) => {
            const key = `${title}-${idx}`;
            const isExp = expanded[key];
            const isSaved = bookmarkedMap[q.question];

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                    {q.category || defaultCategory}
                  </span>

                  <button
                    onClick={() => toggleBookmark(q, defaultCategory)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {idx + 1}. {q.question}
                </h4>

                {q.suggestedAnswer && (
                  <div>
                    <button
                      onClick={() => setExpanded({ ...expanded, [key]: !isExp })}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1 focus:outline-none"
                    >
                      <span>{isExp ? 'Hide Answer Framework' : 'View Answer Framework'}</span>
                      {isExp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExp && (
                      <div className="mt-2 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1">Recommended Response Strategy:</span>
                        <p>{q.suggestedAnswer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deep Resume Parsing & Analysis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resume-Based Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predict high-probability questions targeting your projects, architecture, and listed tech stack
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !profile?.resumeText}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Projects & Skills...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{data ? 'Regenerate Questions' : 'Generate from Resume'}</span>
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
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Analyze Your Projects & Experience</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              The AI will extract your projects and tech stack from your uploaded resume to formulate
              tough architectural questions.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!profile?.resumeText}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Questions Now</span>
          </button>
        </div>
      )}

      {/* Questions Render */}
      {data && (
        <div className="space-y-6">
          {renderSection(
            'Project Architecture & Deep Dive',
            data.projectQuestions,
            FolderGit2,
            'bg-indigo-100 text-indigo-700',
            'Project Question'
          )}

          {renderSection(
            'Language & Tool Fundamentals',
            data.skillQuestions,
            Cpu,
            'bg-purple-100 text-purple-700',
            'Skill Question'
          )}

          {renderSection(
            'Experience & Team Collaboration',
            data.experienceQuestions,
            Briefcase,
            'bg-teal-100 text-teal-700',
            'Experience Question'
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeQuestions;
