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
      console.warn('Resume Optimizer: Vertex project not set. Using fallback mode.');
      this.isConfigured = false;
      return;
    }

    try {
      const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './new/career-companion-472510-c0aa769face2.json';
      const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

      this.vertexAI = new VertexAI({ 
        project: this.project, 
        location: this.location,
        googleAuthOptions: { keyFile: credentialsPath }
      });
      this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
      this.isConfigured = true;
    } catch (error) {
      console.warn('Resume Optimizer: Failed to initialize Vertex AI. Using fallback mode:', error.message);
      this.isConfigured = false;
    }
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

IMPORTANT: You must respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.

{
  "optimized_resume": "Complete optimized resume text with improved formatting and ATS-friendly structure",
  "key_improvements": [
    {
      "section": "Professional Summary",
      "original": "Original text from resume",
      "optimized": "Improved text with quantified achievements",
      "reason": "Why this change improves ATS score and relevance"
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
}`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      });

      const response = this.extractTextFromVertexResponse(result);
      let optimization = this.safeParseJson(response);
      
      if (!optimization) {
        // Soft-fallback: try to coerce a valid structure from raw text without erroring
        optimization = this.coerceOptimizationFromText(response, resumeText, targetRole);
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

IMPORTANT: You must respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.

{
  "cover_letter": "Complete cover letter text with professional greeting, body paragraphs highlighting relevant experience, and professional closing",
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
}`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });

      const response = this.extractTextFromVertexResponse(result);
      const coverLetter = this.safeParseJson(response) || {};
      
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
      const prompt = `Analyze this resume against the job description and calculate an ATS compatibility score.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Respond with ONLY this JSON structure:
{
  "ats_score": 82.7,
  "breakdown": {
    "keyword_match": 0.84,
    "semantic_similarity": 0.79,
    "experience_relevance": 0.85
  },
  "keyword_analysis": {
    "matched_keywords": ["Python", "SQL"],
    "missing_keywords": ["Machine Learning", "AWS"]
  },
  "semantic_analysis": {
    "similarity_score": 0.79,
    "missing_semantic_concepts": ["Machine Learning"]
  },
  "experience_analysis": {
    "role_relevance": 0.85,
    "industry_alignment": 0.80
  },
  "feedback": "Add Machine Learning skills and quantify achievements",
  "pass_probability": 82
}`;

      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      });

      const response = this.extractTextFromVertexResponse(result);
      const atsAnalysis = this.safeParseJson(response) || {};
      
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
      if (!text || typeof text !== 'string') return null;
      
      // Normalize smart quotes and remove code fences
      let cleaned = (text || '')
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/```(?:json)?/gi, '')
        .replace(/^[^{]*/, '') // Remove any text before the first {
        .replace(/[^}]*$/, '') // Remove any text after the last }
        .trim();
      
      // Try direct parse first
      try {
        return JSON.parse(cleaned);
      } catch (_) {}
      
      // Attempt to remove trailing commas
      try {
        const noTrailingCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(noTrailingCommas);
      } catch (_) {}

      // Find JSON object boundaries more robustly
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
            try { 
              const parsed = JSON.parse(candidate);
              if (parsed && typeof parsed === 'object') {
                return parsed;
              }
            } catch (_) { /* continue */ }
          }
        }
      }
      
      // Last resort: try to extract JSON from the entire text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (_) {}
      }
      
      // Try to fix truncated JSON by closing incomplete strings and objects
      try {
        let fixedJson = cleaned;
        
        // Count unclosed quotes and close them
        const quoteCount = (fixedJson.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) {
          fixedJson += '"';
        }
        
        // Count unclosed braces and close them
        const openBraces = (fixedJson.match(/\{/g) || []).length;
        const closeBraces = (fixedJson.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          // Add missing closing braces
          for (let i = 0; i < missingBraces; i++) {
            fixedJson += '}';
          }
        }
        
        return JSON.parse(fixedJson);
      } catch (_) {}
      
      return null;
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return null;
    }
  }

  // Extracts best-effort text from Vertex response across SDK variants
  extractTextFromVertexResponse(result) {
    try {
      // Prefer concatenating all text parts from the first candidate
      const parts = result?.response?.candidates?.[0]?.content?.parts || [];
      const joined = parts
        .map((p) => (typeof p?.text === 'string' ? p.text : ''))
        .filter(Boolean)
        .join('\n')
        .trim();
      if (joined) return joined;

      // Some SDKs expose a convenience text accessor
      const maybeText = result?.response?.text || result?.text;
      if (typeof maybeText === 'string' && maybeText.trim().length > 0) {
        return maybeText.trim();
      }

      // Fallback to the original single-part path
      return result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (_) {
      return '';
    }
  }

  // Attempts to build a minimally valid optimization object from arbitrary text
  coerceOptimizationFromText(rawText, originalResume, targetRole) {
    const text = (rawText || '').toString();
    const improvements = [];
    // Heuristic: look for lines with a colon to infer key-value improvements
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > 0 && improvements.length < 5) {
        const section = line.slice(0, idx).trim().slice(0, 60);
        const optimized = line.slice(idx + 1).trim().slice(0, 500);
        if (section && optimized) {
          improvements.push({
            section,
            original: '',
            optimized,
            reason: 'Extracted from model response when JSON parsing failed'
          });
        }
      }
    }

    return {
      optimized_resume: improvements.length > 0 ? improvements.map(i => `- ${i.section}: ${i.optimized}`).join('\n') : (text || originalResume),
      key_improvements: improvements.length > 0 ? improvements : [
        {
          section: 'General',
          original: '',
          optimized: 'Ensure clear summary, quantified achievements, and targeted keywords',
          reason: 'Default guidance applied when model output was not valid JSON'
        }
      ],
      ats_score: 70,
      keyword_optimization: {
        added_keywords: [],
        keyword_density: 'N/A',
        missing_keywords: []
      },
      formatting_improvements: [
        'Use consistent bullet points',
        'Quantify achievements',
        'Optimize headers for ATS parsers'
      ],
      achievement_enhancements: [],
      optimization_timestamp: new Date().toISOString(),
      model_used: this.model,
      target_role: targetRole,
      success: false,
      notes: 'Coerced from non-JSON response; consider adjusting model or prompt.'
    };
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