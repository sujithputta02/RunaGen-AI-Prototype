import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { VectorStore } from '../../utils/vectorStore.js';

// Enhanced RAG service with vector search and external sources
export class EnhancedRAGAnalyzer {
  constructor() {
    this.project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    
    if (!this.project) {
      console.warn('Enhanced RAG: Vertex project not set. Using fallback mode.');
      this.isConfigured = false;
      return;
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './new/career-companion-472510-c0aa769face2.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

    try {
      this.vertexAI = new VertexAI({ 
        project: this.project, 
        location: this.location,
        googleAuthOptions: { keyFile: credentialsPath }
      });
      this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
      this.isConfigured = true;
    } catch (error) {
      console.warn('Enhanced RAG: Failed to initialize Vertex AI. Using fallback mode:', error.message);
      this.isConfigured = false;
    }
    // Initialize embeddings model only if supported by current SDK version
    if (this.isConfigured && typeof this.vertexAI.getTextEmbeddingModel === 'function') {
      this.textEmbeddingModel = this.vertexAI.getTextEmbeddingModel({ model: 'text-embedding-005' });
    } else {
      this.textEmbeddingModel = null;
    }
    
    // In-memory vector store for demo (in production, use Pinecone, Weaviate, etc.)
    this.vectorStore = new Map();
    this.externalSources = this.initializeExternalSources();
    // Build a lightweight persistent in-memory index from industry standards
    this.globalIndex = new VectorStore(128);
    this.buildPersistentIndexFromStandards();
  }

  // Initialize external data sources
  initializeExternalSources() {
    return {
      jobBoards: [
        'https://api.github.com/search/repositories?q=job+description+data+analyst',
        'https://api.github.com/search/repositories?q=job+description+software+engineer',
        'https://api.github.com/search/repositories?q=job+description+product+manager'
      ],
      industryStandards: {
        'data-analyst': [
          'SQL proficiency for data querying and analysis',
          'Python/R for statistical analysis and data manipulation',
          'Tableau/Power BI for data visualization',
          'Excel advanced functions and pivot tables',
          'Statistical analysis and hypothesis testing',
          'Machine learning basics and predictive modeling',
          'Data cleaning and preprocessing techniques',
          'ETL processes and data pipeline development'
        ],
        'software-engineer': [
          'Proficiency in multiple programming languages (JavaScript, Python, Java)',
          'Frontend frameworks (React, Angular, Vue.js)',
          'Backend development (Node.js, Express, Django)',
          'Database design and management (SQL, NoSQL)',
          'Version control systems (Git, GitHub)',
          'Cloud platforms (AWS, Azure, GCP)',
          'DevOps practices and CI/CD pipelines',
          'Testing frameworks and methodologies'
        ],
        'product-manager': [
          'Product strategy and roadmap development',
          'User research and market analysis',
          'Agile/Scrum methodologies',
          'Data analysis and metrics interpretation',
          'Stakeholder management and communication',
          'A/B testing and experimentation',
          'Technical understanding of development processes',
          'Business analysis and requirements gathering'
        ],
        'ux-designer': [
          'User research and usability testing',
          'Wireframing and prototyping (Figma, Sketch)',
          'Information architecture and user flows',
          'Visual design and design systems',
          'Interaction design and micro-interactions',
          'Accessibility and inclusive design',
          'Design thinking and problem-solving',
          'Collaboration with developers and stakeholders'
        ],
        'cyber-security': [
          'Security Information and Event Management (SIEM) monitoring and alert triage',
          'Incident response (IR) procedures and runbooks',
          'Threat hunting and threat intelligence analysis',
          'Vulnerability management and penetration testing (OWASP, Nmap, Burp Suite)',
          'Endpoint detection and response (EDR/XDR) and log analysis',
          'Cloud security best practices (IAM, least privilege, encryption, CIS/NIST/ISO 27001)'
        ]
      }
    };
  }

  // Build a persistent in-memory index from known industry standards
  async buildPersistentIndexFromStandards() {
    try {
      const entries = Object.entries(this.externalSources.industryStandards || {});
      for (const [role, standards] of entries) {
        for (const text of standards) {
          const vec = await this.generateEmbedding(text);
          await this.globalIndex.add({ role, source: 'industry_standards', text }, vec);
        }
      }
      await this.globalIndex.build();
    } catch (err) {
      console.warn('Failed to build persistent standards index:', err.message);
    }
  }

  // Chunk resume text into smaller, analyzable pieces
  chunkResumeText(resumeText) {
    const chunks = [];
    const lines = resumeText.split('\n').filter(line => line.trim());
    
    let currentChunk = '';
    let chunkSize = 0;
    const maxChunkSize = 500; // characters per chunk
    
    for (const line of lines) {
      if (chunkSize + line.length > maxChunkSize && currentChunk) {
        chunks.push({
          text: currentChunk.trim(),
          type: this.identifyChunkType(currentChunk),
          lineNumbers: this.getLineNumbers(currentChunk, resumeText)
        });
        currentChunk = line;
        chunkSize = line.length;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
        chunkSize += line.length;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        type: this.identifyChunkType(currentChunk),
        lineNumbers: this.getLineNumbers(currentChunk, resumeText)
      });
    }
    
    return chunks;
  }

