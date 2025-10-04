import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';
import { enhancedRAGAnalyzer } from './enhanced-rag-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 HACKATHON FEATURE: AI Career Trajectory Prediction
export class CareerTrajectoryPredictor {
  constructor() {
    this.project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    this.isConfigured = false;
    
    if (!this.project) {
      console.warn('Vertex project not configured. Career trajectory will use fallback mode.');
      return;
    }

    try {
      const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
      const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

      this.vertexAI = new VertexAI({ 
        project: this.project, 
        location: this.location,
        googleAuthOptions: { keyFile: credentialsPath }
      });
      this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
      this.isConfigured = true;
    } catch (error) {
      console.warn('Failed to initialize Vertex AI:', error.message);
      console.warn('Career trajectory will use fallback mode.');
    }
  }

  // Predict career trajectory based on current skills and market trends
  async predictCareerTrajectory(resumeData, targetRole, timeframe = '5-years') {
    // Validate inputs
    if (!resumeData || !targetRole) {
      console.warn('Invalid input data for career trajectory prediction');
      return this.generateFallbackTrajectory(resumeData || {}, targetRole || 'Software Engineer', timeframe);
    }

    // If not configured, use fallback immediately
    if (!this.isConfigured) {
      console.log('Using fallback trajectory (AI not configured)');
      return this.generateFallbackTrajectory(resumeData, targetRole, timeframe);
    }

    try {
      // Use RAG analysis to get market insights
      let ragInsights = null;
      try {
        const ragAnalysis = await enhancedRAGAnalyzer.analyzeResumeWithEnhancedRAG(
          `Skills: ${resumeData.skills?.join(', ') || 'N/A'}\nExperience: ${resumeData.experienceLevel || 'Entry Level'}\nCurrent Role: ${resumeData.currentRole || 'Not specified'}`,
          `Target Role: ${targetRole}`,
          targetRole
        );
        ragInsights = ragAnalysis;
        console.log('RAG analysis completed for career trajectory');
      } catch (ragError) {
        console.warn('RAG analysis failed, proceeding without market insights:', ragError.message);
      }

      const prompt = `Generate a career trajectory for a ${resumeData.experienceLevel || 'Entry Level'} professional targeting ${targetRole} over ${timeframe}.

PROFILE: Skills: ${resumeData.skills?.join(', ') || 'N/A'}, Current: ${resumeData.currentRole || 'Not specified'}

${ragInsights ? `MARKET DATA: Present: ${ragInsights.skills_present?.join(', ') || 'N/A'}, Missing: ${ragInsights.skills_missing?.join(', ') || 'N/A'}, Match: ${ragInsights.match_score || 0}%` : ''}

Return ONLY this JSON structure:
{
  "career_path": [
    {
      "year": 1,
      "role": "Junior Software Engineer",
      "skills_to_develop": ["Docker", "Kubernetes", "System Design"],
      "expected_salary_range": "$70,000 - $85,000",
      "probability": 85,
      "key_milestones": ["Complete certification", "Lead small project"],
      "market_demand": "High"
    }
  ],
  "alternative_paths": [
    {
      "path_name": "Technical Leadership Track",
      "roles": ["Senior Engineer", "Tech Lead", "Engineering Manager"],
      "timeline": "3-5 years",
      "success_probability": 70
    }
  ],
  "skill_evolution": {
    "technical_skills": ["Advanced React", "Cloud Architecture", "AI/ML"],
    "soft_skills": ["Leadership", "Strategic Thinking", "Mentoring"],
    "emerging_skills": ["Generative AI", "Edge Computing", "Quantum Computing"]
  },
  "market_insights": [
    "AI/ML skills will be crucial in next 2 years",
    "Remote work capabilities increasingly important",
    "Cross-functional collaboration skills in high demand"
  ],
  "risk_factors": [
    "Technology obsolescence risk: Medium",
    "Market saturation risk: Low",
    "Economic downturn impact: Medium"
  ],
  "success_probability": 78,
  "recommended_actions": [
    "Focus on cloud technologies in year 1",
    "Build leadership experience through mentoring",
    "Stay updated with AI/ML trends"
  ]
}

Return only valid JSON.`;

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 30000)
      );

