const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Generate personalized preparation roadmap
// @route   POST /api/roadmap/generate
const generateRoadmap = async (req, res, next) => {
  try {
    let { days = 7, company, role, jobDescription, resumeText } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!company) company = profile.company;
      if (!role) role = profile.role;
      if (!jobDescription) jobDescription = profile.jobDescription;
      if (!resumeText) resumeText = profile.resumeText;
    }

    const targetCompany = company || 'Target Company';
    const targetRole = role || 'Software Engineer';
    const totalDays = Number(days) || 7;

    const prompt = `
Create a realistic, day-by-day interview preparation roadmap for a ${totalDays}-day timeframe.
Target Role: "${targetRole}"
Target Company: "${targetCompany}"
Prioritize any missing skills needed for the role based on the provided Resume and Job Description.

Return ONLY valid JSON with this schema:
{
  "totalDays": ${totalDays},
  "targetRole": "${targetRole}",
  "company": "${targetCompany}",
  "schedule": [
    {
      "day": "Day 1",
      "title": "...",
      "topics": ["topic 1", "topic 2", "topic 3"],
      "deliverable": "..."
    }
  ]
}
Ensure the schedule has items covering all key days up to ${totalDays} (or grouped logically if 15/30 days).
`;

    const context = {
      company: targetCompany,
      role: targetRole,
      jobDescription,
      resumeText,
      days: totalDays,
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'roadmap',
      systemPrompt: 'You are an Agile Interview Coach creating hyper-focused daily preparation sprints.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('roadmap', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Roadmap Generator',
      company: targetCompany,
      role: targetRole,
      summary: `Generated ${totalDays}-day preparation roadmap for ${targetCompany}`,
      metadata: { totalDays },
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
  generateRoadmap,
};
