require('dotenv').config();

module.exports = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  grok: {
    apiKey: process.env.GROK_API_KEY || '',
    model: process.env.GROK_MODEL || 'grok-beta',
    endpoint: 'https://api.x.ai/v1/chat/completions',
  },
  otherLLM: {
    apiKey: process.env.OTHER_LLM_API_KEY || '',
    endpoint: process.env.OTHER_LLM_ENDPOINT || '',
    model: process.env.OTHER_LLM_MODEL || '',
  },
};
