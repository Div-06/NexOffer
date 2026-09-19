const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Generate deep-dive questions based on the candidate's resume
// @route   POST /api/resume-questions/generate
const generateResumeQuestions = async (req, res, next) => {
  try {
    let { resumeText, company, role } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!resumeText) resumeText = profile.resumeText;
      if (!company) company = profile.company;
      if (!role) role = profile.role;
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is missing. Please upload your resume in Profile first.',
      });
    }

    const prompt = `
Carefully inspect the candidate's Resume provided in context.
Extract specific details about their projects, tech stack choices, architecture, experience, and listed skills.
Generate high-impact technical interview questions specifically customized to their resume content in 3 areas:
1. "projectQuestions" (3-4 questions targeting project architecture, trade-offs, security, database, and hardest challenges)
2. "skillQuestions" (2-3 deep questions probing language fundamentals and tools listed on the resume)
3. "experienceQuestions" (2 questions on team collaboration, agile methodology, or work experience)

Return ONLY valid JSON with this schema:
{
  "projectQuestions": [
    { "question": "...", "category": "...", "difficulty": "Easy|Medium|Hard", "suggestedAnswer": "..." }
  ],
  "skillQuestions": [
    { "question": "...", "category": "...", "difficulty": "Easy|Medium|Hard", "suggestedAnswer": "..." }
  ],
  "experienceQuestions": [
    { "question": "...", "category": "...", "difficulty": "Easy|Medium|Hard", "suggestedAnswer": "..." }
  ]
}
`;

    const context = {
      resumeText,
      company: company || 'Target Company',
      role: role || 'Software Developer',
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      context,
      jsonMode: true,
      moduleType: 'resume-questions',
      systemPrompt: 'You are an expert technical interviewer who rigorously analyzes candidate resumes to ask pointed, architecture-level questions.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('resume-questions', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Resume Questions',
      company: company || 'General',
      role: role || 'General',
      summary: 'Generated resume-specific project & skill questions',
      metadata: { projectCount: data.projectQuestions?.length || 0 },
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
  generateResumeQuestions,
};
