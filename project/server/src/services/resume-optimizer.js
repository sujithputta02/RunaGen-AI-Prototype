import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ResumeOptimizer {
  constructor() {
    this.project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    
    if (!this.project) {
      throw new Error('Vertex project not set. Set VERTEX_PROJECT_ID or GOOGLE_CLOUD_PROJECT');
    }

    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

    this.vertexAI = new VertexAI({ 
      project: this.project, 
      location: this.location,
      googleAuthOptions: { keyFile: credentialsPath }
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
  }

  // 🎯 HACKATHON FEATURE: AI Resume Optimization
  async optimizeResume(resumeText, targetRole, jobDescriptions = []) {
    try {
      const prompt = `You are an expert resume optimizer and ATS specialist. Optimize this resume for the target role and make it ATS-friendly.

ORIGINAL RESUME:
${resumeText}

TARGET ROLE: ${targetRole}

JOB DESCRIPTIONS FOR REFERENCE:
${jobDescriptions.slice(0, 3).map((jd, i) => `Job ${i + 1}: ${jd}`).join('\n\n')}

Provide optimization suggestions in JSON format:
{
  "optimized_resume": "Complete optimized resume text with improved formatting",
  "key_improvements": [
    {
      "section": "Professional Summary",
      "original": "Original text",
      "optimized": "Improved text",
      "reason": "Why this change improves ATS score"
    }
  ],
  "ats_score": 85,
  "keyword_optimization": {
    "added_keywords": ["keyword1", "keyword2"],
    "keyword_density": "2.5%",
    "missing_keywords": ["missing1", "missing2"]
  },
  "formatting_improvements": [
    "Use bullet points for achievements",
    "Add quantifiable metrics",
    "Improve section headers"
  ],
  "achievement_enhancements": [
    {
      "original": "Worked on projects",
      "enhanced": "Led 3 cross-functional projects resulting in 25% efficiency improvement"
    }
  ]
}

Return only valid JSON.`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const optimization = this.safeParseJson(response);
      
      if (!optimization) {
        throw new Error('Failed to parse optimization response');
      }

      return {
        ...optimization,
        optimization_timestamp: new Date().toISOString(),
        model_used: this.model,
        success: true
      };

    } catch (error) {
      console.error('Resume optimization failed:', error);
      return this.generateFallbackOptimization(resumeText, targetRole);
    }
  }

  // 🎯 HACKATHON FEATURE: AI Cover Letter Generation
  async generateCoverLetter(resumeData, jobDescription, companyName) {
    try {
      const prompt = `Generate a personalized cover letter based on the resume and job description.

RESUME DATA:
Skills: ${resumeData.skills?.join(', ') || 'N/A'}
Experience: ${resumeData.experience || 'N/A'}
Education: ${resumeData.education || 'N/A'}

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}

Generate a compelling cover letter in JSON format:
{
  "cover_letter": "Complete cover letter text",
  "key_highlights": [
    "Relevant experience point 1",
    "Relevant skill match 2",
    "Achievement that aligns with role"
  ],
  "personalization_elements": [
    "Company-specific research point",
    "Role-specific enthusiasm"
  ],
  "call_to_action": "Strong closing statement"
}

Return only valid JSON.`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const coverLetter = this.safeParseJson(response);
      
      return {
        ...coverLetter,
        generation_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('Cover letter generation failed:', error);
      return this.generateFallbackCoverLetter(resumeData, companyName);
    }
  }

  // 🎯 HACKATHON FEATURE: ATS Score Calculator
  async calculateATSScore(resumeText, jobDescription) {
    try {
      const prompt = `Analyze this resume against the job description and calculate an ATS (Applicant Tracking System) compatibility score.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide detailed ATS analysis in JSON format:
{
  "ats_score": 78,
  "score_breakdown": {
    "keyword_match": 85,
    "formatting": 70,
    "section_structure": 80,
    "readability": 75
  },
  "keyword_analysis": {
    "matched_keywords": ["JavaScript", "React", "Node.js"],
    "missing_keywords": ["Docker", "Kubernetes"],
    "keyword_density": "3.2%",
    "optimal_density": "2-4%"
  },
  "formatting_issues": [
    "Use standard section headers",
    "Add more bullet points",
    "Include contact information"
  ],
  "improvement_suggestions": [
    "Add 'Docker' and 'Kubernetes' to skills section",
    "Quantify achievements with specific metrics",
    "Use action verbs to start bullet points"
  ],
  "pass_probability": 82
}

Return only valid JSON.`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const atsAnalysis = this.safeParseJson(response);
      
      return {
        ...atsAnalysis,
        analysis_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('ATS score calculation failed:', error);
      return this.generateFallbackATSScore(resumeText);
    }
  }

  // Utility methods
  safeParseJson(text) {
    try {
      // Remove code fences if present
      let cleaned = text.replace(/```(?:json)?/gi, '').trim();
      
      // Try direct parse first
      try {
        return JSON.parse(cleaned);
      } catch (_) {}
      
      // Find JSON object boundaries
      let inString = false;
      let escapeNext = false;
      let depth = 0;
      let start = -1;
      
      for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];
        if (escapeNext) { escapeNext = false; continue; }
        if (ch === '\\') { if (inString) escapeNext = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') { if (depth === 0) start = i; depth++; continue; }
        if (ch === '}') {
          if (depth > 0) depth--;
          if (depth === 0 && start !== -1) {
            const candidate = cleaned.slice(start, i + 1);
            try { return JSON.parse(candidate); } catch (_) { /* continue */ }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  generateFallbackOptimization(resumeText, targetRole) {
    return {
      optimized_resume: resumeText,
      key_improvements: [
        {
          section: "Professional Summary",
          original: "Generic summary",
          optimized: "Role-specific summary with key achievements",
          reason: "Improves relevance and ATS matching"
        }
      ],
      ats_score: 65,
      keyword_optimization: {
        added_keywords: ["leadership", "problem-solving"],
        keyword_density: "2.0%",
        missing_keywords: ["industry-specific terms"]
      },
      formatting_improvements: [
        "Use consistent bullet points",
        "Add quantifiable achievements",
        "Improve section organization"
      ],
      achievement_enhancements: [],
      optimization_timestamp: new Date().toISOString(),
      model_used: 'fallback',
      success: false
    };
  }

  generateFallbackCoverLetter(resumeData, companyName) {
    return {
      cover_letter: `Dear Hiring Manager,\n\nI am excited to apply for this position at ${companyName}. My background in ${resumeData.skills?.slice(0, 3).join(', ') || 'relevant technologies'} makes me a strong candidate for this role.\n\nI look forward to discussing how my experience can contribute to your team.\n\nBest regards,\n[Your Name]`,
      key_highlights: ["Relevant experience", "Strong skill match", "Enthusiasm for role"],
      personalization_elements: [`Interest in ${companyName}`, "Role-specific motivation"],
      call_to_action: "I look forward to hearing from you",
      generation_timestamp: new Date().toISOString(),
      success: false
    };
  }

  generateFallbackATSScore(resumeText) {
    const wordCount = resumeText.split(/\s+/).length;
    const hasContactInfo = /email|phone|linkedin/i.test(resumeText);
    const hasSkillsSection = /skills|technical|technologies/i.test(resumeText);
    
    let score = 50;
    if (wordCount > 200) score += 10;
    if (hasContactInfo) score += 15;
    if (hasSkillsSection) score += 15;
    
    return {
      ats_score: Math.min(score, 100),
      score_breakdown: {
        keyword_match: score - 10,
        formatting: score - 5,
        section_structure: score,
        readability: score - 15
      },
      keyword_analysis: {
        matched_keywords: ["general skills"],
        missing_keywords: ["specific technical terms"],
        keyword_density: "2.0%",
        optimal_density: "2-4%"
      },
      formatting_issues: ["Standard formatting recommendations"],
      improvement_suggestions: ["Add more specific keywords", "Quantify achievements"],
      pass_probability: Math.min(score + 10, 95),
      analysis_timestamp: new Date().toISOString(),
      success: false
    };
  }
}

export const resumeOptimizer = new ResumeOptimizer();