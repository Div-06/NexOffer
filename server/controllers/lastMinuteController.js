const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Generate compact last-minute interview revision guide
// @route   POST /api/last-minute/generate
const generateLastMinuteGuide = async (req, res, next) => {
  try {
    let { company, role, jobDescription, resumeText } = req.body;

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
Generate a compact, highly scannable Last-Minute Interview Revision Guide for a candidate interviewing for "${targetRole}" at "${targetCompany}".
Include:
1. "topTechnicalTopics": 4 bullet points on the most crucial concepts to review right now.
2. "mustKnowQuestions": 3 vital Q&A pairs that are almost guaranteed to be asked.
3. "quickChecklist": 4 actionable pre-interview sanity check items.
4. "smartQuestionsToAsk": 3 insightful questions the candidate can ask the interviewer.

Return ONLY valid JSON with this schema:
{
  "topTechnicalTopics": ["...", "..."],
  "mustKnowQuestions": [
    { "q": "...", "a": "..." }
  ],
  "quickChecklist": ["...", "..."],
  "smartQuestionsToAsk": ["...", "..."]
}
`;

    const context = {
      company: targetCompany,
      role: targetRole,
      jobDescription,
      resumeText,
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'last-minute',
      systemPrompt: 'You are a Senior Interview Coach delivering a high-yield pre-interview survival sheet.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('last-minute', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Last Minute Guide',
      company: targetCompany,
      role: targetRole,
      summary: `Generated last-minute revision checklist for ${targetCompany}`,
      metadata: { targetCompany },
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
  generateLastMinuteGuide,
};