      const aiPromise = this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      });

      const result = await Promise.race([aiPromise, timeoutPromise]);

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!response) {
        console.warn('Empty response from AI model, using fallback');
        return this.generateFallbackTrajectory(resumeData, targetRole, timeframe);
      }
      
      const trajectory = this.safeParseJson(response);
      
      if (!trajectory) {
        console.warn('Failed to parse AI response, using fallback. Response:', response.substring(0, 200));
        return this.generateFallbackTrajectory(resumeData, targetRole, timeframe);
      }

      return {
        ...trajectory,
        prediction_timestamp: new Date().toISOString(),
        model_used: this.model,
        success: true,
        rag_insights: ragInsights ? {
          skills_analysis: ragInsights.skills_present ? ragInsights.skills_present : [],
          missing_skills: ragInsights.skills_missing ? ragInsights.skills_missing : [],
          market_match_score: ragInsights.match_score || 0,
          external_sources_used: ragInsights.external_sources_used || 0
        } : null
      };

    } catch (error) {
      console.error('Career trajectory prediction failed:', error);
      return this.generateFallbackTrajectory(resumeData, targetRole, timeframe);
    }
  }

  // Generate salary predictions based on role and location
  async generateSalaryPredictions(role, location, experienceLevel) {
    try {
      const prompt = `Predict salary ranges for career progression in ${role} role.

CONTEXT:
Role: ${role}
Location: ${location}
Experience Level: ${experienceLevel}

Generate salary predictions in JSON format:
{
  "current_salary_range": {
    "min": 75000,
    "max": 95000,
    "currency": "USD",
    "confidence": 85
  },
  "salary_progression": [
    {
      "year": 1,
      "role_level": "Mid-level",
      "salary_range": {"min": 85000, "max": 105000},
      "growth_percentage": 12
    }
  ],
  "location_adjustments": {
    "san_francisco": {"multiplier": 1.4, "cost_of_living": "Very High"},
    "austin": {"multiplier": 1.1, "cost_of_living": "Medium"},
    "remote": {"multiplier": 0.9, "cost_of_living": "Variable"}
  },
  "negotiation_insights": [
    "Stock options can add 20-30% to total compensation",
    "Remote work flexibility valued at $5-10k equivalent"
  ]
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
      return this.safeParseJson(response) || this.generateFallbackSalary(role, experienceLevel);

    } catch (error) {
      console.error('Salary prediction failed:', error);
      return this.generateFallbackSalary(role, experienceLevel);
    }
  }

  // Utility methods
  safeParseJson(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    try {
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
      
      // Try to fix common truncation patterns
      try {
        let fixedJson = cleaned;
        
        // Handle skills_to_develop array truncation
        if (fixedJson.includes('"skills_to_develop": [')) {
          const skillsStart = fixedJson.indexOf('"skills_to_develop": [');
          const skillsEnd = fixedJson.indexOf(']', skillsStart);
          if (skillsEnd === -1) {
            // Array was truncated, close it
            fixedJson = fixedJson.substring(0, skillsStart + 22) + ']';
          }
        }
        
        // Handle incomplete strings
        const lastQuote = fixedJson.lastIndexOf('"');
        const lastComma = fixedJson.lastIndexOf(',');
        if (lastQuote < lastComma) {
          // String was truncated, close it
          fixedJson = fixedJson.substring(0, lastComma) + '"';
        }
        
        return JSON.parse(fixedJson);
      } catch (_) {}
      
      // Last resort: try to extract JSON from the entire text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (_) {}
      }
      
      return null;
    } catch (error) {
      console.warn('JSON parsing error:', error.message);
      return null;
    }
  }

  generateFallbackTrajectory(resumeData, targetRole, timeframe) {
    const years = parseInt(timeframe.split('-')[0]) || 5;
    const careerPath = [];
    
    for (let year = 1; year <= years; year++) {
      careerPath.push({
        year: year,
        role: year === 1 ? `Junior ${targetRole}` : year <= 3 ? `Mid-level ${targetRole}` : `Senior ${targetRole}`,
        skills_to_develop: ['Leadership', 'Advanced Technical Skills', 'Industry Knowledge'],
        expected_salary_range: `$${50000 + (year * 15000)} - $${70000 + (year * 20000)}`,
        probability: Math.max(90 - (year * 5), 60),
        key_milestones: [`Year ${year} milestone`],
        market_demand: year <= 2 ? 'High' : 'Medium'
      });
    }

    return {
      career_path: careerPath,
      alternative_paths: [{
        path_name: 'Alternative Track',
        roles: ['Specialist', 'Expert', 'Consultant'],
        timeline: `${years} years`,
        success_probability: 65
      }],
      skill_evolution: {
        technical_skills: ['Advanced frameworks', 'Architecture'],
        soft_skills: ['Leadership', 'Communication'],
        emerging_skills: ['AI/ML', 'Cloud technologies']
      },
      market_insights: ['Technology evolving rapidly', 'Continuous learning essential'],
      risk_factors: ['Technology changes', 'Market competition'],
      success_probability: 70,
      recommended_actions: ['Continuous learning', 'Network building', 'Skill development'],
      prediction_timestamp: new Date().toISOString(),
      model_used: 'fallback',
      success: false
    };
  }

  generateFallbackSalary(role, experienceLevel) {
    const baseSalary = role.includes('engineer') ? 80000 : role.includes('analyst') ? 70000 : 75000;
    const experienceMultiplier = experienceLevel === 'Senior' ? 1.5 : experienceLevel === 'Mid' ? 1.2 : 1.0;
    
    return {
      current_salary_range: {
        min: Math.round(baseSalary * experienceMultiplier * 0.9),
        max: Math.round(baseSalary * experienceMultiplier * 1.1),
        currency: 'USD',
        confidence: 70
      },
      salary_progression: [
        { year: 1, role_level: 'Next Level', salary_range: { min: Math.round(baseSalary * 1.1), max: Math.round(baseSalary * 1.3) }, growth_percentage: 15 }
      ],
      location_adjustments: {
        san_francisco: { multiplier: 1.4, cost_of_living: 'Very High' },
        remote: { multiplier: 0.95, cost_of_living: 'Variable' }
      },
      negotiation_insights: ['Research market rates', 'Highlight unique skills', 'Consider total compensation'],
      prediction_timestamp: new Date().toISOString(),
      success: false
    };
  }
}

export const careerTrajectoryPredictor = new CareerTrajectoryPredictor();