  // Identify the type of resume chunk
  identifyChunkType(chunk) {
    const lowerChunk = chunk.toLowerCase();
    
    if (lowerChunk.includes('experience') || lowerChunk.includes('work history')) {
      return 'experience';
    } else if (lowerChunk.includes('education') || lowerChunk.includes('degree')) {
      return 'education';
    } else if (lowerChunk.includes('skill') || lowerChunk.includes('technical')) {
      return 'skills';
    } else if (lowerChunk.includes('project') || lowerChunk.includes('portfolio')) {
      return 'projects';
    } else if (lowerChunk.includes('summary') || lowerChunk.includes('objective')) {
      return 'summary';
    } else if (lowerChunk.includes('certification') || lowerChunk.includes('certificate')) {
      return 'certifications';
    } else {
      return 'other';
    }
  }

  // Get line numbers for a chunk
  getLineNumbers(chunk, fullText) {
    const startIndex = fullText.indexOf(chunk);
    const linesBefore = fullText.substring(0, startIndex).split('\n').length - 1;
    const linesInChunk = chunk.split('\n').length;
    return {
      start: linesBefore,
      end: linesBefore + linesInChunk
    };
  }

  // Generate embeddings for text chunks using Vertex Text Embeddings
  async generateEmbedding(text) {
    try {
      if (!this.textEmbeddingModel) {
        // SDK version does not support Text Embeddings helper; use fallback
        return this.simpleHashEmbedding(text);
      }
      const result = await this.textEmbeddingModel.embedContent({
        content: {
          parts: [{ text }]
        }
      });
      const values = result?.embedding?.values || [];
      if (!values.length) throw new Error('Empty embedding response');
      return values;
    } catch (error) {
      console.warn('Embedding generation failed, using simple hash:', error.message);
      // Fallback: simple hash-based embedding
      return this.simpleHashEmbedding(text);
    }
  }

