import React, { useState } from 'react';
import {
  HelpCircle,
  Code2,
  Users,
  BrainCircuit,
  Briefcase,
  Building,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const InterviewPrep = () => {
  const { profile } = useProfile();

  const [activeCategory, setActiveCategory] = useState('technical');
  const [loading, setLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [error, setError] = useState('');

  const categories = [
    { id: 'technical', label: 'Technical', icon: Code2, countKey: 'technical' },
    { id: 'hr', label: 'HR & Motivation', icon: Users, countKey: 'hr' },
    { id: 'behavioural', label: 'Behavioural (STAR)', icon: BrainCircuit, countKey: 'behavioural' },
    { id: 'roleSpecific', label: 'Role-Specific', icon: Briefcase, countKey: 'roleSpecific' },
    { id: 'companySpecific', label: 'Company-Specific', icon: Building, countKey: 'companySpecific' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/interview/generate', {
        company: profile?.company,
        role: profile?.role,
        jobDescription: profile?.jobDescription,
        resumeText: profile?.resumeText,
      });

      if (res.data?.success) {
        setQuestionsData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (catId, idx) => {
    const key = `${catId}-${idx}`;
    setExpandedIndex((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBookmark = async (q, catName) => {
    const qKey = q.question;
    const isCurrentlySaved = bookmarkedMap[qKey];

    if (isCurrentlySaved) {
      // Already saved locally
      return;
    }

    try {
      await api.post('/bookmarks', {
        question: q.question,
        category: catName || 'General',
        difficulty: q.difficulty || 'Medium',
        topic: q.topic || '',
        suggestedAnswer: q.suggestedAnswer || '',
      });

      setBookmarkedMap((prev) => ({ ...prev, [qKey]: true }));
    } catch (err) {
      console.error('Failed to bookmark question:', err);
    }
  };

  const currentQuestions = questionsData ? questionsData[activeCategory] || [] : [];

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>5-Category Q&A Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Interview Preparation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Questions categorized by Technical, HR, Behavioural, Role, and Company context
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
              <span>Generating Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{questionsData ? 'Regenerate Questions' : 'Generate Interview Questions'}</span>
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
      {!questionsData && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Generate Structured Questions</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click the button above to generate personalized interview questions matching{' '}
              <strong>{profile?.role || 'your role'}</strong> at{' '}
              <strong>{profile?.company || 'your company'}</strong>.
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

      {/* Categorized Question List */}
      {questionsData && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = questionsData[cat.countKey]?.length || 0;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Questions Cards for Current Tab */}
          <div className="space-y-4">
            {currentQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-sm">
                No questions found in this category.
              </div>
            ) : (
              currentQuestions.map((q, idx) => {
                const isExpanded = expandedIndex[`${activeCategory}-${idx}`];
                const isSaved = bookmarkedMap[q.question];

                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-card hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Header Row: Difficulty, Topic, Bookmark */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${getDifficultyBadge(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty || 'Medium'}
                        </span>
                        {q.topic && (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {q.topic}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleBookmark(q, activeCategory)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSaved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
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

                    {/* Question Text */}
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {idx + 1}. {q.question}
                    </h4>

                    {/* Toggle Suggested Answer */}
                    {q.suggestedAnswer && (
                      <div>
                        <button
                          onClick={() => toggleExpand(activeCategory, idx)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1 focus:outline-none"
                        >
                          <span>{isExpanded ? 'Hide Suggested Answer' : 'View Suggested Answer & Key Points'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 block">
                              Key Points / Model Framework:
                            </span>
                            <p>{q.suggestedAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
