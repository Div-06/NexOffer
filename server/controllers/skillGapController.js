const { ProfileRepository, HistoryRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Analyze skill gaps between resume and JD
// @route   POST /api/skill-gap/analyze
const analyzeSkillGap = async (req, res, next) => {
  try {
    let { resumeText, jobDescription, company, role } = req.body;

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    if (profile) {
      if (!resumeText) resumeText = profile.resumeText;
      if (!jobDescription) jobDescription = profile.jobDescription;
      if (!company) company = profile.company;
      if (!role) role = profile.role;
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Resume text is missing. Please upload your resume in Profile first.',
      });
    }

    const prompt = `
Compare the candidate's Resume against the target Job Description (for ${role || 'Target Role'} at ${company || 'Target Company'}).
Conduct a comprehensive Skill Gap Analysis.
Classify skills into:
1. "existingSkills": List of skills found in the resume with assessed proficiency (Beginner|Intermediate|Advanced) and brief notes.
2. "missingSkills": List of skills demanded by the JD that are not found or weak in the resume. For each missing skill, assign:
   - "priority": "High" | "Medium" | "Low"
   - "reason": Why it is critical for this role
   - "recommendedAction": Practical step to bridge this gap quickly.
3. "preparationSummary": Concise action plan.

Return ONLY valid JSON with this schema:
{
  "existingSkills": [
    { "skill": "...", "proficiency": "...", "notes": "..." }
  ],
  "missingSkills": [
    { "skill": "...", "priority": "High|Medium|Low", "reason": "...", "recommendedAction": "..." }
  ],
  "preparationSummary": "..."
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
      moduleType: 'skill-gap',
      systemPrompt: 'You are an expert Technical Skills Assessor and Career Transition Coach.',
    });

    const data = aiResult.parsedJson || llmGateway.generateFallbackResponse('skill-gap', context);

    await HistoryRepository.create({
      userId: req.user._id,
      module: 'Skill Gap Analyzer',
      company: company || 'General',
      role: role || 'General',
      summary: `Found ${data.existingSkills?.length || 0} existing skills and ${data.missingSkills?.length || 0} skill gaps`,
      metadata: { missingCount: data.missingSkills?.length || 0 },
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
  analyzeSkillGap,
};