  // Robustly extract and parse the first JSON object from a text blob
  safeParseJsonFromText(text) {
    if (!text || typeof text !== 'string') return null;
    // Remove code fences if present
    let cleaned = text.replace(/```(?:json)?/gi, '').trim();
    // Fast path
    try { return JSON.parse(cleaned); } catch (_) {}
    // Scan for first complete JSON object, respecting strings/escapes
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
          try { return JSON.parse(candidate); } catch (_) { /* keep scanning */ }
        }
      }
    }
    // Try removing trailing commas, a common issue
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(cleaned); } catch (_) { return null; }
  }

  // Simple hash-based embedding fallback
  simpleHashEmbedding(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      embedding[hash % 128] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between vectors
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search for relevant external sources
  async searchExternalSources(query, role) {
    const results = [];
    
    try {
      // Search industry standards
      const industryStandards = this.externalSources.industryStandards[role] || [];
      const relevantStandards = industryStandards.filter(standard => 
        standard.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(standard.toLowerCase())
      );
      
      results.push(...relevantStandards.map(standard => ({
        source: 'industry_standards',
        content: standard,
        relevance: 0.9,
        type: 'requirement'
      })));

      // Query persistent standards index for semantically similar items
      try {
        const qVec = await this.generateEmbedding(query);
        const topFromIndex = await this.globalIndex.topK(qVec, 6);
        topFromIndex.forEach(({ item, score }) => {
          // Filter by role if provided
          if (!role || item.role === role) {
            results.push({
              source: 'standards_index',
              content: item.text,
              relevance: Math.max(0.5, Math.min(0.99, score)),
              type: 'requirement'
            });
          }
        });
      } catch (e) {
        console.warn('Standards index query failed:', e.message);
      }

      // Search job boards (simulated - in production, use real APIs)
      const jobBoardResults = await this.searchJobBoards(query, role);
      results.push(...jobBoardResults);

    } catch (error) {
      console.warn('External source search failed:', error.message);
    }
    
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }

  // Build ephemeral embedding index for given passages
  async buildEphemeralIndex(passages) {
    const vectors = [];
    for (const p of passages) {
      const vec = await this.generateEmbedding(p.text);
      vectors.push(vec);
    }
    return { vectors, passages };
  }

  // Retrieve top-k passages by cosine similarity
  async retrieveTopK(queryText, index, k = 6) {
    const qVec = await this.generateEmbedding(queryText);
    const scored = index.vectors.map((vec, i) => ({ i, score: this.cosineSimilarity(qVec, vec) }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(k, scored.length)).map(s => index.passages[s.i]);
    return top;
  }

  // Build prompt per roles template using retrieved passages
  buildRolesPrompt(resumeText, retrievedPassages) {
    let passagesStr = '';
    for (const p of retrievedPassages) {
      passagesStr += `[${p.id}] ${p.publisher || 'source'} (${p.date || 'n/a'}) - ${p.url || 'n/a'}\n${p.text}\n\n`;
    }
    return `Resume:\n${resumeText}\n\nJob Market Context:\n${passagesStr}\n\nAnalyze this resume and provide role analysis in JSON format:\n{\n  "roles": [\n    {\n      "role_name": "Software Engineer",\n      "matched_skills": ["JavaScript", "React", "Node.js"],\n      "missing_required_skills": ["REST API", "Testing"],\n      "missing_preferred_skills": ["Cloud platforms"],\n      "confidence": 85\n    }\n  ]\n}\n\nReturn only valid JSON.`;
  }

  // Simulate job board search
  async searchJobBoards(query, role) {
    // In production, integrate with real job board APIs
    const mockJobData = {
      'data-analyst': [
        'SQL expertise required for data analysis and reporting',
        'Python programming for statistical analysis and automation',
        'Tableau or Power BI experience for dashboard creation',
        'Strong analytical and problem-solving skills',
        'Experience with data cleaning and preprocessing'
      ],
      'software-engineer': [
        'Full-stack development experience with modern frameworks',
        'Proficiency in JavaScript, Python, or Java',
        'Experience with cloud platforms (AWS, Azure, GCP)',
        'Knowledge of version control and CI/CD practices',
        'Strong understanding of software development lifecycle'
      ]
    };

    const jobRequirements = mockJobData[role] || [];
    return jobRequirements.map(req => ({
      source: 'job_board',
      content: req,
      relevance: 0.8,
      type: 'requirement'
    }));
  }

  // Analyze each chunk with external context
  async analyzeChunk(chunk, role, externalContext) {
    const prompt = `Analyze this resume section against industry standards and job requirements:

RESUME SECTION (Lines ${chunk.lineNumbers.start}-${chunk.lineNumbers.end}):
${chunk.text}

SECTION TYPE: ${chunk.type}

EXTERNAL CONTEXT:
${externalContext.map(ctx => `- ${ctx.content} (Source: ${ctx.source})`).join('\n')}

Provide analysis in JSON format:
{
  "skills_found": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "relevance_score": 85
}

Return only valid JSON.`;

    try {
      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Chunk Analysis Response:', response);
      const parsed = this.safeParseJsonFromText(response);
      console.log('Chunk Parsed Analysis:', parsed);
      if (!parsed) throw new Error('Model returned non-JSON or malformed JSON');
      
      return {
        ...parsed,
        chunkType: chunk.type,
        lineNumbers: chunk.lineNumbers,
        chunkText: chunk.text
      };
    } catch (error) {
      console.warn('Chunk analysis failed:', error.message);
      // Generate meaningful fallback based on chunk content
      const skills = this.extractSkillsFromText(chunk.text);
      const gaps = this.generateSkillGaps(role, skills);
      return {
        skills_found: skills,
        strengths: [`Strong ${chunk.type} section`],
        gaps: gaps,
        recommendations: [`Improve ${chunk.type} section with more specific details`],
        relevance_score: 60,
        chunkType: chunk.type,
        lineNumbers: chunk.lineNumbers,
        chunkText: chunk.text
      };
    }
  }

  // Extract skills from text using simple keyword matching
  extractSkillsFromText(text) {
    const skillKeywords = {
      'JavaScript': ['javascript', 'js', 'ecmascript'],
      'TypeScript': ['typescript', 'ts'],
      'React': ['react', 'reactjs'],
      'Node.js': ['node', 'nodejs', 'node.js'],
      'Python': ['python', 'py'],
      'Java': ['java'],
      'SQL': ['sql', 'mysql', 'postgresql', 'database'],
      'Git': ['git', 'github', 'version control'],
      'Docker': ['docker', 'containerization'],
      'AWS': ['aws', 'amazon web services', 'cloud'],
      'HTML': ['html', 'html5'],
      'CSS': ['css', 'css3', 'styling'],
      'MongoDB': ['mongodb', 'mongo'],
      'Express': ['express', 'expressjs'],
      'Angular': ['angular', 'angularjs'],
      'Vue': ['vue', 'vuejs'],
      'Linux': ['linux', 'unix'],
      'REST': ['rest', 'restful', 'api'],
      'GraphQL': ['graphql'],
      'Kubernetes': ['kubernetes', 'k8s'],
      'Machine Learning': ['machine learning', 'ml', 'ai', 'artificial intelligence'],
      'Data Analysis': ['data analysis', 'analytics', 'statistics']
    };

    const foundSkills = [];
    const lowerText = text.toLowerCase();
    
    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  // Generate skill gaps based on role requirements
  generateSkillGaps(role, foundSkills) {
    const roleRequirements = {
      'software-engineer': ['Python', 'Docker', 'AWS', 'Machine Learning', 'Kubernetes'],
      'data-analyst': ['Python', 'SQL', 'Tableau', 'Statistics', 'Machine Learning'],
      'product-manager': ['User Research', 'Analytics', 'Agile', 'Stakeholder Management'],
      'ux-designer': ['Figma', 'User Research', 'Prototyping', 'Accessibility']
    };

    const requiredSkills = roleRequirements[role] || [];
    return requiredSkills.filter(skill => !foundSkills.includes(skill));
  }

  // Main enhanced analysis function (ephemeral RAG + roles analysis)
  async analyzeResumeWithEnhancedRAG(resumeText, jdText, role) {
    try {
      console.log('Starting enhanced RAG analysis...');
      
      // Step 1: Collect role-related passages (mocked external sources for now)
      const externalSources = await this.searchExternalSources(role, role);
      console.log(`Found ${externalSources.length} external sources`);
      const passages = externalSources.map((src, idx) => ({
        id: `src${idx + 1}`,
        publisher: src.source,
        date: new Date().toISOString().slice(0,10),
        url: '',
        text: src.content
      }));
      
      // Step 2: Build ephemeral index
      const index = await this.buildEphemeralIndex(passages);
      
      // Step 3: Retrieve top-k passages against the resume
      const topPassages = await this.retrieveTopK(resumeText, index, 6);
      
      // Step 4: Construct roles prompt
      const rolesPrompt = this.buildRolesPrompt(resumeText, topPassages);
      
      // Step 5: Call Gemini to get roles JSON
      const rolesResult = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: rolesPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      });
      const rolesText = rolesResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const rolesJson = this.safeParseJsonFromText(rolesText) || { roles: [] };
      
      // Derive simple aggregates for backward compatibility
      const matchedSkills = new Set();
      const missingSkills = new Set();
      (rolesJson.roles || []).forEach(r => {
        (r.matched_skills || []).forEach(s => matchedSkills.add(s));
        (r.missing_required_skills || []).forEach(obj => { if (obj && obj.skill) missingSkills.add(obj.skill); });
        (r.missing_preferred_skills || []).forEach(s => missingSkills.add(s));
      });

      // Fallback: also extract skills directly from resume text and merge
      const resumeExtractedSkills = this.extractSkillsFromText(resumeText);
      resumeExtractedSkills.forEach(s => matchedSkills.add(s));
      
      // If we still have no missing skills, infer from role requirements
      if (missingSkills.size === 0) {
        this.generateSkillGaps(role, Array.from(matchedSkills)).forEach(s => missingSkills.add(s));
      }
      
      const skillsPresentArray = Array.from(matchedSkills);
      const skillsMissingArray = Array.from(missingSkills);
      
      return {
        roles: rolesJson.roles || [],
        skills_present: skillsPresentArray,
        skills_missing: skillsMissingArray,
        recommendations: [],
        match_score: Math.min(100, Math.round(((rolesJson.roles || []).reduce((acc, r) => acc + (r.confidence || 0), 0) / ((rolesJson.roles || []).length || 1)))),
        external_sources_used: externalSources.length,
        rag_enhanced: true,
        model_used: this.model,
        analysis_timestamp: new Date().toISOString(),
        retrieved_passages: topPassages
      };
      
    } catch (error) {
      console.error('Enhanced RAG analysis failed:', error);
      throw new Error(`Enhanced RAG analysis failed: ${error.message}`);
    }
  }

  // Aggregate results from all chunks
  aggregateChunkAnalyses(chunkAnalyses, role) {
    const allSkillsFound = [];
    const allStrengths = [];
    const allGaps = [];
    const allRecommendations = [];
    
    chunkAnalyses.forEach(analysis => {
      allSkillsFound.push(...(analysis.skills_found || []));
      allStrengths.push(...(analysis.strengths || []));
      allGaps.push(...(analysis.gaps || []));
      allRecommendations.push(...(analysis.recommendations || []));
    });
    
    // Remove duplicates and prioritize
    const uniqueSkills = [...new Set(allSkillsFound)];
    const uniqueStrengths = [...new Set(allStrengths)];
    const uniqueGaps = [...new Set(allGaps)];
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    // Calculate overall match score
    const avgRelevanceScore = chunkAnalyses.reduce((sum, analysis) => 
      sum + (analysis.relevance_score || 50), 0) / chunkAnalyses.length;
    
    return {
      skills_present: uniqueSkills,
      skills_missing: uniqueGaps,
      strengths: uniqueStrengths,
      recommendations: uniqueRecommendations.slice(0, 5),
      match_score: Math.round(avgRelevanceScore)
    };
  }

  // Generate final comprehensive analysis
  async generateFinalAnalysis(resumeText, jdText, chunkAnalyses, externalSources, role) {
    const prompt = `Provide a comprehensive resume analysis based on detailed chunk-by-chunk analysis:

RESUME TEXT:
${resumeText.substring(0, 1500)}

JOB DESCRIPTION:
${jdText}

CHUNK ANALYSES:
${chunkAnalyses.map((analysis, i) => `
Chunk ${i + 1} (${analysis.chunkType}, Lines ${analysis.lineNumbers?.start}-${analysis.lineNumbers?.end}):
- Skills Found: ${analysis.skills_found?.join(', ') || 'None'}
- Strengths: ${analysis.strengths?.join(', ') || 'None'}
- Gaps: ${analysis.gaps?.join(', ') || 'None'}
- Relevance Score: ${analysis.relevance_score || 0}
`).join('\n')}

EXTERNAL SOURCES CONSULTED: ${externalSources.length} sources

Provide final analysis in JSON format:
{
  "skills_present": ["skill1", "skill2"],
  "skills_missing": ["missing1", "missing2"],
  "match_score": 75,
  "recommendations": ["rec1", "rec2", "rec3"],
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1"],
  "industry_insights": ["insight1", "insight2"],
  "detailed_feedback": {
    "experience_section": "feedback on experience",
    "skills_section": "feedback on skills",
    "education_section": "feedback on education",
    "overall_assessment": "overall assessment"
  }
}

Return only valid JSON.`;

    try {
      const result = await this.generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      });

      const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('AI Model Response:', response);
      const parsed = this.safeParseJsonFromText(response);
      console.log('Parsed Analysis:', parsed);
      if (!parsed) throw new Error('Model returned non-JSON or malformed JSON');
      const analysis = parsed;
      
      return analysis;
    } catch (error) {
      console.warn('Final analysis generation failed, using aggregated results:', error.message);
      return this.aggregateChunkAnalyses(chunkAnalyses, role);
    }
  }
}

// Export singleton instance
export const enhancedRAGAnalyzer = new EnhancedRAGAnalyzer();
