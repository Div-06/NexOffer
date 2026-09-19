const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Generate structured interview questions across 5 categories
// @route   POST /api/interview/generate
const generateInterviewPrep = async (req, res, next) => {
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
Generate targeted interview questions and suggested answers for a candidate interviewing for the role of "${targetRole}" at "${targetCompany}".
Structure the questions into 5 distinct categories:
1. "technical" (3 questions on core CS, stack, problem solving)
2. "hr" (2 questions on career goals, motivation, salary/fit)
3. "behavioural" (2 questions using STAR format situations)
4. "roleSpecific" (2 questions focused explicitly on ${targetRole} day-to-day duties)
5. "companySpecific" (2 questions tailored to ${targetCompany}'s products, scale, and engineering values)

Return ONLY valid JSON with this exact schema:
{
  "technical": [
    { "question": "...", "difficulty": "Easy|Medium|Hard", "topic": "...", "suggestedAnswer": "..." }
  ],
  "hr": [
    { "question": "...", "difficulty": "Easy|Medium|Hard", "topic": "...", "suggestedAnswer": "..." }
  ],
  "behavioural": [
    { "question": "...", "difficulty": "Easy|Medium|Hard", "topic": "...", "suggestedAnswer": "..." }
  ],
  "roleSpecific": [
    { "question": "...", "difficulty": "Easy|Medium|Hard", "topic": "...", "suggestedAnswer": "..." }
  ],
  "companySpecific": [
    { "question": "...", "difficulty": "Easy|Medium|Hard", "topic": "...", "suggestedAnswer": "..." }
  ]
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
      moduleType: 'interview',
      systemPrompt: 'You are a Senior Technical Hiring Manager and Interview Architect specializing in FAANG and top-tier tech interviews.',
    });

    const questionsData = aiResult.parsedJson || llmGateway.generateFallbackResponse('interview', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Interview Preparation',
      company: targetCompany,
      role: targetRole,
      summary: `Generated interview preparation Q&A for ${targetRole} at ${targetCompany}`,
      metadata: { targetCompany, targetRole },
    });

    res.status(200).json({
      success: true,
      data: questionsData,
      provider: aiResult.provider,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInterviewPrep,
};
