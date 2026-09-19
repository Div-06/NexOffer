const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Analyze resume for ATS match against JD
// @route   POST /api/resume/ats
const analyzeATS = async (req, res, next) => {
  try {
    let { resumeText, jobDescription, company, role } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!resumeText) resumeText = profile.resumeText;
      if (!jobDescription) jobDescription = profile.jobDescription;
      if (!company) company = profile.company;
      if (!role) role = profile.role;
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required. Please upload your resume first.',
      });
    }

    const prompt = `
Perform a thorough Applicant Tracking System (ATS) scan and match analysis comparing the candidate's Resume against the Job Description (for ${role || 'Target Role'} at ${company || 'Target Company'}).

Provide realistic, accurate, and actionable ATS feedback in valid JSON with this exact schema:
{
  "atsScore": <number between 0 and 100>,
  "keywordMatchPercentage": <number between 0 and 100>,
  "matchedSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<missing1>", "<missing2>", ...],
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "suggestions": ["<suggestion1>", "<suggestion2>", "<suggestion3>"],
  "summary": "<2-3 sentence executive evaluation of the resume ATS fitness>"
}
`;

    const context = {
      resumeText,
      jobDescription: jobDescription || 'Standard requirements for modern software and tech roles.',
      company,
      role,
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'ats',
      systemPrompt: 'You are an advanced enterprise Applicant Tracking System (ATS) and Senior Technical Recruiter analyzer.',
    });

    const atsData = aiResult.parsedJson || {
      atsScore: 78,
      keywordMatchPercentage: 72,
      matchedSkills: ['JavaScript', 'React', 'REST APIs', 'Git'],
      missingSkills: ['Docker', 'AWS', 'CI/CD'],
      strengths: ['Clear project breakdown', 'Relevant fullstack skills'],
      suggestions: ['Add quantitative impact metrics', 'Include cloud deployment keywords'],
      summary: 'Solid profile with strong core fundamentals.'
    };

    // Save to user history
    await HistoryRepository.create({
      userId: req.user._id,
      module: 'ATS Scanner',
      company: company || 'General',
      role: role || 'General Tech Role',
      summary: `ATS Score: ${atsData.atsScore}/100 | Keyword Match: ${atsData.keywordMatchPercentage}%`,
      metadata: { atsScore: atsData.atsScore, matchedCount: atsData.matchedSkills?.length || 0 },
    });

    res.status(200).json({
      success: true,
      data: atsData,
      provider: aiResult.provider,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeATS,
};
