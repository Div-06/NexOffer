import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  RefreshCw,
  Award,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const AtsScanner = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [providerUsed, setProviderUsed] = useState('');

  const runAtsScan = async () => {
    if (!profile?.resumeText) {
      setError('Please upload your resume in the Profile section first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/resume/ats', {
        resumeText: profile.resumeText,
        jobDescription: profile.jobDescription,
        company: profile.company,
        role: profile.role,
      });

      if (res.data?.success) {
        setResults(res.data.data);
        setProviderUsed(res.data.provider);

        // Fire celebratory confetti if score is >= 75
        if (res.data.data?.atsScore >= 75) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete ATS scan.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200 stroke-emerald-500';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200 stroke-amber-500';
    return 'text-rose-600 bg-rose-50 border-rose-200 stroke-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <FileSearch className="w-3.5 h-3.5" />
            <span>ATS Compatibility Analysis</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Resume ATS Scanner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate enterprise Applicant Tracking Systems against your target job description
          </p>
        </div>

        <button
          onClick={runAtsScan}
          disabled={loading || !profile?.resumeText}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Resume ATS...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{results ? 'Re-Scan Resume' : 'Run ATS Scan'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
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

      {/* Initial Empty State before scanning */}
      {!results && !loading && !error && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <FileSearch className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Ready to Scan Your Resume</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click the button above to evaluate keyword density, formatting fitness, matching skills,
              and receive actionable recommendations.
            </p>
          </div>
          <button
            onClick={runAtsScan}
            disabled={!profile?.resumeText}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan with Central Context</span>
          </button>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* ATS Score Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex items-center gap-5">
              <div
                className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center font-black ${getScoreColor(
                  results.atsScore
                )}`}
              >
                <span className="text-2xl">{results.atsScore}</span>
                <span className="text-[10px] uppercase font-bold opacity-80">Score</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  Overall ATS Rating
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  {results.atsScore >= 80
                    ? 'Excellent Compatibility'
                    : results.atsScore >= 60
                    ? 'Moderate Fit'
                    : 'Needs Improvement'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Out of 100 possible points</p>
              </div>
            </div>

            {/* Keyword Match Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-black">
                <span className="text-2xl">{results.keywordMatchPercentage}%</span>
                <span className="text-[10px] uppercase font-bold opacity-80">Match</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  JD Keyword Match
                </span>
                <h4 className="text-lg font-bold text-slate-900">Vocabulary Alignment</h4>
                <p className="text-xs text-slate-500 mt-0.5">Frequency vs target requirements</p>
              </div>
            </div>

            {/* Intelligence Engine Badge */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl border border-purple-200 bg-purple-50 text-purple-700 flex flex-col items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                  LLM Gateway Engine
                </span>
                <h4 className="text-sm font-bold text-slate-900">{providerUsed || 'AI Gateway'}</h4>
                <span className="inline-block mt-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified Scan
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {results.summary && (
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Executive ATS Summary</span>
              </h4>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                {results.summary}
              </p>
            </div>
          )}

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Matched Skills ({results.matchedSkills?.length || 0})</span>
                </h4>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Found in Resume
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.matchedSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Missing Skills / Keywords ({results.missingSkills?.length || 0})</span>
                </h4>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  Needed for JD
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.missingSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Resume Strengths</span>
              </h4>
              <ul className="space-y-2.5">
                {results.strengths?.map((str, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Actionable ATS Improvements</span>
              </h4>
              <ul className="space-y-2.5">
                {results.suggestions?.map((sug, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-600 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <span>{sug}</span>
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

export default AtsScanner;
