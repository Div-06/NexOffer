const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Research company overview, interview stages, and technical expectations
// @route   POST /api/company/research
const researchCompany = async (req, res, next) => {
  try {
    let { company, role } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!company) company = profile.company;
      if (!role) role = profile.role;
    }

    const targetCompany = company || 'Target Tech Company';
    const targetRole = role || 'Software Engineer';

    const prompt = `
Generate structured, professional company interview insights for "${targetCompany}" for the position of "${targetRole}".
Structure your research into:
1. "companyName": Name of the company
2. "overview": Concise summary of their market domain, engineering ethos, and core mission.
3. "majorProducts": Array of 3-4 key products, services, or platforms they are famous for.
4. "typicalInterviewStages": Array of standard stages (e.g. Online Assessment, Technical Round 1 - DSA, Technical Round 2 - System Design/Projects, HR/Values).
5. "coreTechnicalTopics": Array of 4-5 relevant tech areas commonly emphasized in their interview loops.
6. "preparationTips": 3-4 realistic actionable tips for preparing for this company.

Return ONLY valid JSON with this schema:
{
  "companyName": "...",
  "overview": "...",
  "majorProducts": ["...", "..."],
  "typicalInterviewStages": [
    { "stage": "...", "description": "..." }
  ],
  "coreTechnicalTopics": ["...", "..."],
  "preparationTips": ["...", "..."]
}
`;

    const context = { company: targetCompany, role: targetRole };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'company-research',
      systemPrompt: 'You are an IT Industry Analyst and Tech Career Researcher.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('company-research', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Company Research',
      company: targetCompany,
      role: targetRole,
      summary: `Researched interview stages and technical topics for ${targetCompany}`,
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
  researchCompany,
};
