import axios from 'axios';

export class FallbackAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    this.useOpenAI = !!process.env.OPENAI_API_KEY;
    this.useAnthropic = !!process.env.ANTHROPIC_API_KEY;
  }

  async generateContent(prompt, options = {}) {
    try {
      if (this.useOpenAI) {
        return await this.generateWithOpenAI(prompt, options);
      } else if (this.useAnthropic) {
        return await this.generateWithAnthropic(prompt, options);
      } else {
        return this.generateMockResponse(prompt, options);
      }
    } catch (error) {
      console.warn('AI service failed, using mock response:', error.message);
      return this.generateMockResponse(prompt, options);
    }
  }

  async generateWithOpenAI(prompt, options) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
    }, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    return response.data.choices[0].message.content;
  }

  async generateWithAnthropic(prompt, options) {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-haiku-20240307',
      max_tokens: options.maxTokens || 1000,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    return response.data.content[0].text;
  }

  generateMockResponse(prompt, options) {
    // Smart mock responses based on prompt content
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('resume') && lowerPrompt.includes('optimize')) {
      return JSON.stringify({
        optimized_resume: "Mock optimized resume content with improved formatting and ATS-friendly structure",
        key_improvements: [
          {
            section: "Professional Summary",
            original: "Experienced professional",
            optimized: "Results-driven professional with 5+ years of experience",
            reason: "Added quantifiable experience and action-oriented language"
          }
        ],
        ats_score: 85,
        keyword_optimization: {
          added_keywords: ["leadership", "project management"],
          keyword_density: "2.5%",
          missing_keywords: ["agile", "scrum"]
        },
        formatting_improvements: [
          "Use bullet points for achievements",
          "Add quantifiable metrics",
          "Improve section headers"
        ]
      });
    }

    if (lowerPrompt.includes('career') && lowerPrompt.includes('trajectory')) {
      return JSON.stringify({
        career_path: [
          {
            year: 1,
            role: "Junior Developer",
            skills_to_develop: ["React", "Node.js", "Git"],
            expected_salary_range: "$60,000 - $75,000",
            probability: 85,
            key_milestones: ["Complete first project", "Get code review feedback"],
            market_demand: "High"
          },
          {
            year: 2,
            role: "Mid-level Developer",
            skills_to_develop: ["TypeScript", "AWS", "Testing"],
            expected_salary_range: "$75,000 - $90,000",
            probability: 80,
            key_milestones: ["Lead small team", "Mentor junior developers"],
            market_demand: "High"
          }
        ],
        alternative_paths: [
          {
            path_name: "Technical Leadership",
            roles: ["Senior Developer", "Tech Lead", "Engineering Manager"],
            timeline: "3-5 years",
            success_probability: 70
          }
        ],
        skill_evolution: {
          technical_skills: ["Advanced React", "Cloud Architecture", "AI/ML"],
          soft_skills: ["Leadership", "Communication", "Mentoring"],
          emerging_skills: ["Generative AI", "Edge Computing"]
        },
        success_probability: 78,
        recommended_actions: [
          "Focus on cloud technologies",
          "Build leadership experience",
          "Stay updated with AI trends"
        ]
      });
    }

    if (lowerPrompt.includes('mentor') || lowerPrompt.includes('advice')) {
      return JSON.stringify({
        reply_text: "Based on your profile, I recommend focusing on practical skills development and building a strong portfolio.",
        bullets: [
          "Complete 2-3 hands-on projects this month",
          "Join professional communities and networking groups",
          "Consider getting certified in your target technology stack"
        ],
        confidence: 85,
        sources: [{"docId": "mock_doc", "snippet": "Industry best practices suggest..."}],
        actions: [
          {
            type: "suggest_skill",
            skill: "React",
            why: "High demand in current market",
            learn_link: "https://react.dev/learn"
          }
        ],
        badges: ["MotivatedLearner"]
      });
    }

    // Default mock response
    return JSON.stringify({
      response: "This is a mock AI response. Please configure your API keys for real AI generation.",
      confidence: 50,
      mock: true,
      suggestion: "Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable for real AI responses"
    });
  }

  async generateResumeOptimization(resumeText, targetRole, jobDescriptions = []) {
    const prompt = `Optimize this resume for the target role: ${targetRole}\n\nResume: ${resumeText}\n\nJob Descriptions: ${jobDescriptions.join('\n')}`;
    const response = await this.generateContent(prompt, { maxTokens: 2000 });
    return this.safeParseJson(response);
  }

  async generateCareerTrajectory(resumeData, targetRole, timeframe = '5-years') {
    const prompt = `Generate a career trajectory for someone with this background: ${JSON.stringify(resumeData)}\nTarget role: ${targetRole}\nTimeframe: ${timeframe}`;
    const response = await this.generateContent(prompt, { maxTokens: 2000 });
    return this.safeParseJson(response);
  }

  async generateMentorResponse(userMessage, contextSnippets = [], intent = 'general') {
    const prompt = `As a career mentor, respond to: "${userMessage}"\nContext: ${contextSnippets.join('\n')}\nIntent: ${intent}`;
    const response = await this.generateContent(prompt, { maxTokens: 1000 });
    return this.safeParseJson(response);
  }

  safeParseJson(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse JSON response:', error.message);
      return {
        error: 'Failed to parse AI response',
        raw_response: jsonString,
        mock: true
      };
    }
  }
}

export default FallbackAIService;
