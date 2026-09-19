import React, { useState } from 'react';
import {
  Building2,
  Boxes,
  Layers,
  Code2,
  Lightbulb,
  Search,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { useProfile } from '../context/ProfileContext';

const CompanyResearch = () => {
  const { profile } = useProfile();
  const [companyName, setCompanyName] = useState(profile?.company || '');
  const [roleName, setRoleName] = useState(profile?.role || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleResearch = async (e) => {
    if (e) e.preventDefault();
    if (!companyName.trim()) {
      setError('Please enter a target company name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/company/research', {
        company: companyName,
        role: roleName,
      });

      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to research company.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Target Company Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Company Research
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore typical interview stages, key engineering topics, and actionable company prep tips
          </p>
        </div>

        <form onSubmit={handleResearch} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Microsoft, Uber, Stripe, Atlassian..."
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Target Role (e.g. SDE-1)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Research Company</span>
              </>
            )}
          </button>
        </form>
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
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Enter Company to Investigate</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click research to generate the standard interview rounds, tech stack expectations, and
              culture tips for {profile?.company || 'your target company'}.
            </p>
          </div>
          <button
            onClick={handleResearch}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Research {profile?.company || 'Target Company'}</span>
          </button>
        </div>
      )}

      {/* Research Output View */}
      {data && (
        <div className="space-y-6">
          {/* Overview & Major Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-cyan-600" />
                <span>{data.companyName} Overview</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {data.overview}
              </p>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Boxes className="w-5 h-5 text-indigo-600" />
                <span>Major Products & Ecosystem</span>
              </h3>
              <ul className="space-y-2">
                {data.majorProducts?.map((prod, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <span>{prod}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Typical Interview Stages Pipeline */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-brand-600" />
              <span>Typical Interview Process Stages</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.typicalInterviewStages?.map((stage, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 relative"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                      Round {idx + 1}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-2">
                      {stage.stage}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Technical Topics & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Tech Topics */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code2 className="w-5 h-5 text-indigo-600" />
                <span>Core Technical Areas Emphasized</span>
              </h3>
              <ul className="space-y-2.5">
                {data.coreTechnicalTopics?.map((topic, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation Tips */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>Actionable Preparation Strategy</span>
              </h3>
              <ul className="space-y-2.5">
                {data.preparationTips?.map((tip, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <span>{tip}</span>
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

export default CompanyResearch;
