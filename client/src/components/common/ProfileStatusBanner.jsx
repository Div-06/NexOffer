import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const ProfileStatusBanner = () => {
  const { profile } = useProfile();

  const hasCompany = Boolean(profile?.company);
  const hasRole = Boolean(profile?.role);
  const hasResume = Boolean(profile?.resumeText);
  const hasJd = Boolean(profile?.jobDescription);

  const isComplete = hasCompany && hasRole && hasResume && hasJd;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-soft mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Active Target Info */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-normal">Target Company</span>
              <span className="text-slate-900 font-semibold">{profile?.company || 'Not set'}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-normal">Target Role</span>
              <span className="text-slate-900 font-semibold">{profile?.role || 'Not set'}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          {/* Badges */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                hasResume
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {hasResume ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
              Resume: {hasResume ? 'Uploaded' : 'Missing'}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                hasJd
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {hasJd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
              JD: {hasJd ? 'Added' : 'Missing'}
            </span>
          </div>
        </div>

        {/* Action Link */}
        <div className="flex items-center gap-3">
          {!isComplete && (
            <span className="text-xs text-amber-600 font-medium hidden xl:inline">
              ⚡ Complete profile for 100% personalized AI prep
            </span>
          )}
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all"
          >
            <span>Update Profile & Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileStatusBanner;
