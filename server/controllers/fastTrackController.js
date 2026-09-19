const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Generate fast-track preparation checklist for urgent timeframes (1h, 3h, 6h, 12h)
// @route   POST /api/fast-track/generate
const generateFastTrack = async (req, res, next) => {
  try {
    let { timeframe = '3 Hours', company, role, jobDescription, resumeText } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!company) company = profile.company;
      if (!role) role = profile.role;
      if (!jobDescription) jobDescription = profile.jobDescription;
      if (!resumeText) resumeText = profile.resumeText;
    }

    const targetCompany = company || 'Target Company';
    const targetRole = role || 'Software Engineer';

    const prompt = `
Create a high-impact, prioritized Fast Track interview prep guide for a candidate with ONLY ${timeframe} remaining before their interview for ${targetRole} at ${targetCompany}.
Filter out low-value theory and focus only on maximum ROI actions (Elevator pitch, top 2 resume projects, crucial CS pillars, STAR behavioural examples, company trivia).

Return ONLY valid JSON with this schema:
{
  "timeframe": "${timeframe}",
  "urgentChecklist": [
    {
      "priority": 1,
      "title": "...",
      "details": "...",
      "estTime": "..."
    }
  ]
}
`;

    const context = {
      company: targetCompany,
      role: targetRole,
      jobDescription,
      resumeText,
      timeframe,
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'fast-track',
      systemPrompt: 'You are an Emergency Interview Prep Specialist focusing on hyper-efficient revision.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('fast-track', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Fast Track Prep',
      company: targetCompany,
      role: targetRole,
      summary: `Generated ${timeframe} fast track revision guide`,
      metadata: { timeframe },
    });

    res.status(200).json({
      success: true,
      data,
      provider: aiResult.provider,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateFastTrack,
};
