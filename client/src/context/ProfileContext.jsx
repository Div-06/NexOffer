import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState({
    company: '',
    role: '',
    jobDescription: '',
    resumeFileName: '',
    resumeOriginalName: '',
    resumeText: '',
    skills: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get('/profile');
      if (res.data?.profile) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      setProfile({
        company: '',
        role: '',
        jobDescription: '',
        resumeFileName: '',
        resumeOriginalName: '',
        resumeText: '',
        skills: [],
      });
    }
  }, [isAuthenticated, fetchProfile]);

  const updateProfile = async (data) => {
    setSaving(true);
    try {
      const res = await api.put('/profile', data);
      if (res.data?.profile) {
        setProfile(res.data.profile);
      }
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/profile/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.profile) {
        setProfile(res.data.profile);
      }
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const clearResume = async () => {
    setSaving(true);
    try {
      const res = await api.delete('/profile/resume');
      if (res.data?.profile) {
        setProfile(res.data.profile);
      }
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const isProfileComplete = Boolean(
    profile.company &&
    profile.role &&
    profile.jobDescription &&
    profile.resumeText
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        saving,
        fetchProfile,
        updateProfile,
        uploadResume,
        clearResume,
        isProfileComplete,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
