const { ProfileRepository } = require('../models/dbStore');
const llmGateway = require('../services/llmGateway');

// @desc    Chat with AI Career Assistant with full context injection
// @route   POST /api/chat
const handleChat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    const profile = await ProfileRepository.findOne({ userId: req.user._id });
    const company = profile?.company || 'Target Company';
    const role = profile?.role || 'Software Engineer';
    const resumeText = profile?.resumeText || '';
    const jobDescription = profile?.jobDescription || '';

    const systemPrompt = `
You are the **NexOffer AI Career Assistant**, an intelligent, empathetic, and sharp technical interview mentor.
You have immediate access to the candidate's target profile:
- Target Company: ${company}
- Target Role: ${role}
- Stored Resume Summary: ${resumeText ? 'Available (Use it to give personalized answers)' : 'Not yet uploaded'}
- Stored Job Description: ${jobDescription ? 'Available (Reference specific requirements)' : 'Not provided yet'}

Guidelines:
1. Provide concise, direct, high-value advice and code snippets where requested.
2. Ground all answers in the context of their specific role (${role}) and company (${company}).
3. When asked to test or interview the candidate, ask ONE focused question at a time and evaluate their response.
4. Format output cleanly with markdown (bolding, bullet points, code blocks).
`;

    let formattedHistory = '';
    if (conversationHistory.length > 0) {
      formattedHistory = conversationHistory
        .slice(-6)
        .map((msg) => `${msg.sender === 'user' ? 'Candidate' : 'NexOffer Coach'}: ${msg.text}`)
        .join('\n');
    }

    const prompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ''}Candidate Question: ${message}`;

    const context = {
      company,
      role,
      resumeText,
      jobDescription,
    };

    const aiResult = await llmGateway.generateAIResponse({
      prompt,
      systemPrompt,
      context,
      jsonMode: false,
      moduleType: 'chat',
    });

    res.status(200).json({
      success: true,
      reply: aiResult.content,
      provider: aiResult.provider,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat,
};
