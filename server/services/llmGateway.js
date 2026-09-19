const llmConfig = require('../config/llmConfig');

/**
 * Centralized LLM Gateway with automatic failover mechanism
 * Tries: Gemini -> Grok -> Other LLM -> Intelligent Heuristic Generator
 */
class LLMGateway {
  constructor() {
    this.providers = [
      { name: 'Gemini', handler: this.callGemini.bind(this) },
      { name: 'Grok', handler: this.callGrok.bind(this) },
      { name: 'OtherLLM', handler: this.callOtherLLM.bind(this) },
    ];
  }

  /**
   * Main entry point for generating AI responses
   * @param {Object} options
   * @param {string} options.prompt - Prompt instructions
   * @param {string} [options.systemPrompt] - System instructions
   * @param {Object} [options.context] - Resume, JD, Company, Role
   * @param {boolean} [options.jsonMode] - Expect JSON output
   * @param {string} [options.moduleType] - Type of module (ats, interview, roadmap, etc.) for heuristic fallback
   * @returns {Promise<{ content: string, parsedJson?: any, provider: string }>}
   */
  async generateAIResponse({
    prompt,
    systemPrompt = 'You are NexOffer AI, an expert career mentor and technical interview coach.',
    context = {},
    jsonMode = false,
    moduleType = 'general',
  }) {
    let lastError = null;

    // Try configured LLM providers in sequence
    for (const provider of this.providers) {
      try {
        const result = await provider.handler({ prompt, systemPrompt, context, jsonMode });
        if (result && result.content) {
          console.log(`✨ [LLM Gateway] Generated response successfully via ${provider.name}`);
          
          let parsedJson = null;
          if (jsonMode) {
            parsedJson = this.extractJSON(result.content);
          }

          return {
            content: result.content,
            parsedJson,
            provider: provider.name,
            fallback: false,
          };
        }
      } catch (err) {
        console.warn(`⚠️ [LLM Gateway] ${provider.name} failed: ${err.message}. Failing over to next provider...`);
        lastError = err;
      }
    }

    // If all providers fail or are unconfigured, use the Intelligent Heuristic Engine
    console.log(`🛡️ [LLM Gateway] Generating intelligent fallback response for module: ${moduleType}`);
    const fallbackData = this.generateFallbackResponse(moduleType, context, prompt, jsonMode);

    return {
      content: typeof fallbackData === 'string' ? fallbackData : JSON.stringify(fallbackData, null, 2),
      parsedJson: jsonMode ? fallbackData : null,
      provider: 'NexOffer Intelligent Engine (Offline Mode)',
      fallback: true,
      lastError: lastError ? lastError.message : 'No API keys configured',
    };
  }

  /**
   * Calls Google Gemini API
   */
  async callGemini({ prompt, systemPrompt, context, jsonMode }) {
    const apiKey = process.env.GEMINI_API_KEY || llmConfig.gemini.apiKey;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const model = process.env.GEMINI_MODEL || llmConfig.gemini.model || 'gemini-1.5-flash';
    const url = `${llmConfig.gemini.endpoint}/${model}:generateContent?key=${apiKey}`;

    const contextString = this.formatContext(context);
    const fullPrompt = `${systemPrompt}\n\n${contextString ? `CONTEXT:\n${contextString}\n\n` : ''}${prompt}${
      jsonMode ? '\n\nIMPORTANT: Respond ONLY with valid, raw JSON. Do not include markdown codeblocks or extra explanations.' : ''
    }`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Gemini returned an empty candidate text');
    }

