import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// RAG-enhanced resume analysis with Gemini 2.5 Flash
export class RAGResumeAnalyzer {
  constructor() {
    this.project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    
    if (!this.project) {
      throw new Error('Vertex project not set. Set VERTEX_PROJECT_ID or GOOGLE_CLOUD_PROJECT');
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

    this.vertexAI = new VertexAI({ 
      project: this.project, 
      location: this.location,
      googleAuthOptions: { keyFile: credentialsPath }
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
    
    // Knowledge base for RAG
    this.knowledgeBase = this.buildKnowledgeBase();
  }

  // Build a knowledge base of industry standards, best practices, and role requirements
  buildKnowledgeBase() {
    return {
      'data-analyst': {
        skills: [
          'SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Excel', 'Statistics', 
          'Machine Learning', 'Data Visualization', 'ETL', 'BigQuery', 'Pandas',
          'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'Git', 'Docker'
        ],
        responsibilities: [
          'Data cleaning and preprocessing', 'Statistical analysis', 'Dashboard creation',
          'Report generation', 'Stakeholder communication', 'Data quality assurance',
          'A/B testing', 'Predictive modeling', 'Business intelligence'
        ],
        certifications: ['Google Analytics', 'Tableau Desktop Specialist', 'AWS Certified Data Analytics'],
        tools: ['Tableau', 'Power BI', 'Looker', 'Google Analytics', 'Mixpanel', 'Amplitude']
      },
      'software-engineer': {
        skills: [
          'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
          'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'REST APIs',
          'GraphQL', 'Microservices', 'CI/CD', 'Testing', 'Agile', 'Scrum'
        ],
        responsibilities: [
          'Full-stack development', 'Code review', 'System design', 'API development',
          'Database design', 'Performance optimization', 'Security implementation',
          'DevOps practices', 'Technical documentation', 'Mentoring junior developers'
        ],
        certifications: ['AWS Certified Developer', 'Google Cloud Professional Developer', 'Microsoft Azure Developer'],
        tools: ['VS Code', 'IntelliJ', 'Postman', 'Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes']
      },
      'product-manager': {
        skills: [
          'Product Strategy', 'User Research', 'Analytics', 'Roadmapping', 'SQL',
          'A/B Testing', 'Stakeholder Management', 'Agile', 'Scrum', 'Design Thinking',
          'Market Research', 'Competitive Analysis', 'Data Analysis', 'Communication'
        ],
        responsibilities: [
          'Product roadmap development', 'User story creation', 'Cross-functional collaboration',
          'Market research', 'Competitive analysis', 'Feature prioritization',
          'Stakeholder communication', 'Metrics definition', 'Go-to-market strategy'
        ],
        certifications: ['Google Analytics', 'Certified Scrum Product Owner', 'PMP'],
        tools: ['Jira', 'Confluence', 'Figma', 'Mixpanel', 'Google Analytics', 'Slack']
      },
      'ux-designer': {
        skills: [
          'Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing',
          'Usability Testing', 'Information Architecture', 'Interaction Design',
          'Visual Design', 'Design Systems', 'Accessibility', 'HTML/CSS', 'JavaScript'
        ],
        responsibilities: [
          'User research and interviews', 'Wireframe creation', 'Prototype development',
          'Usability testing', 'Design system maintenance', 'Stakeholder collaboration',
          'Accessibility compliance', 'Design documentation', 'User journey mapping'
        ],
        certifications: ['Google UX Design Certificate', 'Nielsen Norman Group UX Certification'],
        tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Maze', 'Hotjar', 'UserTesting']
      }
    };
  }

  // Enhanced prompt with RAG context
  buildRAGPrompt(resumeText, jdText, role) {
    const knowledge = this.knowledgeBase[role] || {};
    
    return `You are an expert resume analyst. Analyze the resume against the job description and return ONLY a valid JSON object with these exact fields:

{
  "skills_present": ["skill1", "skill2", "skill3"],
  "skills_missing": ["missing1", "missing2", "missing3"],
  "match_score": 75,
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1"],
  "industry_insights": ["insight1", "insight2"]
}

IMPORTANT: 
- Return ONLY the JSON object, no other text
- Use double quotes for all strings
- Escape any quotes in string values with backslash
- Keep arrays simple with 2-5 items each
- Match score should be 0-100 integer

CONTEXT FOR ${role.toUpperCase()}:
Required Skills: ${knowledge.skills?.join(', ') || 'N/A'}
Key Responsibilities: ${knowledge.responsibilities?.join(', ') || 'N/A'}

RESUME TEXT:
${resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${jdText}

JSON Response:`;
  }

  // Helper methods for extracting data when JSON parsing fails
  extractArrayFromText(text, fieldName) {
    const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i');
    const match = text.match(regex);
    if (match) {
      try {
        return JSON.parse(`[${match[1]}]`);
      } catch {
        // Fallback: extract items manually
        return match[1].split(',').map(item => item.trim().replace(/['"]/g, '')).filter(Boolean);
      }
    }
    return [];
  }

  extractNumberFromText(text, fieldName) {
    const regex = new RegExp(`"${fieldName}"\\s*:\\s*(\\d+)`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  }

  // Main RAG-enhanced analysis function
  async analyzeResumeWithRAG(resumeText, jdText, role) {
    try {
      const prompt = this.buildRAGPrompt(resumeText, jdText, role);
      
      const result = await this.generativeModel.generateContent({
        contents: [{ 
          role: 'user', 
          parts: [{ text: prompt }] 
        }]
      });

      const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text) {
        throw new Error('Empty response from Vertex AI');
      }

      // Extract JSON from response with better error handling
      let jsonStr = text.trim();
      
      // Try to find JSON object boundaries
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
      }
      
      // Clean up common JSON issues
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/'/g, '"')      // Replace single quotes with double quotes
        .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
        .replace(/:\s*([^",{\[\s][^",}\]\]]*?)([,}\]])/g, ': "$1"$2'); // Quote unquoted string values
      
      let analysis;
      try {
        analysis = JSON.parse(jsonStr);
      } catch (parseError) {
        console.warn('JSON parse failed, attempting to fix:', parseError.message);
        console.warn('Raw response:', text.substring(0, 500));
        
        // Try to extract individual fields as fallback
        const skillsPresent = this.extractArrayFromText(text, 'skills_present');
        const skillsMissing = this.extractArrayFromText(text, 'skills_missing');
        const matchScore = this.extractNumberFromText(text, 'match_score');
        
        analysis = {
          skills_present: skillsPresent,
          skills_missing: skillsMissing,
          match_score: matchScore || 50,
          recommendations: this.extractArrayFromText(text, 'recommendations') || [
            'Add more specific technical skills',
            'Include quantifiable achievements',
            'Highlight relevant project experience'
          ],
          strengths: this.extractArrayFromText(text, 'strengths') || [],
          concerns: this.extractArrayFromText(text, 'concerns') || [],
          industry_insights: this.extractArrayFromText(text, 'industry_insights') || []
        };
      }
      
      // Add RAG metadata
      analysis.rag_enhanced = true;
      analysis.model_used = this.model;
      analysis.analysis_timestamp = new Date().toISOString();
      
      return analysis;
      
    } catch (error) {
      console.error('RAG analysis error:', error);
      throw new Error(`RAG analysis failed: ${error.message}`);
    }
  }

  // Fallback to simple analysis if RAG fails
  async analyzeResumeWithFallback(resumeText, jdText, role) {
    const knowledge = this.knowledgeBase[role] || {};
    const lower = resumeText.toLowerCase();
    
    const skills = knowledge.skills || [];
    const present = skills.filter(skill => lower.includes(skill.toLowerCase()));
    const missing = skills.filter(skill => !present.includes(skill));
    const score = Math.round((present.length / skills.length) * 100);
    
    return {
      skills_present: present,
      skills_missing: missing.slice(0, 5), // Top 5 missing skills
      match_score: score,
      recommendations: [
        'Highlight specific achievements with metrics and numbers',
        'Include relevant certifications and professional development',
        'Showcase projects that demonstrate key technical skills',
        'Add industry-specific keywords and terminology',
        'Include quantifiable results from previous roles'
      ],
      strengths: present.slice(0, 3),
      concerns: missing.slice(0, 2),
      industry_insights: [
        'Consider adding more technical depth to key skills',
        'Include recent industry trends and technologies'
      ],
      rag_enhanced: false,
      model_used: 'fallback',
      analysis_timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const ragAnalyzer = new RAGResumeAnalyzer();
