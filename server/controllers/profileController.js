const { ProfileRepository } = require('../models/dbStore');
const { parseResumePDF, extractBasicKeywords } = require('../services/resumeParser');

// @desc    Get current user profile
// @route   GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    let profile = await ProfileRepository.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await ProfileRepository.create({
        userId: req.user._id,
        company: '',
        role: '',
        jobDescription: '',
        resumeText: '',
        skills: [],
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { company, role, jobDescription, resumeText, skills, experienceYears } = req.body;

    let profile = await ProfileRepository.findOne({ userId: req.user._id });

    if (!profile) {
      profile = await ProfileRepository.create({
        userId: req.user._id,
        company: company || '',
        role: role || '',
        jobDescription: jobDescription || '',
        resumeText: resumeText || '',
        skills: skills || [],
      });
    } else {
      if (company !== undefined) profile.company = company.trim();
      if (role !== undefined) profile.role = role.trim();
      if (jobDescription !== undefined) profile.jobDescription = jobDescription.trim();
      if (resumeText !== undefined) profile.resumeText = resumeText;
      if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : [];
      if (experienceYears !== undefined) profile.experienceYears = experienceYears;
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload PDF resume and parse text
// @route   POST /api/profile/resume/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF resume file to upload.',
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileName = req.file.filename;

    const extractedText = await parseResumePDF(filePath);
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from this PDF. Please ensure it is not a scanned image.',
      });
    }

    const detectedSkills = extractBasicKeywords(extractedText);

    let profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await ProfileRepository.create({
        userId: req.user._id,
        resumeFileName: fileName,
        resumeOriginalName: originalName,
        resumePath: filePath,
        resumeText: extractedText,
        skills: detectedSkills,
      });
    } else {
      profile.resumeFileName = fileName;
      profile.resumeOriginalName = originalName;
      profile.resumePath = filePath;
      profile.resumeText = extractedText;
      if (detectedSkills.length > 0) {
        profile.skills = Array.from(new Set([...(profile.skills || []), ...detectedSkills]));
      }
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and processed successfully!',
      resumeFileName: originalName,
      extractedLength: extractedText.length,
      detectedSkills,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear stored resume
// @route   DELETE /api/profile/resume
const clearResume = async (req, res, next) => {
  try {
    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      profile.resumeFileName = '';
      profile.resumeOriginalName = '';
      profile.resumePath = '';
      profile.resumeText = '';
      await profile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Resume cleared from profile.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  clearResume,
};