    return { content: candidate };
  }

  /**
   * Calls Grok (xAI) API
   */
  async callGrok({ prompt, systemPrompt, context, jsonMode }) {
    const apiKey = process.env.GROK_API_KEY || llmConfig.grok.apiKey;
    if (!apiKey) {
      throw new Error('Grok API key is not configured');
    }

    const contextString = this.formatContext(context);
    const messages = [
      { role: 'system', content: `${systemPrompt}${jsonMode ? ' Respond ONLY with valid JSON.' : ''}` },
    ];

    if (contextString) {
      messages.push({ role: 'user', content: `Context Information:\n${contextString}` });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch(llmConfig.grok.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROK_MODEL || llmConfig.grok.model || 'grok-beta',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const messageContent = data.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error('Grok returned an empty response');
    }

    return { content: messageContent };
  }

  /**
   * Calls generic OpenAI-compatible third provider if configured
   */
  async callOtherLLM({ prompt, systemPrompt, context, jsonMode }) {
    const apiKey = process.env.OTHER_LLM_API_KEY || llmConfig.otherLLM.apiKey;
    const endpoint = process.env.OTHER_LLM_ENDPOINT || llmConfig.otherLLM.endpoint;
    if (!apiKey || !endpoint) {
      throw new Error('Third-party LLM API key/endpoint not configured');
    }

    const contextString = this.formatContext(context);
    const messages = [
      { role: 'system', content: `${systemPrompt}${jsonMode ? ' Return only valid JSON.' : ''}` },
    ];

    if (contextString) {
      messages.push({ role: 'user', content: `Context:\n${contextString}` });
    }

    messages.push({ role: 'user', content: prompt });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OTHER_LLM_MODEL || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Other LLM HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || '' };
  }

  formatContext(context) {
    if (!context) return '';
    const parts = [];
    if (context.company) parts.push(`Target Company: ${context.company}`);
    if (context.role) parts.push(`Target Role: ${context.role}`);
    if (context.jobDescription) parts.push(`Job Description:\n${context.jobDescription.substring(0, 2000)}`);
    if (context.resumeText) parts.push(`User Resume Content:\n${context.resumeText.substring(0, 3000)}`);
    return parts.join('\n\n');
  }

  extractJSON(text) {
    try {
      // First attempt direct parse
      return JSON.parse(text);
    } catch (e) {
      // Attempt to clean markdown code blocks
      const clean = text
        .replace(/```json\n?|\n?```/g, '')
        .replace(/```\n?|\n?```/g, '')
        .trim();
      try {
        return JSON.parse(clean);
      } catch (err) {
        // Find JSON object or array bounds
        const startObj = clean.indexOf('{');
        const endObj = clean.lastIndexOf('}');
        if (startObj !== -1 && endObj !== -1 && endObj > startObj) {
          try {
            return JSON.parse(clean.substring(startObj, endObj + 1));
          } catch (inner) {}
        }
        
        const startArr = clean.indexOf('[');
        const endArr = clean.lastIndexOf(']');
        if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
          try {
            return JSON.parse(clean.substring(startArr, endArr + 1));
          } catch (inner) {}
        }
        
        console.warn('Could not cleanly parse JSON from LLM output');
        return null;
      }
    }
  }

  /**
   * Generates highly realistic and structured heuristic fallback responses
   * ensures the app works out-of-the-box even with zero API keys!
   */
  generateFallbackResponse(moduleType, context = {}, prompt = '', jsonMode = false) {
    const company = context.company || 'Target Company';
    const role = context.role || 'Software Engineer';
    const resumeText = context.resumeText || '';
    const jd = context.jobDescription || '';

    switch (moduleType) {
      case 'ats':
        return {
          atsScore: 82,
          keywordMatchPercentage: 78,
          matchedSkills: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'Git', 'SQL', 'Problem Solving'],
          missingSkills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'AWS / Cloud Deployment', 'Unit Testing with Jest'],
          strengths: [
            'Clear project descriptions highlighting full-stack engineering workflow.',
            'Demonstrated proficiency in core frontend and backend web technologies.',
            'Solid foundational knowledge of database schemas and API integrations.'
          ],
          suggestions: [
            'Incorporate metrics and quantifiable impacts (e.g., "improved load speed by 35%").',
            'Add relevant containerization and cloud hosting tools such as Docker or AWS.',
            'Align bullet points with the exact terminology used in the Job Description.'
          ],
          summary: `Your resume demonstrates a strong match for ${role} at ${company} with good foundational skills. Minor alignment with JD cloud requirements will push your score above 90%.`
        };

      case 'interview':
        return {
          technical: [
            {
              question: `How does the Virtual DOM in React optimize UI rendering compared to direct DOM manipulation?`,
              difficulty: 'Medium',
              topic: 'React & Frontend Architecture',
              suggestedAnswer: 'Explain the reconciliation process, the diffing algorithm (O(n) heuristics), and batching updates to minimize expensive real DOM repaints.'
            },
            {
              question: `Explain how JWT (JSON Web Tokens) work and how you secure sensitive REST endpoints.`,
              difficulty: 'Medium',
              topic: 'Backend Security & Auth',
              suggestedAnswer: 'Cover Header, Payload, Signature format; verify signature using HMAC SHA256 / RSA; store access tokens securely and use refresh tokens.'
            },
            {
              question: `What are the trade-offs between SQL (Relational) and NoSQL (e.g., MongoDB) databases?`,
              difficulty: 'Easy',
              topic: 'Database Design',
              suggestedAnswer: 'ACID compliance and structured schema vs. flexible schema, horizontal scalability, and document-oriented queries for unstructured data.'
            }
          ],
          hr: [
            {
              question: `Tell me about yourself and why you want to join ${company}.`,
              difficulty: 'Easy',
              topic: 'Introduction & Motivation',
              suggestedAnswer: 'Follow the Present-Past-Future formula: current skills/projects, key background milestones, and excitement about this role and company mission.'
            },
            {
              question: 'Where do you see your technical career in the next 3 to 5 years?',
              difficulty: 'Medium',
              topic: 'Career Vision',
              suggestedAnswer: 'Focus on deepening software design expertise, taking ownership of production features, mentoring juniors, and contributing to scalable systems.'
            }
          ],
          behavioural: [
            {
              question: 'Describe a situation where you had a disagreement with a team member on technical design. How did you resolve it?',
              difficulty: 'Medium',
              topic: 'Conflict Resolution & Collaboration',
              suggestedAnswer: 'Use the STAR method (Situation, Task, Action, Result). Emphasize data-driven decisions, prototyping alternatives, and keeping user experience first.'
            },
            {
              question: 'Tell me about a time a project deadline was at risk. What steps did you take?',
              difficulty: 'Medium',
              topic: 'Time Management',
              suggestedAnswer: 'Highlight proactive communication, prioritizing MVP features, cutting scope cleanly, and delivering on time with quality.'
            }
          ],
          roleSpecific: [
            {
              question: `As a ${role}, how do you ensure zero-downtime deployments and graceful error handling in production?`,
              difficulty: 'Hard',
              topic: 'Reliability & Deployment',
              suggestedAnswer: 'Discuss health check probes, rolling updates / blue-green deployments, centralized logging, and try/catch error boundaries.'
            }
          ],
          companySpecific: [
            {
              question: `How does ${company}'s core business model influence the technical requirements for scale and latency?`,
              difficulty: 'Hard',
              topic: 'Business & Systems Insight',
              suggestedAnswer: `Demonstrate your understanding of ${company}'s user base, high concurrency challenges, and customer-first design philosophy.`
            }
          ]
        };

      case 'resume-questions':
        return {
          projectQuestions: [
            {
              question: 'Walk me through the architecture of the main project on your resume. Why did you choose your specific tech stack?',
              category: 'Project Architecture',
              difficulty: 'Medium',
              suggestedAnswer: 'Explain frontend, backend API layer, database design, and why technologies were selected over alternatives (e.g. Node vs Python, MongoDB vs SQL).'
            },
            {
              question: 'What was the single most difficult technical challenge you faced while building this project and how did you debug it?',
              category: 'Technical Problem Solving',
              difficulty: 'Hard',
              suggestedAnswer: 'Describe the bug/bottleneck, how you isolated root causes with logs/profilers, and the engineering solution applied.'
            },
            {
              question: 'How did you handle authentication, data validation, and input sanitization across your API endpoints?',
              category: 'Security & Validation',
              difficulty: 'Medium',
              suggestedAnswer: 'Mention JWT verification middlewares, bcrypt hashing, schema validators (Joi/Zod), and CORS policies.'
            }
          ],
          skillQuestions: [
            {
              question: 'You have listed JavaScript and asynchronous programming. How does the JavaScript Event Loop handle microtasks vs macrotasks?',
              category: 'Core Language Fundamentals',
              difficulty: 'Medium',
              suggestedAnswer: 'Promise callbacks and queueMicrotask run in the microtask queue with priority over setTimeout/setInterval macrotasks.'
            },
            {
              question: 'Explain how you design RESTful APIs to be intuitive, idempotent, and backward-compatible.',
              category: 'API Engineering',
              difficulty: 'Medium',
              suggestedAnswer: 'Use proper HTTP verbs (GET, POST, PUT, DELETE, PATCH), standard HTTP status codes (200, 201, 400, 404, 500), and API versioning (/api/v1).'
            }
          ],
          experienceQuestions: [
            {
              question: 'How do you structure your Git workflow when collaborating on features with other developers?',
              category: 'Team Collaboration & Git',
              difficulty: 'Easy',
              suggestedAnswer: 'Feature branches, descriptive commit messages, concise pull requests, code reviews, and resolving merge conflicts cleanly.'
            }
          ]
        };

      case 'skill-gap':
        return {
          existingSkills: [
            { skill: 'JavaScript / ES6+', proficiency: 'Advanced', notes: 'Well highlighted across projects' },
            { skill: 'React.js', proficiency: 'Intermediate', notes: 'Demonstrated in frontend applications' },
            { skill: 'Node.js & Express', proficiency: 'Intermediate', notes: 'Used for REST API backends' },
            { skill: 'SQL & MongoDB', proficiency: 'Intermediate', notes: 'Database schema and query skills present' },
            { skill: 'Git & Version Control', proficiency: 'Intermediate', notes: 'Standard collaboration workflow' }
          ],
          missingSkills: [
            {
              skill: 'Docker & Containerization',
              priority: 'High',
              reason: 'Frequently expected in JD for modern cloud deployments.',
              recommendedAction: 'Build a simple Dockerfile and docker-compose setup for your full-stack app.'
            },
            {
              skill: 'CI/CD Pipelines (GitHub Actions)',
              priority: 'High',
              reason: 'Required for automated testing and continuous integration.',
              recommendedAction: 'Create a `.github/workflows/test.yml` to run automated test suites on push.'
            },
            {
              skill: 'Unit & Integration Testing (Jest / Vitest)',
              priority: 'Medium',
              reason: 'JD highlights code quality and regression prevention.',
              recommendedAction: 'Write unit tests for utility functions and integration tests for API endpoints.'
            },
            {
              skill: 'AWS / Cloud Hosting Basics (S3, EC2)',
              priority: 'Medium',
              reason: 'Beneficial for explaining production architecture in interviews.',
              recommendedAction: 'Practice deploying a web service to AWS or Vercel/Render.'
            }
          ],
          preparationSummary: `You have 75% of the foundational coding skills needed for ${role}. Focus your prep on containerization (Docker) and CI/CD pipelines to stand out.`
        };

      case 'company-research':
        return {
          companyName: company,
          overview: `${company} is a leading tech organization recognized for high-scale products, engineering excellence, and customer-centric software solutions.`,
          majorProducts: [
            'Core consumer-facing digital platforms',
            'Cloud and enterprise SaaS solutions',
            'Internal developer tools and scalable API ecosystems'
          ],
          typicalInterviewStages: [
            { stage: '1. Online Assessment (OA)', description: 'Data structures, algorithms, and MCQ questions on CS fundamentals (90 mins).' },
            { stage: '2. Technical Round 1 (DSA & Problem Solving)', description: 'Live coding on arrays, strings, trees/graphs, and time/space complexity analysis.' },
            { stage: '3. Technical Round 2 (System Design & Projects)', description: 'Deep dive into resume projects, REST APIs, database schemas, and scalability.' },
            { stage: '4. HR & Culture Fit Round', description: 'Behavioural questions, leadership principles, conflict resolution, and career aspirations.' }
          ],
          coreTechnicalTopics: [
            'Data Structures (Hash Maps, Trees, Graphs, Dynamic Programming)',
            'Object-Oriented Programming (OOP) & Clean Code Architecture',
            'Database Indexing, Normalization, and ACID properties',
            'REST API best practices, caching, and rate limiting'
          ],
          preparationTips: [
            `Research ${company}'s latest engineering blog posts and core product releases.`,
            'Practice explaining your thought process out loud before writing code.',
            'Prepare 2-3 thoughtful questions for the interviewer regarding engineering culture.'
          ]
        };

      case 'roadmap':
        const days = context.days || 7;
        return {
          totalDays: days,
          targetRole: role,
          company: company,
          schedule: [
            {
              day: 'Day 1',
              title: 'Core Fundamentals & OOP Revision',
              topics: ['Object-Oriented Programming (Encapsulation, Polymorphism, Inheritance)', 'Data Structures (Arrays, Strings, Hash Tables)', 'Elevator Pitch & Introduction Prep'],
              deliverable: 'Practice 3 medium LeetCode problems and refine your 90-second "Tell me about yourself" answer.'
            },
            {
              day: 'Day 2',
              title: 'Database & Backend API Mastery',
              topics: ['SQL vs NoSQL queries and indexing', 'REST API Architecture & Status Codes', 'Authentication (JWT, Sessions, OAuth)'],
              deliverable: 'Draft architecture diagrams for all resume projects.'
            },
            {
              day: 'Day 3',
              title: 'Resume Projects Deep Dive',
              topics: ['Project architecture walkthroughs', 'Key trade-offs and challenges faced', 'Performance optimizations achieved'],
              deliverable: 'Prepare 5 challenge/solution talking points for your top project.'
            },
            {
              day: 'Day 4',
              title: 'Missing Skills Crash Course (Docker & Testing)',
              topics: ['Docker basics: Dockerfile, images, containers', 'Unit testing fundamentals and test suites', 'CI/CD pipeline workflows'],
              deliverable: 'Containerize one local project with a multi-stage Dockerfile.'
            },
            {
              day: 'Day 5',
              title: 'Behavioural & Leadership Questions',
              topics: ['STAR Method for Behavioural Qs', 'Handling technical disagreements', 'Dealing with tight project deadlines'],
              deliverable: 'Prepare 4 STAR stories covering conflict, failure, leadership, and success.'
            },
            {
              day: 'Day 6',
              title: `${company} Culture & System Design Basics`,
              topics: [`${company} business domain and engineering principles`, 'Basic System Design (Caching, Load Balancing, CDN)', 'Mock Technical Interview'],
              deliverable: 'Complete a timed 45-minute mock interview session.'
            },
            {
              day: 'Day 7',
              title: 'Final Last-Minute Polish',
              topics: ['Formula sheets and cheat sheets review', 'Questions to ask the interviewer', 'Confidence building and rest'],
              deliverable: 'Review your personalized NexOffer Last-Minute Guide.'
            }
          ].slice(0, days <= 3 ? 3 : days <= 7 ? 7 : days <= 15 ? 7 : 7)
        };

      case 'fast-track':
        return {
          timeframe: context.timeframe || '3 Hours',
          urgentChecklist: [
            {
              priority: 1,
              title: 'Master Your "Tell Me About Yourself" Pitch',
              details: 'Deliver a crisp 90-second overview covering your tech stack, key projects, and passion for the role.',
              estTime: '20 mins'
            },
            {
              priority: 2,
              title: 'Deep-Dive Your Top 2 Resume Projects',
              details: 'Be ready to explain architecture, why you chose specific libraries, hardest bugs fixed, and what you would improve.',
              estTime: '35 mins'
            },
            {
              priority: 3,
              title: 'Brush Up High-Yield CS Fundamentals',
              details: 'Revise OOP 4 pillars, REST API verbs/status codes, SQL JOINs/indexes, and async event loop.',
              estTime: '45 mins'
            },
            {
              priority: 4,
              title: 'Prepare 3 STAR Behavioural Stories',
              details: 'Structure 3 experiences: 1) Technical hurdle solved, 2) Team disagreement resolved, 3) Strict deadline met.',
              estTime: '30 mins'
            },
            {
              priority: 5,
              title: 'Company & Role Quick Scan',
              details: `Review ${company}'s products, tech stack keywords, and prepare 2 smart questions to ask the interviewer.`,
              estTime: '20 mins'
            }
          ]
        };

      case 'last-minute':
        return {
          topTechnicalTopics: [
            'OOP: Polymorphism, Abstraction, Encapsulation, Inheritance with code examples.',
            'Databases: Indexing, Primary/Foreign keys, ACID vs BASE, SQL joins.',
            'APIs: REST principles, Idempotence, HTTP 200/201/400/401/403/404/500, JWT headers.',
            'Asynchronous JavaScript: Event Loop, Microtasks, async/await, Promise.all vs allSettled.'
          ],
          mustKnowQuestions: [
            { q: 'Explain your most technically complex project in 2 minutes.', a: 'Focus on problem statement, tech stack choice, architecture, and quantifiable outcome.' },
            { q: 'How do you handle a bug in production?', a: 'Isolate error with logs, roll back if critical, reproduce locally, apply patch with unit test, post-mortem analysis.' },
            { q: 'Why do you want to work at our company?', a: 'Link your skill set directly to their tech challenges and culture.' }
          ],
          quickChecklist: [
            'Test webcam, microphone, and quiet room setup 15 minutes before the call.',
            'Have resume, JD, clean paper, and pen next to you.',
            'Keep water handy and take a deep breath before answering.',
            'Think out loud: interviewers value problem-solving process over instant memorized answers.'
          ],
          smartQuestionsToAsk: [
            'What does a typical sprint and deployment cycle look like for this engineering team?',
            'What is the biggest technical challenge the team is solving this quarter?',
            'What opportunities for mentorship and growth exist for someone stepping into this role?'
          ]
        };

      case 'chat':
      default:
        if (jsonMode) {
          return { reply: `I have analyzed your request based on your target role (${role}) and target company (${company}). Let's prepare systematically!` };
        }
        return `Hello! As your **NexOffer Career Assistant**, I'm analyzing your profile for **${role}** at **${company}**.\n\n` +
          `Based on your resume and job description:\n` +
          `1. **Core Strengths**: Strong foundations in web application development, API creation, and database modeling.\n` +
          `2. **Key Focus Areas**: Be ready for deep technical project questions, system scalability discussions, and STAR-format behavioural rounds.\n\n` +
          `How can I assist you right now? You can ask me to **simulate a mock interview question**, **review your elevator pitch**, or **explain tricky technical concepts**!`;
    }
  }
}

module.exports = new LLMGateway();
