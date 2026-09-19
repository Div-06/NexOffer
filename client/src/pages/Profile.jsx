import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Building2,
  Briefcase,
  CheckCircle2,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  Eye,
  Layers,
  Code
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const Profile = () => {
  const { profile, updateProfile, uploadResume, clearResume, saving } = useProfile();

  const [company, setCompany] = useState(profile?.company || '');
  const [role, setRole] = useState(profile?.role || '');
  const [jobDescription, setJobDescription] = useState(profile?.jobDescription || '');
  const [resumeText, setResumeText] = useState(profile?.resumeText || '');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'extracted'
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setCompany(profile.company || '');
      setRole(profile.role || '');
      setJobDescription(profile.jobDescription || '');
      setResumeText(profile.resumeText || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    try {
      await updateProfile({
        company,
        role,
        jobDescription,
        resumeText,
      });
      setStatusMessage({
        type: 'success',
        text: 'Profile and context updated successfully! Available to all modules.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile.',
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setStatusMessage({
        type: 'error',
        text: 'Only PDF resume files are supported.',
      });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await uploadResume(file);
      setStatusMessage({
        type: 'success',
        text: `Resume "${file.name}" uploaded and parsed successfully (${res.detectedSkills?.length || 0} skills detected)!`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to parse resume PDF.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleClearResume = async () => {
    if (!window.confirm('Are you sure you want to remove this resume?')) return;
    try {
      await clearResume();
      setStatusMessage({
        type: 'success',
        text: 'Resume removed from profile.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to remove resume.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-soft">
        <div className="flex items-center gap-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Upload Once → Reuse Everywhere</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Target Job & Resume Hub
        </h2>
        <p className="text-brand-100 text-sm mt-1 max-w-2xl leading-relaxed">
          Configure your target company, role, job description, and resume. All 10 preparation
          modules automatically synchronize with this central hub so you never have to re-enter
          information.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Role & Company */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-brand-600" />
              <span>Target Role & Company</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Company
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon, Microsoft"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer / SDE-1"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Job Description (JD)</span>
                <span className="text-[11px] font-normal text-slate-400">Paste raw text or key requirements</span>
              </label>
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description, responsibilities, technical stack requirements, and preferred qualifications here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Target Context</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Resume Upload & Extracted Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Resume Document</span>
              </h3>
              {profile?.resumeOriginalName && (
                <button
                  type="button"
                  onClick={handleClearResume}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove PDF</span>
                </button>
              )}
            </div>

            {/* Upload Dropzone */}
            <div className="relative border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-6 text-center bg-slate-50/60 transition-colors">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {uploading ? 'Extracting text from PDF...' : 'Click or Drag PDF Resume here'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports text-based PDF resumes up to 10 MB
                  </p>
                </div>
              </div>
            </div>

            {/* Active Resume Status Card */}
            {profile?.resumeOriginalName ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                      {profile.resumeOriginalName}
                    </h4>
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Extracted ({profile.resumeText?.length || 0} characters)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'extracted' ? 'edit' : 'extracted')}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{activeTab === 'extracted' ? 'Hide' : 'View Text'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>No resume uploaded yet. Upload a PDF or type your resume content manually below.</span>
              </div>
            )}

            {/* Detected Skills Pills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Auto-Detected Skills ({profile.skills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Resume Text Inspector / Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Resume Plain Text (Parsed)
                </label>
                <span className="text-[11px] text-slate-400">Can be manually edited</span>
              </div>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Parsed text from your resume will appear here. You can also paste your resume text directly..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800 leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
