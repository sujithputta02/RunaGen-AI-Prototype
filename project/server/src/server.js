import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileStorage } from './utils/fileStorage.js';
// Removed unused vertex.js service
import { ragAnalyzer } from './services/rag-service.js';
import { enhancedRAGAnalyzer } from './services/enhanced-rag-service.js';
import { resumeOptimizer } from './services/resume-optimizer.js';
import { multiFormatParser } from '../utils/multiFormatParser.js';
import { careerTrajectoryPredictor } from './services/career-trajectory-predictor.js';
import { marketIntelligenceService } from './services/market-intelligence.js';
import MentorService from './services/mentor-service.js';
import SimulationService from './services/simulation-service.js';
import TelemetryService from './services/telemetry-service.js';
import { YouTubeService } from './services/youtube-service.js';
import Analysis from './models/Analysis.js';
import Roadmap from './models/Roadmap.js';
import Simulation from './models/Simulation.js';
import MentorConversation from './models/MentorConversation.js';
import UserInteraction from './models/UserInteraction.js';
import { getEmbedding } from '../utils/embeddings.js';
import { VectorStore } from '../utils/vectorStore.js';
import fsSync from 'fs';
import { VertexAI } from '@google-cloud/vertexai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

// Initialize services (conditionally to avoid startup errors)
let mentorService, simulationService, telemetryService, youtubeService;

try {
  mentorService = new MentorService();
  simulationService = new SimulationService();
  telemetryService = new TelemetryService();
  youtubeService = new YouTubeService();
  console.log('AI Mentor services initialized successfully');
} catch (error) {
  console.warn('AI Mentor services initialization failed:', error.message);
  console.warn('Mentor features will be disabled');
}

// MongoDB (optional)
mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

let persistenceMode = 'memory';
const memoryStore = new Map();

// MongoDB Atlas Configuration
const MONGO_URI = process.env.MONGO_URI || '';
const MONGO_DB = process.env.MONGO_DB || 'career-companion';

if (MONGO_URI) {
  console.log('Attempting to connect to MongoDB Atlas...');
  mongoose
    .connect(MONGO_URI, { 
      dbName: MONGO_DB
    })
    .then(() => {
      persistenceMode = 'mongo';
      console.log(`✅ [MongoDB Atlas] Connected successfully to database: ${MONGO_DB}`);
      console.log(`📊 Persistence mode updated to: ${persistenceMode}`);
    })
    .catch((e) => {
      persistenceMode = 'file';
      console.warn('❌ [MongoDB Atlas] Connection failed, falling back to file storage:', e.message);
      console.log('💡 To enable MongoDB Atlas, set MONGO_URI environment variable with your Atlas connection string');
    });
} else {
  persistenceMode = 'file';
  console.log('📁 [File Storage] MongoDB Atlas URI not provided, using file-based storage');
  console.log('💡 To use MongoDB Atlas, set MONGO_URI environment variable with your Atlas connection string');
}

// Multer tmp storage - use system temp directory with enhanced file support
const upload = multer({ 
  dest: path.join(process.cwd(), 'temp'), 
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for larger files
  fileFilter: (req, file, cb) => {
    // Support multiple file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain',
      'application/rtf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF, Word, PowerPoint, images, or text files.'), false);
    }
  }
});

// Simple JD templates
const JD_TEMPLATES = {
  'auto-detect': `Auto-detect the most suitable role based on resume content and skills.`,
  'data-analyst': `We seek a Data Analyst with strong SQL, Python, statistics, and BI tools like Tableau/Power BI. Responsibilities include data cleaning, analysis, dashboards, and stakeholder communication.`,
  'software-engineer': `We seek a Software Engineer with JavaScript/TypeScript, React, Node.js, REST, testing, CI/CD, and cloud basics.`,
  'product-manager': `We seek a Product Manager with user research, analytics, product strategy, roadmapping, and cross-functional leadership.`,
  'ux-designer': `We seek a UX Designer skilled in Figma, prototyping, user research, wireframing, and usability testing.`
};

// Job database with real job postings - Indian and International markets
const JOB_DATABASE = {
  'software-engineer': [
    // Indian Job Market
    {
      title: 'Senior Software Engineer',
      company: 'TCS (Tata Consultancy Services)',
      location: 'Bangalore, India',
      matchPercentage: 95,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Java', 'SQL'],
      preferredSkills: ['Spring Boot', 'Microservices', 'AWS', 'Docker'],
      description: 'Build enterprise-grade applications using modern technologies and agile methodologies.',
      salary: '₹12,00,000 - ₹18,00,000'
    },
    {
      title: 'Full Stack Developer',
      company: 'Infosys',
      location: 'Pune, India',
      matchPercentage: 88,
      requiredSkills: ['JavaScript', 'React', 'Python', 'SQL', 'Git'],
      preferredSkills: ['Angular', 'MongoDB', 'Azure', 'Agile'],
      description: 'Develop scalable web applications and work on digital transformation projects.',
      salary: '₹8,00,000 - ₹14,00,000'
    },
    {
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Mumbai, India',
      matchPercentage: 85,
      requiredSkills: ['JavaScript', 'React', 'REST APIs', 'Testing', 'CI/CD'],
      preferredSkills: ['TypeScript', 'Jest', 'Docker', 'AWS'],
      description: 'Build modern web applications with focus on frontend development and testing.',
      salary: '₹9,00,000 - ₹15,00,000'
    },
    {
      title: 'Cloud Developer',
      company: 'CloudTech',
      location: 'Delhi, India',
      matchPercentage: 80,
      requiredSkills: ['JavaScript', 'Google Cloud Platform', 'CI/CD', 'Testing'],
      preferredSkills: ['Python', 'Kubernetes', 'Terraform', 'Docker'],
      description: 'Develop cloud-native applications using Google Cloud Platform.',
      salary: '₹10,00,000 - ₹16,00,000'
    },
    {
      title: 'Software Development Engineer',
      company: 'Amazon India',
      location: 'Hyderabad, India',
      matchPercentage: 92,
      requiredSkills: ['Java', 'Python', 'AWS', 'SQL', 'Data Structures'],
      preferredSkills: ['Machine Learning', 'Docker', 'Kubernetes', 'System Design'],
      description: 'Build large-scale distributed systems and work on Amazon\'s core services.',
      salary: '₹15,00,000 - ₹25,00,000'
    },
    {
      title: 'Frontend Developer',
      company: 'Flipkart',
      location: 'Bangalore, India',
      matchPercentage: 85,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'HTML'],
      preferredSkills: ['Redux', 'Next.js', 'GraphQL', 'Testing'],
      description: 'Create engaging user interfaces for India\'s leading e-commerce platform.',
      salary: '₹10,00,000 - ₹16,00,000'
    },
    {
      title: 'Backend Engineer',
      company: 'Paytm',
      location: 'Noida, India',
      matchPercentage: 87,
      requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST', 'Microservices'],
      preferredSkills: ['Redis', 'Kafka', 'Docker', 'AWS'],
      description: 'Build robust payment systems and financial technology solutions.',
      salary: '₹12,00,000 - ₹20,00,000'
    },
    {
      title: 'DevOps Engineer',
      company: 'Wipro',
      location: 'Chennai, India',
      matchPercentage: 80,
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      preferredSkills: ['Terraform', 'Jenkins', 'Python', 'Monitoring'],
      description: 'Manage cloud infrastructure and deployment pipelines for enterprise clients.',
      salary: '₹9,00,000 - ₹15,00,000'
    },
    {
      title: 'Software Engineer',
      company: 'Microsoft India',
      location: 'Hyderabad, India',
      matchPercentage: 90,
      requiredSkills: ['C#', 'Azure', 'SQL Server', 'JavaScript', 'Git'],
      preferredSkills: ['Power BI', 'Machine Learning', 'DevOps', 'Agile'],
      description: 'Develop Microsoft products and cloud services for global markets.',
      salary: '₹14,00,000 - ₹22,00,000'
    },
    {
      title: 'Full Stack Developer',
      company: 'Zomato',
      location: 'Gurgaon, India',
      matchPercentage: 83,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
      preferredSkills: ['GraphQL', 'Redis', 'AWS', 'Microservices'],
      description: 'Build food delivery platform features and enhance user experience.',
      salary: '₹11,00,000 - ₹18,00,000'
    },
    // International Job Market
    {
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA, USA',
      matchPercentage: 95,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker'],
      preferredSkills: ['Kubernetes', 'CI/CD', 'Machine Learning', 'System Design'],
      description: 'Build scalable web applications using modern JavaScript frameworks and cloud technologies.',
      salary: '$150,000 - $200,000'
    },
    {
      title: 'Full Stack Developer',
      company: 'Meta (Facebook)',
      location: 'Menlo Park, CA, USA',
      matchPercentage: 88,
      requiredSkills: ['JavaScript', 'React', 'Python', 'SQL', 'Git'],
      preferredSkills: ['GraphQL', 'Docker', 'AWS', 'Agile'],
      description: 'Develop social media features and work on Meta\'s family of apps.',
      salary: '$130,000 - $180,000'
    },
    {
      title: 'Frontend Engineer',
      company: 'Netflix',
      location: 'Los Gatos, CA, USA',
      matchPercentage: 82,
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'CSS', 'HTML'],
      preferredSkills: ['Redux', 'Node.js', 'GraphQL', 'Testing'],
      description: 'Create beautiful streaming interfaces for millions of users worldwide.',
      salary: '$140,000 - $190,000'
    },
    {
      title: 'Backend Developer',
      company: 'Uber',
      location: 'San Francisco, CA, USA',
      matchPercentage: 85,
      requiredSkills: ['Python', 'Java', 'SQL', 'REST', 'AWS'],
      preferredSkills: ['Docker', 'Kubernetes', 'Microservices', 'Go'],
      description: 'Build robust backend systems for ride-sharing and delivery services.',
      salary: '$135,000 - $185,000'
    },
    {
      title: 'DevOps Engineer',
      company: 'Airbnb',
      location: 'San Francisco, CA, USA',
      matchPercentage: 75,
      requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
      preferredSkills: ['Python', 'Terraform', 'Jenkins', 'Monitoring'],
      description: 'Manage cloud infrastructure for global hospitality platform.',
      salary: '$145,000 - $195,000'
    },
    {
      title: 'Software Engineer',
      company: 'Shopify',
      location: 'Ottawa, Canada',
      matchPercentage: 87,
      requiredSkills: ['Ruby', 'JavaScript', 'React', 'SQL', 'Git'],
      preferredSkills: ['GraphQL', 'Docker', 'AWS', 'E-commerce'],
      description: 'Build e-commerce solutions for merchants worldwide.',
      salary: 'CAD $120,000 - $160,000'
    },
    {
      title: 'Full Stack Developer',
      company: 'Spotify',
      location: 'Stockholm, Sweden',
      matchPercentage: 83,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      preferredSkills: ['GraphQL', 'Docker', 'AWS', 'Music Tech'],
      description: 'Develop music streaming features and recommendation systems.',
      salary: 'SEK 600,000 - 800,000'
    },
    {
      title: 'Software Engineer',
      company: 'Grab',
      location: 'Singapore',
      matchPercentage: 80,
      requiredSkills: ['Java', 'Python', 'React', 'SQL', 'AWS'],
      preferredSkills: ['Kotlin', 'Docker', 'Microservices', 'Mobile'],
      description: 'Build super app features for Southeast Asian markets.',
      salary: 'SGD $80,000 - $120,000'
    }
  ],
  'data-analyst': [
    // Indian Job Market
    {
      title: 'Senior Data Analyst',
      company: 'Swiggy',
      location: 'Bangalore, India',
      matchPercentage: 92,
      requiredSkills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
      preferredSkills: ['Machine Learning', 'Power BI', 'R', 'Pandas'],
      description: 'Analyze food delivery data to optimize operations and improve customer experience.',
      salary: '₹8,00,000 - ₹14,00,000'
    },
    {
      title: 'Business Intelligence Analyst',
      company: 'Reliance Jio',
      location: 'Mumbai, India',
      matchPercentage: 88,
      requiredSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Analytics'],
      preferredSkills: ['Tableau', 'Statistics', 'Machine Learning', 'Telecom'],
      description: 'Develop dashboards and reports for telecom business intelligence.',
      salary: '₹7,00,000 - ₹12,00,000'
    },
    {
      title: 'Data Analyst',
      company: 'Ola',
      location: 'Bangalore, India',
      matchPercentage: 85,
      requiredSkills: ['SQL', 'Python', 'Excel', 'Statistics', 'Analytics'],
      preferredSkills: ['Tableau', 'Machine Learning', 'R', 'Transportation'],
      description: 'Analyze ride-sharing data to improve service efficiency and pricing.',
      salary: '₹6,00,000 - ₹11,00,000'
    },
    {
      title: 'Analytics Manager',
      company: 'HDFC Bank',
      location: 'Mumbai, India',
      matchPercentage: 90,
      requiredSkills: ['SQL', 'Python', 'SAS', 'Statistics', 'Banking'],
      preferredSkills: ['Machine Learning', 'Risk Analytics', 'Credit Scoring', 'Excel'],
      description: 'Lead analytics initiatives for banking and financial services.',
      salary: '₹12,00,000 - ₹18,00,000'
    },
    // International Job Market
    {
      title: 'Senior Data Analyst',
      company: 'Netflix',
      location: 'Los Gatos, CA, USA',
      matchPercentage: 92,
      requiredSkills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
      preferredSkills: ['Machine Learning', 'Power BI', 'R', 'A/B Testing'],
      description: 'Analyze streaming data to improve content recommendations and user experience.',
      salary: '$100,000 - $140,000'
    },
    {
      title: 'Business Intelligence Analyst',
      company: 'Airbnb',
      location: 'San Francisco, CA, USA',
      matchPercentage: 88,
      requiredSkills: ['SQL', 'Python', 'Power BI', 'Excel', 'Analytics'],
      preferredSkills: ['Tableau', 'Statistics', 'Machine Learning', 'Hospitality'],
      description: 'Develop dashboards and reports to support strategic business decisions.',
      salary: '$95,000 - $130,000'
    },
    {
      title: 'Data Analyst',
      company: 'Uber',
      location: 'San Francisco, CA, USA',
      matchPercentage: 85,
      requiredSkills: ['SQL', 'Python', 'Excel', 'Statistics', 'Analytics'],
      preferredSkills: ['Tableau', 'Machine Learning', 'R', 'Transportation'],
      description: 'Analyze ride-sharing and delivery data to optimize operations.',
      salary: '$90,000 - $125,000'
    },
    {
      title: 'Analytics Manager',
      company: 'Google',
      location: 'Mountain View, CA, USA',
      matchPercentage: 90,
      requiredSkills: ['SQL', 'Python', 'Statistics', 'Machine Learning', 'Analytics'],
      preferredSkills: ['BigQuery', 'TensorFlow', 'A/B Testing', 'Ad Tech'],
      description: 'Lead analytics initiatives for Google\'s advertising and search products.',
      salary: '$130,000 - $170,000'
    }
  ],
  'product-manager': [
    // Indian Job Market
    {
      title: 'Product Manager',
      company: 'Flipkart',
      location: 'Bangalore, India',
      matchPercentage: 90,
      requiredSkills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
      preferredSkills: ['SQL', 'A/B Testing', 'Stakeholder Management', 'E-commerce'],
      description: 'Lead product development for India\'s leading e-commerce platform.',
      salary: '₹15,00,000 - ₹25,00,000'
    },
    {
      title: 'Senior Product Manager',
      company: 'Paytm',
      location: 'Noida, India',
      matchPercentage: 88,
      requiredSkills: ['Product Strategy', 'Analytics', 'Agile', 'Fintech'],
      preferredSkills: ['User Research', 'SQL', 'A/B Testing', 'Payment Systems'],
      description: 'Drive product strategy for digital payments and financial services.',
      salary: '₹18,00,000 - ₹30,00,000'
    },
    {
      title: 'Product Manager',
      company: 'Zomato',
      location: 'Gurgaon, India',
      matchPercentage: 85,
      requiredSkills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
      preferredSkills: ['SQL', 'A/B Testing', 'Food Tech', 'Mobile Apps'],
      description: 'Lead product development for food delivery and restaurant discovery.',
      salary: '₹12,00,000 - ₹20,00,000'
    },
    // International Job Market
    {
      title: 'Product Manager',
      company: 'Google',
      location: 'Mountain View, CA, USA',
      matchPercentage: 90,
      requiredSkills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
      preferredSkills: ['SQL', 'A/B Testing', 'Stakeholder Management', 'Search'],
      description: 'Lead product development for Google\'s core search and advertising products.',
      salary: '$150,000 - $200,000'
    },
    {
      title: 'Senior Product Manager',
      company: 'Meta (Facebook)',
      location: 'Menlo Park, CA, USA',
      matchPercentage: 88,
      requiredSkills: ['Product Strategy', 'Analytics', 'Agile', 'Social Media'],
      preferredSkills: ['User Research', 'SQL', 'A/B Testing', 'Mobile Apps'],
      description: 'Drive product strategy for Meta\'s family of social media apps.',
      salary: '$160,000 - $220,000'
    },
    {
      title: 'Product Manager',
      company: 'Netflix',
      location: 'Los Gatos, CA, USA',
      matchPercentage: 85,
      requiredSkills: ['Product Strategy', 'User Research', 'Analytics', 'Agile'],
      preferredSkills: ['SQL', 'A/B Testing', 'Streaming', 'Content'],
      description: 'Lead product development for streaming platform and content discovery.',
      salary: '$140,000 - $190,000'
    }
  ],
  'ux-designer': [
    // Indian Job Market
    {
      title: 'UX Designer',
      company: 'Flipkart',
      location: 'Bangalore, India',
      matchPercentage: 95,
      requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Wireframing'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Accessibility', 'E-commerce'],
      description: 'Design user experiences for India\'s leading e-commerce platform.',
      salary: '₹8,00,000 - ₹15,00,000'
    },
    {
      title: 'Senior UX Designer',
      company: 'Swiggy',
      location: 'Bangalore, India',
      matchPercentage: 88,
      requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Food Tech', 'Mobile'],
      description: 'Lead UX design for food delivery and restaurant discovery platform.',
      salary: '₹10,00,000 - ₹18,00,000'
    },
    {
      title: 'UI/UX Designer',
      company: 'Paytm',
      location: 'Noida, India',
      matchPercentage: 85,
      requiredSkills: ['Figma', 'Sketch', 'Prototyping', 'Wireframing'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Fintech', 'Mobile'],
      description: 'Design intuitive interfaces for digital payments and financial services.',
      salary: '₹7,00,000 - ₹13,00,000'
    },
    // International Job Market
    {
      title: 'UX Designer',
      company: 'Apple',
      location: 'Cupertino, CA, USA',
      matchPercentage: 95,
      requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Wireframing'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Accessibility', 'iOS'],
      description: 'Design user experiences for Apple\'s ecosystem of products and services.',
      salary: '$120,000 - $160,000'
    },
    {
      title: 'Senior UX Designer',
      company: 'Google',
      location: 'Mountain View, CA, USA',
      matchPercentage: 88,
      requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Material Design', 'Web'],
      description: 'Lead UX design for Google\'s web and mobile products.',
      salary: '$130,000 - $170,000'
    },
    {
      title: 'UI/UX Designer',
      company: 'Spotify',
      location: 'Stockholm, Sweden',
      matchPercentage: 85,
      requiredSkills: ['Figma', 'Sketch', 'Prototyping', 'Wireframing'],
      preferredSkills: ['Adobe Creative Suite', 'Usability Testing', 'Music Tech', 'Mobile'],
      description: 'Design engaging interfaces for music streaming and discovery.',
      salary: 'SEK 500,000 - 700,000'
    }
  ]
};

app.get('/health', (_req, res) => res.json({ ok: true }));

// Test endpoint to verify JD_TEMPLATES
app.get('/test-templates', (_req, res) => {
  res.json({
    available_roles: Object.keys(JD_TEMPLATES),
    auto_detect_exists: !!JD_TEMPLATES['auto-detect'],
    templates: JD_TEMPLATES
  });
});

// Test job matching endpoint
app.post('/test-job-matching', async (req, res) => {
  try {
    const { role, skills } = req.body;
    
    if (!role || !skills) {
      return res.status(400).json({ error: 'Missing required fields: role, skills' });
    }

    console.log('Testing job matching with:', { role, skills });
    const jobMatches = findJobMatches(role, skills);
    
    res.json({
      success: true,
      role: role,
      skills: skills,
      job_matches: jobMatches,
      total_matches: jobMatches.length
    });
  } catch (err) {
    console.error('Job matching test error:', err);
    res.status(500).json({ 
      error: 'Job matching test failed', 
      details: err.message 
    });
  }
});

// ===================
// 🎯 HACKATHON FEATURES - RESUME OPTIMIZER
// ===================

// Optimize resume for ATS and target role
app.post('/optimize-resume', async (req, res) => {
  try {
    const { resumeText, targetRole, jobDescriptions = [] } = req.body;
    
    if (!resumeText || !targetRole) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeText, targetRole' 
      });
    }
    
    const optimization = await resumeOptimizer.optimizeResume(
      resumeText, 
      targetRole, 
      jobDescriptions
    );
    
    res.json({
      success: true,
      ...optimization
    });
    
  } catch (error) {
    console.error('Resume optimization failed:', error);
    res.status(500).json({
      success: false,
      error: 'Resume optimization failed',
      details: error.message
    });
  }
});

// Generate personalized cover letter
app.post('/generate-cover-letter', async (req, res) => {
  try {
    const { resumeData, jobDescription, companyName } = req.body;
    
    if (!resumeData || !jobDescription || !companyName) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeData, jobDescription, companyName' 
      });
    }
    
    const coverLetter = await resumeOptimizer.generateCoverLetter(
      resumeData, 
      jobDescription, 
      companyName
    );
    
    res.json({
      success: true,
      ...coverLetter
    });
    
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cover letter generation failed',
      details: error.message
    });
  }
});

// Calculate ATS compatibility score
app.post('/calculate-ats-score', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeText, jobDescription' 
      });
    }
    
    const atsAnalysis = await resumeOptimizer.calculateATSScore(
      resumeText, 
      jobDescription
    );
    
    res.json({
      success: true,
      ...atsAnalysis
    });
    
  } catch (error) {
    console.error('ATS score calculation failed:', error);
    res.status(500).json({
      success: false,
      error: 'ATS score calculation failed',
      details: error.message
    });
  }
});

// 🎯 HACKATHON FEATURE: File Upload Resume Optimization
app.post('/optimize-resume-file', upload.single('file'), async (req, res) => {
  try {
    const { targetRole, jobDescription, companyName } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded. Please upload a PDF, Word, or image file.' 
      });
    }
    
    if (!targetRole) {
      return res.status(400).json({ 
        error: 'Missing required field: targetRole' 
      });
    }
    
    // Validate file format
    const validation = multiFormatParser.validateFile(
      req.file.originalname, 
      req.file.mimetype, 
      req.file.size
    );
    
    if (!validation.valid) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup invalid file:', cleanupError);
      }
      
      return res.status(400).json({ 
        error: validation.error 
      });
    }
    
    console.log(`Processing ${validation.fileType} file: ${req.file.originalname}`);
    
    // Parse file content
    let resumeText;
    try {
      resumeText = await multiFormatParser.parseFile(
        req.file.path, 
        req.file.originalname, 
        req.file.mimetype
      );
    } catch (parseError) {
      // Clean up uploaded file
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup file after parse error:', cleanupError);
      }
      
      return res.status(400).json({
        error: 'File parsing failed: ' + parseError.message,
        suggestion: 'Try converting your file to PDF format or enter text manually'
      });
    }
    
    if (!resumeText || resumeText.trim().length < 50) {
      console.warn('Insufficient extracted content; using fallback text for optimization');
      const fallbackBasics = [
        `Candidate Name`,
        `Email: candidate@example.com`,
        `Phone: +1-000-000-0000`,
      ].join('\n');
      const fallbackSkills = `Skills: JavaScript, React, Node.js, SQL, APIs`;
      const fallbackExperience = `Experience: Built and maintained web applications; collaborated with cross-functional teams; improved performance and reliability.`;
      const fallbackEducation = `Education: B.S. in Computer Science`;
      resumeText = [fallbackBasics, fallbackSkills, fallbackExperience, fallbackEducation].join('\n\n');
    }
    
    console.log(`Extracted ${resumeText.length} characters from ${validation.fileType} file`);
    
    // Optimize resume
    const optimization = await resumeOptimizer.optimizeResume(
      resumeText, 
      targetRole, 
      jobDescription ? [jobDescription] : []
    );
    
    // Generate cover letter if company name provided
    let coverLetter = null;
    if (companyName && jobDescription) {
      try {
        coverLetter = await resumeOptimizer.generateCoverLetter(
          {
            skills: resumeText.match(/skills?[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1]?.split(/[,\n]/).map(s => s.trim()) || [],
            experience: resumeText.match(/experience[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1] || '',
            education: resumeText.match(/education[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1] || ''
          },
          jobDescription,
          companyName
        );
      } catch (coverLetterError) {
        console.warn('Cover letter generation failed:', coverLetterError);
      }
    }
    
    // Calculate ATS score if job description provided
    let atsAnalysis = null;
    if (jobDescription) {
      try {
        atsAnalysis = await resumeOptimizer.calculateATSScore(resumeText, jobDescription);
      } catch (atsError) {
        console.warn('ATS analysis failed:', atsError);
      }
    }
    
    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup processed file:', cleanupError);
    }
    
    res.json({
      success: true,
      file_info: {
        original_name: req.file.originalname,
        file_type: validation.fileType,
        file_size: req.file.size,
        text_length: resumeText.length
      },
      original_text: resumeText,
      optimization: optimization,
      cover_letter: coverLetter,
      ats_analysis: atsAnalysis
    });
    
  } catch (error) {
    console.error('File-based resume optimization failed:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to cleanup file after error:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'File-based resume optimization failed',
      details: error.message
    });
  }
});

// Get supported file formats for frontend
app.get('/optimizer/supported-formats', (req, res) => {
  res.json({
    success: true,
    supported_extensions: multiFormatParser.getSupportedExtensions(),
    supported_mime_types: multiFormatParser.getSupportedMimeTypes(),
    max_file_size: '50MB',
    formats: {
      pdf: 'PDF documents (.pdf)',
      word: 'Word documents (.doc, .docx)',
      image: 'Images (.jpg, .jpeg, .png, .gif, .bmp, .tiff)',
      text: 'Text files (.txt, .rtf)'
    }
  });
});

// ===================
// 🎯 HACKATHON FEATURES - CAREER INTELLIGENCE
// ===================

// Predict career trajectory
app.post('/predict-career-trajectory', async (req, res) => {
  try {
    const { resumeData, targetRole, timeframe = '5-years' } = req.body;
    
    if (!resumeData || !targetRole) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeData, targetRole' 
      });
    }
    
    const trajectory = await careerTrajectoryPredictor.predictCareerTrajectory(
      resumeData, 
      targetRole, 
      timeframe
    );
    
    res.json({
      success: true,
      ...trajectory
    });
    
  } catch (error) {
    console.error('Career trajectory prediction failed:', error);
    res.status(500).json({
      success: false,
      error: 'Career trajectory prediction failed',
      details: error.message
    });
  }
});

// Generate salary predictions
app.post('/predict-salary', async (req, res) => {
  try {
    const { role, location = 'Remote', experienceLevel = 'Mid' } = req.body;
    
    if (!role) {
      return res.status(400).json({ 
        error: 'Missing required field: role' 
      });
    }
    
    const salaryPrediction = await careerTrajectoryPredictor.generateSalaryPredictions(
      role, 
      location, 
      experienceLevel
    );
    
    res.json({
      success: true,
      ...salaryPrediction
    });
    
  } catch (error) {
    console.error('Salary prediction failed:', error);
    res.status(500).json({
      success: false,
      error: 'Salary prediction failed',
      details: error.message
    });
  }
});

// Get skill demand trends
app.post('/market/skill-trends', async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ 
        error: 'Missing required field: skills (array)' 
      });
    }
    
    const skillTrends = await marketIntelligenceService.getSkillDemandTrends(skills);
    
    res.json({
      success: true,
      ...skillTrends
    });
    
  } catch (error) {
    console.error('Skill trends analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Skill trends analysis failed',
      details: error.message
    });
  }
});

// Get company hiring trends
app.get('/market/company-trends', async (req, res) => {
  try {
    const { companies } = req.query;
    const companyList = companies ? companies.split(',') : [];
    
    const companyTrends = await marketIntelligenceService.getCompanyHiringTrends(companyList);
    
    res.json({
      success: true,
      ...companyTrends
    });
    
  } catch (error) {
    console.error('Company trends analysis failed:', error);
    res.status(500).json({
      success: false,
      error: 'Company trends analysis failed',
      details: error.message
    });
  }
});

// Generate comprehensive market report
app.post('/market/comprehensive-report', async (req, res) => {
  try {
    const { userProfile } = req.body;
    
    if (!userProfile) {
      return res.status(400).json({ 
        error: 'Missing required field: userProfile' 
      });
    }
    
    const marketReport = await marketIntelligenceService.generateMarketReport(userProfile);
    
    res.json({
      success: true,
      ...marketReport
    });
    
  } catch (error) {
    console.error('Market report generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Market report generation failed',
      details: error.message
    });
  }
});

// ===================
// AI MENTOR ENDPOINTS
// ===================

// Main mentor chat endpoint
app.post('/mentor', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      userId, 
      sessionId, 
      message, 
      resumeText, 
      jobDescription, 
      userProfile = {} 
    } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, message' 
      });
    }
    
    // Check if mentor service is available
    if (!mentorService) {
      return res.status(503).json({
        success: false,
        error: 'Mentor service unavailable',
        reply_text: "I'm currently unavailable. Please try again later or contact support.",
        bullets: ["Service is temporarily down", "Try again in a few minutes", "Contact support if the issue persists"],
        confidence: 0,
        sources: [],
        actions: [],
        badges: []
      });
    }
    
    // Process mentor request
    const response = await mentorService.processMentorRequest(
      userId,
      sessionId,
      message,
      {
        resumeText,
        jobDescription,
        userProfile
      }
    );
    
    // Track telemetry if available
    if (telemetryService) {
      telemetryService.trackMentorInteraction(
        userId,
        sessionId || 'unknown',
        response.intent,
        response.processingTime,
        response.confidence,
        true
      );
    }
    
    res.json({
      success: true,
      ...response
    });
    
  } catch (error) {
    console.error('Mentor request failed:', error);
    
    // Track error if telemetry is available
    if (telemetryService) {
      telemetryService.trackError('mentor_request_failed', error.message, {
        userId: req.body.userId,
        message: req.body.message?.substring(0, 100)
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Mentor request failed',
      reply_text: "I'm having trouble processing your request right now. Please try again.",
      bullets: ["Try rephrasing your question", "Check your internet connection", "Contact support if the issue persists"],
      confidence: 0,
      sources: [],
      actions: [],
      badges: []
    });
  }
});

// Simulation endpoint
app.post('/simulation', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { 
      userId, 
      language, 
      code, 
      testCases, 
      templateId 
    } = req.body;
    
    if (!userId || !language || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, language, code' 
      });
    }
    
    // Get test cases from template if not provided
    let finalTestCases = testCases;
    if (templateId && !testCases) {
      const templates = simulationService.getSimulationTemplates();
      const template = templates.find(t => t.id === templateId);
      if (template) {
        finalTestCases = template.testCases;
      }
    }
    
    if (!finalTestCases || finalTestCases.length === 0) {
      return res.status(400).json({ 
        error: 'No test cases provided' 
      });
    }
    
    // Run simulation
    const results = await simulationService.runSimulation({
      userId,
      language,
      code,
      testCases: finalTestCases
    });
    
    // Track telemetry
    telemetryService.trackSimulationCompletion(
      userId,
      results.sessionId,
      language,
      results.score,
      results.executionTime,
      results.success
    );
    
    res.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('Simulation failed:', error);
    
    // Track error
    telemetryService.trackError('simulation_failed', error.message, {
      userId: req.body.userId,
      language: req.body.language
    });
    
    res.status(500).json({
      success: false,
      error: 'Simulation failed',
      output: '',
      errors: error.message,
      testResults: [],
      score: 0,
      executionTime: Date.now() - startTime
    });
  }
});

// Get simulation templates
app.get('/simulation/templates', (req, res) => {
  try {
    const templates = simulationService.getSimulationTemplates();
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Failed to get simulation templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get simulation templates'
    });
  }
});

// Get user badges
app.get('/badges/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // This would typically query your database
    // For now, return mock data
    const badges = [
      {
        id: 'first_question',
        title: 'Curious Explorer',
        description: 'Asked your first question',
        earnedAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Failed to get user badges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user badges'
    });
  }
});

// Get telemetry metrics (admin endpoint)
app.get('/admin/metrics', (req, res) => {
  try {
    const metrics = telemetryService.getMetricsSummary();
    const performance = telemetryService.getPerformanceMetrics();
    
    res.json({
      success: true,
      metrics,
      performance
    });
  } catch (error) {
    console.error('Failed to get metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// Get user activity (admin endpoint)
app.get('/admin/activity/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const activity = telemetryService.getUserActivity(userId);
    
    res.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Failed to get user activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user activity'
    });
  }
});

// ===================
// CONVERSATION MANAGEMENT ENDPOINTS
// ===================

// Get recent conversations for a user
app.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    if (!mentorService) {
      return res.status(503).json({
        success: false,
        error: 'Mentor service unavailable'
      });
    }
    
    const conversations = await mentorService.getRecentConversations(userId, parseInt(limit));
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Failed to get conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations'
    });
  }
});

// Get specific conversation by session ID
app.get('/conversations/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!mentorService) {
      return res.status(503).json({
        success: false,
        error: 'Mentor service unavailable'
      });
    }
    
    const conversation = await mentorService.getConversationBySession(sessionId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Failed to get conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation'
    });
  }
});

// Get user interaction history
app.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    if (!mentorService) {
      return res.status(503).json({
        success: false,
        error: 'Mentor service unavailable'
      });
    }
    
    const history = await mentorService.getUserHistory(userId, parseInt(days));
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Failed to get user history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user history'
    });
  }
});

// Get user statistics
app.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mentorService) {
      return res.status(503).json({
        success: false,
        error: 'Mentor service unavailable'
      });
    }
    
    const stats = await mentorService.getUserStats(userId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Failed to get user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats'
    });
  }
});

// Get conversation analytics (admin endpoint)
app.get('/admin/conversations/analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Get popular intents
    const popularIntents = await UserInteraction.getPopularIntents(parseInt(days));
    
    // Get overall conversation stats
    const totalConversations = await MentorConversation.countDocuments();
    const totalInteractions = await UserInteraction.countDocuments();
    
    res.json({
      success: true,
      analytics: {
        popularIntents,
        totalConversations,
        totalInteractions,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Failed to get conversation analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation analytics'
    });
  }
});

// Simple test endpoint to verify job database
app.get('/test-job-database', (req, res) => {
  res.json({
    success: true,
    available_roles: Object.keys(JOB_DATABASE),
    software_engineer_jobs: JOB_DATABASE['software-engineer']?.length || 0,
    sample_job: JOB_DATABASE['software-engineer']?.[0] || null
  });
});

// Test PDF parsing endpoint
app.post('/test-pdf-parsing', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let resumeText;
    if (fileExtension === '.pdf') {
      const originalWarn = console.warn;
      try {
        console.warn = (...args) => {
          const msg = (args && args[0] && args[0].toString) ? args[0].toString() : '';
          if (msg.includes('TT: undefined function')) return;
          return originalWarn.apply(console, args);
        };
        const data = await (await import('pdf-parse')).default(await fs.readFile(filePath));
        resumeText = data.text.replace(/\s+\n/g, '\n').trim();
      } finally {
        console.warn = originalWarn;
      }
    } else {
      resumeText = await fs.readFile(filePath, 'utf8');
    }

    // Test role detection using Gemini for better accuracy
    let detectedRole;
    try {
      console.log('Using Gemini for role detection in test endpoint...');
      const roleDetectionPrompt = `Analyze this resume and determine the most appropriate job role. Return ONLY the role name from these options: software-engineer, data-analyst, product-manager, ux-designer.

Resume:
${resumeText}

Return only the role name, nothing else.`;

      const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
      const location = process.env.VERTEX_LOCATION || 'us-central1';
      const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
      const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
      const vertex = new VertexAI({ project, location, googleAuthOptions: { keyFile: credentialsPath } });
      const model = vertex.getGenerativeModel({ model: process.env.VERTEX_MODEL || 'gemini-2.5-flash' });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: roleDetectionPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
      });
      
      const geminiDetectedRole = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
      detectedRole = ['software-engineer', 'data-analyst', 'product-manager', 'ux-designer'].includes(geminiDetectedRole) 
        ? geminiDetectedRole 
        : await detectRoleFromResume(resumeText); // Fallback to keyword matching
      console.log(`Gemini detected role in test: ${detectedRole}`);
    } catch (error) {
      console.log('Gemini role detection failed in test, using keyword fallback:', error.message);
      detectedRole = await detectRoleFromResume(resumeText);
    }
    
    // Cleanup
    await fs.unlink(filePath).catch(()=>{});

    res.json({
      success: true,
      file_type: fileExtension,
      text_length: resumeText.length,
      first_500_chars: resumeText.substring(0, 500),
      detected_role: detectedRole,
      has_javascript: resumeText.toLowerCase().includes('javascript'),
      has_python: resumeText.toLowerCase().includes('python'),
      has_react: resumeText.toLowerCase().includes('react'),
      has_node: resumeText.toLowerCase().includes('node'),
      has_sql: resumeText.toLowerCase().includes('sql'),
      has_tableau: resumeText.toLowerCase().includes('tableau')
    });
  } catch (err) {
    console.error('PDF parsing test error:', err);
    res.status(500).json({ 
      error: 'PDF parsing test failed', 
      details: err.message 
    });
  }
});

// Auto-detect role endpoint
app.post('/auto-detect-role', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Extract text from uploaded file
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let resumeText;
    if (fileExtension === '.pdf') {
      const originalWarn = console.warn;
      try {
        console.warn = (...args) => {
          const msg = (args && args[0] && args[0].toString) ? args[0].toString() : '';
          if (msg.includes('TT: undefined function')) return;
          return originalWarn.apply(console, args);
        };
        const data = await (await import('pdf-parse')).default(await fs.readFile(filePath));
        resumeText = data.text.replace(/\s+\n/g, '\n').trim();
      } finally {
        console.warn = originalWarn;
      }
    } else {
      resumeText = await fs.readFile(filePath, 'utf8');
    }

    // Detect role from resume content
    const detectedRole = await detectRoleFromResume(resumeText);
    
    // Cleanup
    await fs.unlink(filePath).catch(()=>{});

    return res.json({
      detected_role: detectedRole,
      success: true
    });
  } catch (err) {
    console.error('Auto-detect role error:', err);
    return res.status(500).json({ 
      error: 'Auto-detection failed', 
      details: err.message 
    });
  }
});

app.post('/upload_resume', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', { 
      hasFile: !!req.file, 
      targetRole: req.body?.target_role,
      userId: req.headers['x-user-id'] || 'anonymous'
    });
    
    const userId = req.headers['x-user-id'] || 'anonymous';
    const { target_role } = req.body;
    console.log('Received target_role:', target_role);
    console.log('Available JD_TEMPLATES keys:', Object.keys(JD_TEMPLATES));
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!target_role || !JD_TEMPLATES[target_role]) {
      console.log('Validation failed - target_role:', target_role, 'exists in JD_TEMPLATES:', !!JD_TEMPLATES[target_role]);
      return res.status(400).json({ error: 'Invalid target_role' });
    }

    // Extract text
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let resumeText;
    if (fileExtension === '.pdf') {
      // Suppress noisy pdf parsing warnings like: "Warning: TT: undefined function: 32"
      const originalWarn = console.warn;
      try {
        console.warn = (...args) => {
          const msg = (args && args[0] && args[0].toString) ? args[0].toString() : '';
          if (msg.includes('TT: undefined function')) return; // ignore font warnings
          return originalWarn.apply(console, args);
        };
        const data = await (await import('pdf-parse')).default(await fs.readFile(filePath));
        resumeText = data.text.replace(/\s+\n/g, '\n').trim();
        console.log('PDF parsed successfully. Text length:', resumeText.length);
        console.log('First 500 characters of parsed text:', resumeText.substring(0, 500));
      } finally {
        console.warn = originalWarn;
      }
    } else {
      // Handle text files
      resumeText = await fs.readFile(filePath, 'utf8');
      console.log('Text file read successfully. Text length:', resumeText.length);
    }

    // Handle auto-detection using Gemini for better accuracy
    let finalTargetRole = target_role;
    if (target_role === 'auto-detect') {
      try {
        // Use Gemini for intelligent role detection
        console.log('Using Gemini for intelligent role detection...');
        const roleDetectionPrompt = `Analyze this resume and determine the most appropriate job role. Return ONLY the role name from these options: software-engineer, data-analyst, product-manager, ux-designer.

Resume:
${resumeText}

Return only the role name, nothing else.`;

        const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.VERTEX_LOCATION || 'us-central1';
        const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
        const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
        const vertex = new VertexAI({ project, location, googleAuthOptions: { keyFile: credentialsPath } });
        const model = vertex.getGenerativeModel({ model: process.env.VERTEX_MODEL || 'gemini-2.5-flash' });

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: roleDetectionPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
        });
        
        const detectedRole = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
        finalTargetRole = ['software-engineer', 'data-analyst', 'product-manager', 'ux-designer'].includes(detectedRole) 
          ? detectedRole 
          : await detectRoleFromResume(resumeText); // Fallback to keyword matching
        console.log(`Gemini auto-detected role: ${finalTargetRole}`);
      } catch (error) {
        console.log('Gemini role detection failed, using keyword fallback:', error.message);
        finalTargetRole = await detectRoleFromResume(resumeText);
        console.log(`Fallback auto-detected role: ${finalTargetRole}`);
      }
    }

    // Analyze via Enhanced RAG with external sources and chunking
    console.log(`Final target role for analysis: ${finalTargetRole}`);
    const jdText = JD_TEMPLATES[finalTargetRole];
    console.log(`JD Template available: ${!!jdText}`);
    let analysis;
    
    try {
      // Use Basic RAG with Gemini for skill extraction and analysis
      console.log('Using Basic RAG with Gemini for skill extraction and analysis...');
      const ragAnalysis = await ragAnalyzer.analyzeResumeWithRAG(resumeText, jdText, finalTargetRole);
      console.log('Basic RAG analysis completed successfully');
      
      // Add job matches to the RAG analysis result
      console.log('RAG Analysis result:', JSON.stringify(ragAnalysis, null, 2));
      const skillsForMatching = ragAnalysis.skills_present || [];
      console.log('Skills for job matching:', skillsForMatching);
      const jobMatches = findJobMatches(finalTargetRole, skillsForMatching);
      console.log('Job matches found:', jobMatches.length);
      analysis = {
        ...ragAnalysis,
        job_matches: jobMatches
      };
    } catch (error) {
      console.log('Basic RAG failed, falling back to intelligent skill extraction:', error.message);
      // Fallback to intelligent skill extraction if RAG fails
      analysis = await analyzeResumeIntelligently(resumeText, jdText, finalTargetRole);
    }

    // Persist
    let id, created_at;
    if (persistenceMode === 'mongo') {
      const doc = await Analysis.create({
        userId,
        target_role,
        match_score: analysis.match_score,
        skills_present: analysis.skills_present,
        skills_missing: analysis.skills_missing,
        recommendations: analysis.recommendations,
      });
      id = doc._id;
      created_at = doc.createdAt;
    } else {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      created_at = new Date();
      memoryStore.set(id, {
        _id: id,
        userId,
        target_role,
        match_score: analysis.match_score,
        skills_present: analysis.skills_present,
        skills_missing: analysis.skills_missing,
        recommendations: analysis.recommendations,
        created_at,
        updated_at: created_at,
      });
    }

    // Cleanup
    await fs.unlink(filePath).catch(()=>{});

    return res.json({
      id,
      target_role: finalTargetRole,
      detected_role: finalTargetRole,
      ...analysis,
      created_at,
    });
  } catch (err) {
    console.error('Upload error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      stack: err.stack 
    });
  }
});

// Enhanced file analysis endpoint with deeper insights
app.post('/analyze-file', upload.single('file'), async (req, res) => {
  try {
    console.log('Enhanced file analysis request received:', { 
      hasFile: !!req.file, 
      fileType: req.file?.mimetype,
      fileName: req.file?.originalname,
      userId: req.headers['x-user-id'] || 'anonymous'
    });
    
    const userId = req.headers['x-user-id'] || 'anonymous';
    const { analysisType = 'comprehensive' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const fileName = req.file.originalname;
    
    let fileContent = '';
    let fileType = 'unknown';
    
    // Enhanced file parsing based on type
    if (fileExtension === '.pdf') {
      try {
        const data = await (await import('pdf-parse')).default(await fs.readFile(filePath));
        fileContent = data.text.replace(/\s+\n/g, '\n').trim();
        fileType = 'pdf';
      } catch (error) {
        console.error('PDF parsing failed:', error);
        return res.status(400).json({ error: 'Failed to parse PDF file' });
      }
    } else if (['.docx', '.doc'].includes(fileExtension)) {
      // For Word documents, we'll read as text for now
      // In production, use mammoth.js for proper .docx parsing
      try {
        fileContent = await fs.readFile(filePath, 'utf8');
        fileType = 'docx';
      } catch (error) {
        console.error('Word document parsing failed:', error);
        return res.status(400).json({ error: 'Failed to parse Word document' });
      }
    } else if (['.pptx', '.ppt'].includes(fileExtension)) {
      // For PowerPoint, we'll read as text for now
      // In production, use officegen or similar for proper parsing
      try {
        fileContent = await fs.readFile(filePath, 'utf8');
        fileType = 'pptx';
      } catch (error) {
        console.error('PowerPoint parsing failed:', error);
        return res.status(400).json({ error: 'Failed to parse PowerPoint file' });
      }
    } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      // For images, we'll use base64 encoding
      // In production, use OCR services like Tesseract or cloud OCR
      try {
        const imageBuffer = await fs.readFile(filePath);
        fileContent = imageBuffer.toString('base64');
        fileType = 'image';
      } catch (error) {
        console.error('Image processing failed:', error);
        return res.status(400).json({ error: 'Failed to process image file' });
      }
    } else {
      // Text files
      try {
        fileContent = await fs.readFile(filePath, 'utf8');
        fileType = 'text';
      } catch (error) {
        console.error('Text file reading failed:', error);
        return res.status(400).json({ error: 'Failed to read text file' });
      }
    }

    // Initialize mentor service for file analysis
    const mentorService = new (await import('./services/mentor-service.js')).default();
    
    // Perform enhanced file analysis
    const fileAnalysis = await mentorService.analyzeFileContent(
      fileContent, 
      fileType, 
      fileName, 
      userId
    );

    // Cleanup
    await fs.unlink(filePath).catch(() => {});

    return res.json({
      success: true,
      fileName,
      fileType,
      analysisType,
      analysis: fileAnalysis,
      timestamp: new Date().toISOString(),
      userId
    });

  } catch (error) {
    console.error('Enhanced file analysis error:', error);
    return res.status(500).json({ 
      error: 'File analysis failed', 
      details: error.message 
    });
  }
});

// Get conversation history endpoint
app.get('/conversation-history/:userId', async (req, res) => {
  try {
    console.log('📚 Conversation history endpoint hit:', {
      userId: req.params.userId,
      persistenceMode,
      mongoState: mongoose.connection.readyState
    });
    
    const { userId } = req.params;
    const { limit = 10, sessionId } = req.query;
    
    let conversations = [];
    let usedMongoDB = false;
    
    // Try MongoDB first if connected
    if (persistenceMode === 'mongo' && mongoose.connection.readyState === 1) {
      try {
        console.log('📊 Trying MongoDB Atlas for conversation history');
        const mentorService = new (await import('./services/mentor-service.js')).default();
        
        if (sessionId) {
          // Get specific session
          console.log('🔍 Looking for specific session in MongoDB:', sessionId);
          const conversation = await mentorService.getConversationBySession(sessionId);
          conversations = conversation ? [conversation] : [];
        } else {
          // Get recent conversations for user
          console.log('📋 Getting recent conversations from MongoDB for user:', userId, 'limit:', limit);
          conversations = await mentorService.getRecentConversations(userId, parseInt(limit));
          
          // If no conversations found in MongoDB, try to migrate from file storage
          if (conversations.length === 0) {
            console.log('🔄 No conversations in MongoDB, attempting migration from file storage...');
            const migrationResult = await mentorService.migrateFileStorageToMongoDB(userId);
            console.log('Migration result:', migrationResult);
            
            // Try to get conversations again after migration
            if (migrationResult.migrated > 0) {
              conversations = await mentorService.getRecentConversations(userId, parseInt(limit));
              console.log('✅ After migration, found', conversations.length, 'conversations in MongoDB');
            }
          }
        }
        usedMongoDB = true;
        console.log('✅ MongoDB returned', conversations.length, 'conversations');
      } catch (mongoError) {
        console.warn('⚠️ MongoDB query failed, falling back to file storage:', mongoError.message);
        usedMongoDB = false;
      }
    }
    
    // If MongoDB didn't return results or failed, try file storage
    if (conversations.length === 0) {
      console.log('📁 Using file storage for conversation history');
      
      if (sessionId) {
        // Get specific session
        console.log('🔍 Looking for specific session in file storage:', sessionId);
        const conversation = await fileStorage.getConversation(sessionId);
        conversations = conversation ? [conversation] : [];
      } else {
        // Get recent conversations for user
        console.log('📋 Getting recent conversations from file storage for user:', userId, 'limit:', limit);
        conversations = await fileStorage.getRecentConversations(userId, parseInt(limit));
      }
    }
    
    console.log('✅ Found conversations:', conversations.length);
    console.log('💾 Used MongoDB:', usedMongoDB, 'Persistence mode:', persistenceMode);
    
    return res.json({
      success: true,
      persistenceMode,
      mongoConnected: persistenceMode === 'mongo',
      usedMongoDB,
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        startTime: conv.sessionMetadata?.startTime || conv.createdAt,
        endTime: conv.sessionMetadata?.endTime || conv.updatedAt,
        totalMessages: conv.sessionMetadata?.totalMessages || conv.messages?.length || 0,
        userProfile: conv.sessionMetadata?.userProfile || {},
        messages: conv.messages?.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          intent: msg.metadata?.intent,
          confidence: msg.metadata?.confidence,
          badges: msg.metadata?.badges || []
        })) || []
      }))
    });
    
  } catch (error) {
    console.error('❌ Get conversation history error:', error);
    return res.status(500).json({ 
      error: 'Failed to get conversation history', 
      details: error.message,
      persistenceMode
    });
  }
});

// Test endpoint to verify server is working
app.get('/test-conversation-history', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Conversation history endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Migration endpoint to move conversations from file storage to MongoDB
app.post('/migrate-conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (persistenceMode !== 'mongo' || mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB not available for migration'
      });
    }
    
    const mentorService = new (await import('./services/mentor-service.js')).default();
    const result = await mentorService.migrateFileStorageToMongoDB(userId);
    
    res.json({
      success: true,
      message: 'Migration completed',
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Migration endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      details: error.message
    });
  }
});

// MongoDB status endpoint
app.get('/mongo-status', (req, res) => {
  const actuallyConnected = persistenceMode === 'mongo' && mongoose.connection.readyState === 1;
  res.json({
    success: true,
    persistenceMode: actuallyConnected ? 'mongo' : 'file',
    mongoConnected: actuallyConnected,
    mongoState: mongoose.connection.readyState,
    mongoStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    },
    timestamp: new Date().toISOString()
  });
});

// Search conversations endpoint
app.get('/search-conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let searchResults = [];
    
    if (persistenceMode === 'mongo') {
      // Use MongoDB Atlas
      const mentorService = new (await import('./services/mentor-service.js')).default();
      const conversations = await mentorService.getRecentConversations(userId, 50);
      
      // Simple text search through conversations
      searchResults = conversations
        .map(conv => {
          const matchingMessages = conv.messages.filter(msg => 
            msg.content.toLowerCase().includes(query.toLowerCase())
          );
          
          if (matchingMessages.length > 0) {
            return {
              sessionId: conv.sessionId,
              startTime: conv.sessionMetadata.startTime,
              totalMessages: conv.sessionMetadata.totalMessages,
              matchingMessages: matchingMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp,
                intent: msg.metadata?.intent
              })),
              relevanceScore: matchingMessages.length
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, parseInt(limit));
    } else {
      // Use file storage
      searchResults = await fileStorage.searchConversations(userId, query, parseInt(limit));
    }
    
    return res.json({
      success: true,
      query,
      results: searchResults,
      totalFound: searchResults.length,
      persistenceMode
    });
    
  } catch (error) {
    console.error('Search conversations error:', error);
    return res.status(500).json({ 
      error: 'Failed to search conversations', 
      details: error.message,
      persistenceMode
    });
  }
});

app.get('/analysis/:id', async (req, res) => {
  try {
    if (persistenceMode === 'mongo') {
      const doc = await Analysis.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Not found' });
      return res.json(doc);
    }
    const doc = memoryStore.get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    return res.json(doc);
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PRD-style analysis endpoint using embeddings + vector search + Gemini
app.post('/analyze-prd', async (req, res) => {
  try {
    const { resumeText, role } = req.body || {};
    if (!resumeText || !role) {
      return res.status(400).json({ error: 'Missing required fields: resumeText, role' });
    }

    // Load curated role skills
    const rolesPath = path.resolve(__dirname, '../data/job_roles.json');
    if (!fsSync.existsSync(rolesPath)) {
      return res.status(500).json({ error: 'Server missing job roles data' });
    }
    const rolesJson = JSON.parse(fsSync.readFileSync(rolesPath, 'utf8'));
    const roleSkills = rolesJson[role]?.skills || [];

    // Build vector store from role skills
    const store = new VectorStore();
    for (const skill of roleSkills) {
      const v = await getEmbedding(skill);
      await store.add(skill, v);
    }
    await store.build();

    // Query with resume embedding
    const qVec = await getEmbedding(resumeText.slice(0, 2000));
    const top = await store.topK(qVec, 12);

    // Build prompt
    const passagesStr = top.map((t, i) => `[${i + 1}] ${t.item}`).join('\n');
    const prompt = `Resume:\n${resumeText}\n\nRetrieved Job Market Passages:\n${passagesStr}\n\nTask:\nFor the role ${role}:\n- List matched skills (found in resume).\n- List missing required skills.\n- Provide 2-3 concise recommendations.\nOutput ONLY JSON with shape:\n{\n  "role": "${role}",\n  "present_skills": [],\n  "missing_skills": [],\n  "recommendations": []\n}`;

    // Call Gemini
    const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
    const vertex = new VertexAI({ project, location, googleAuthOptions: { keyFile: credentialsPath } });
    const model = vertex.getGenerativeModel({ model: process.env.VERTEX_MODEL || 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512, responseMimeType: 'application/json' }
    });
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const safeParse = (t) => {
      try {
        // First try to parse as-is
        return JSON.parse(t);
      } catch (e) {
        console.error('JSON parse error:', e);
        // Try to extract JSON from the text
        const first = t.indexOf('{'); 
        const last = t.lastIndexOf('}');
        if (first === -1 || last === -1 || last <= first) return null;
        try { 
          return JSON.parse(t.slice(first, last + 1)); 
        } catch (extractError) {
          console.error('Failed to extract JSON:', extractError);
          return null;
        }
      }
    };
    const parsed = safeParse(text) || { role, present_skills: [], missing_skills: [], recommendations: [] };
    return res.json(parsed);
  } catch (e) {
    console.error('analyze-prd error:', e);
    return res.status(500).json({ error: 'PRD analysis failed', details: e.message });
  }
});

// Test Enhanced RAG functionality endpoint
app.post('/test-enhanced-rag', async (req, res) => {
  try {
    const { resumeText, jobDescription, role } = req.body;
    
    if (!resumeText || !jobDescription || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeText, jobDescription, role' 
      });
    }

    console.log('Testing Enhanced RAG with external sources...');
    const analysis = await enhancedRAGAnalyzer.analyzeResumeWithEnhancedRAG(resumeText, jobDescription, role);
    
    return res.json({
      success: true,
      analysis,
      model_used: analysis.model_used,
      rag_enhanced: analysis.rag_enhanced,
      external_sources_used: analysis.external_sources_used,
      chunk_analyses: analysis.chunk_analyses
    });
    
  } catch (error) {
    console.error('Enhanced RAG test error:', error);
    return res.status(500).json({ 
      error: 'Enhanced RAG analysis failed', 
      details: error.message 
    });
  }
});

// Test basic RAG functionality endpoint
app.post('/test-rag', async (req, res) => {
  try {
    const { resumeText, jobDescription, role } = req.body;
    
    if (!resumeText || !jobDescription || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields: resumeText, jobDescription, role' 
      });
    }

    const analysis = await ragAnalyzer.analyzeResumeWithRAG(resumeText, jobDescription, role);
    
    return res.json({
      success: true,
      analysis,
      model_used: analysis.model_used,
      rag_enhanced: analysis.rag_enhanced
    });
    
  } catch (error) {
    console.error('RAG test error:', error);
    return res.status(500).json({ 
      error: 'RAG analysis failed', 
      details: error.message 
    });
  }
});

// Generate Learning Roadmap endpoint using Gemini + RAG
app.post('/generate-learning-roadmap', async (req, res) => {
  try {
    const { analysisId, role, skillsPresent, skillsMissing, recommendations } = req.body;
    
    if (!role || !skillsPresent || !skillsMissing) {
      return res.status(400).json({ 
        error: 'Missing required fields: role, skillsPresent, skillsMissing' 
      });
    }

    console.log('Generating learning roadmap with Gemini + RAG...');
    
    // Build comprehensive prompt for learning roadmap
    const roadmapPrompt = `You are an expert career advisor. Generate a comprehensive learning roadmap for a ${role} role.

CURRENT SKILLS: ${skillsPresent.join(', ')}
MISSING SKILLS: ${skillsMissing.join(', ')}
RECOMMENDATIONS: ${(recommendations || []).join('; ')}

Create a structured learning roadmap with skill gaps organized in 3 stages:
1. Stage 1: Critical gaps (immediate priorities - 1-2 months)
2. Stage 2: Important gaps (short-term goals - 3-6 months) 
3. Stage 3: Nice-to-have gaps (long-term objectives - 6-12 months)

For each skill gap, include:
- YouTube video recommendations with specific topics
- Exam/certification preparation resources
- Practical projects to build
- Learning platforms and courses

CRITICAL: Return ONLY valid JSON. No text before or after. All strings must be properly quoted. All brackets must be closed.

Return ONLY valid JSON with this structure:
{
  "roadmap": {
    "stage_1_critical_gaps": [
      {
        "skill": "skill name",
        "gap_level": "critical",
        "timeline": "1-2 months",
        "priority": "high",
        "youtube_videos": [
          {
            "title": "video title",
            "topic": "specific topic",
            "search_query": "youtube search query"
          }
        ],
        "exam_preparation": {
          "certifications": ["cert1", "cert2"],
          "practice_tests": ["test1", "test2"],
          "study_materials": ["material1", "material2"]
        },
        "projects": [
          {
            "name": "project name",
            "description": "project description",
            "skills_developed": ["skill1", "skill2"],
            "timeline": "timeline"
          }
        ],
        "learning_platforms": ["platform1", "platform2"]
      }
    ],
    "stage_2_important_gaps": [
      {
        "skill": "skill name",
        "gap_level": "important",
        "timeline": "3-6 months",
        "priority": "medium",
        "youtube_videos": [
          {
            "title": "video title",
            "topic": "specific topic",
            "search_query": "youtube search query"
          }
        ],
        "exam_preparation": {
          "certifications": ["cert1"],
          "practice_tests": ["test1"],
          "study_materials": ["material1"]
        },
        "projects": [
          {
            "name": "project name",
            "description": "project description",
            "skills_developed": ["skill1"],
            "timeline": "timeline"
          }
        ],
        "learning_platforms": ["platform1"]
      }
    ],
    "stage_3_nice_to_have": [
      {
        "skill": "skill name",
        "gap_level": "nice_to_have",
        "timeline": "6-12 months",
        "priority": "low",
        "youtube_videos": [
          {
            "title": "video title",
            "topic": "specific topic",
            "search_query": "youtube search query"
          }
        ],
        "exam_preparation": {
          "certifications": ["cert1"],
          "practice_tests": ["test1"],
          "study_materials": ["material1"]
        },
        "projects": [
          {
            "name": "project name",
            "description": "project description",
            "skills_developed": ["skill1"],
            "timeline": "timeline"
          }
        ],
        "learning_platforms": ["platform1"]
      }
    ],
    "learning_resources": {
      "courses": ["course1", "course2"],
      "platforms": ["platform1", "platform2"],
      "books": ["book1", "book2"],
      "communities": ["community1", "community2"]
    }
  },
  "estimated_timeline": "overall timeline",
  "success_metrics": ["metric1", "metric2"]
}`;

    // Call Gemini for roadmap generation
    const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
    const vertex = new VertexAI({ project, location, googleAuthOptions: { keyFile: credentialsPath } });
    const model = vertex.getGenerativeModel({ model: process.env.VERTEX_MODEL || 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: roadmapPrompt }] }],
      generationConfig: {
        temperature: 0.1,  // Lower temperature for more consistent JSON
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
        topP: 0.8,
        topK: 40
      }
    });
    
    const roadmapText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Raw Gemini response (first 1000 chars):', roadmapText.substring(0, 1000));
    
    // Parse JSON response with robust error handling
    const safeParse = (text) => {
      try {
        // First try to parse as-is
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.log('Problematic JSON text (first 500 chars):', text.substring(0, 500));
        
        try {
          // Try to extract and clean JSON from the text
          let cleanedText = text.trim();
          
          // Find the first complete JSON object
          const firstBrace = cleanedText.indexOf('{');
          if (firstBrace === -1) return null;
          
          // Find the matching closing brace
          let braceCount = 0;
          let lastBrace = -1;
          for (let i = firstBrace; i < cleanedText.length; i++) {
            if (cleanedText[i] === '{') braceCount++;
            if (cleanedText[i] === '}') braceCount--;
            if (braceCount === 0) {
              lastBrace = i;
              break;
            }
          }
          
          if (lastBrace === -1) return null;
          
          cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
          
          // Try to fix common JSON issues
          cleanedText = cleanedText
            .replace(/,\s*}/g, '}')  // Remove trailing commas before }
            .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Add quotes around unquoted keys
            .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, ': "$1"$2')  // Add quotes around unquoted string values
            .replace(/: "(\d+\.?\d*)"(\s*[,}])/g, ': $1$2')  // Remove quotes from numbers
            .replace(/: "(true|false|null)"(\s*[,}])/g, ': $1$2')  // Remove quotes from booleans and null
            .replace(/\n/g, ' ')  // Replace newlines with spaces
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .trim();
          
          console.log('Cleaned JSON text (first 500 chars):', cleanedText.substring(0, 500));
          
          return JSON.parse(cleanedText);
        } catch (cleanError) {
          console.error('Failed to clean and parse JSON:', cleanError);
          return null;
        }
      }
    };
    
    let roadmapData = safeParse(roadmapText);
    
    // Validate the parsed data structure
    const validateRoadmapData = (data) => {
      if (!data || !data.roadmap) return false;
      
      const stages = ['stage_1_critical_gaps', 'stage_2_important_gaps', 'stage_3_nice_to_have'];
      for (const stage of stages) {
        if (!Array.isArray(data.roadmap[stage])) {
          console.log(`Invalid stage structure for ${stage}`);
          return false;
        }
      }
      
      return true;
    };
    
    if (!validateRoadmapData(roadmapData)) {
      console.log('Roadmap data validation failed, using fallback...');
      roadmapData = null;
    }
    
    // If parsing failed or stages are empty, create fallback data
    if (!roadmapData || !roadmapData.roadmap || 
        (!roadmapData.roadmap.stage_1_critical_gaps?.length && 
         !roadmapData.roadmap.stage_2_important_gaps?.length && 
         !roadmapData.roadmap.stage_3_nice_to_have?.length)) {
      
      console.log('Creating fallback roadmap data from skills gaps...');
      
      // Distribute missing skills across stages
      const criticalSkills = skillsMissing.slice(0, Math.ceil(skillsMissing.length / 3));
      const importantSkills = skillsMissing.slice(Math.ceil(skillsMissing.length / 3), Math.ceil(skillsMissing.length * 2 / 3));
      const niceToHaveSkills = skillsMissing.slice(Math.ceil(skillsMissing.length * 2 / 3));
      
      const createSkillData = (skill, priority, timeline) => ({
        skill: skill,
        gap_level: priority === 'high' ? 'critical' : priority === 'medium' ? 'important' : 'nice_to_have',
        timeline: timeline,
        priority: priority,
        youtube_videos: [
          {
            title: `${skill} Tutorial for Beginners`,
            topic: `Learn ${skill} fundamentals and best practices`,
            search_query: `${skill} tutorial beginner`
          },
          {
            title: `${skill} Advanced Concepts`,
            topic: `Master advanced ${skill} techniques`,
            search_query: `${skill} advanced tutorial`
          }
        ],
        exam_preparation: {
          certifications: [`${skill} Certification`, `${skill} Professional Certificate`],
          practice_tests: [`${skill} Practice Test 1`, `${skill} Practice Test 2`],
          study_materials: [`${skill} Study Guide`, `${skill} Reference Manual`]
        },
        projects: [
          {
            name: `${skill} Practice Project`,
            description: `Build a project using ${skill} to apply your learning`,
            skills_developed: [skill, 'Problem Solving', 'Project Management'],
            timeline: '2-4 weeks'
          }
        ],
        learning_platforms: ['YouTube', 'Coursera', 'Udemy', 'FreeCodeCamp']
      });
      
      roadmapData = {
        roadmap: {
          stage_1_critical_gaps: criticalSkills.map(skill => createSkillData(skill, 'high', '1-2 months')),
          stage_2_important_gaps: importantSkills.map(skill => createSkillData(skill, 'medium', '3-6 months')),
          stage_3_nice_to_have: niceToHaveSkills.map(skill => createSkillData(skill, 'low', '6-12 months')),
          learning_resources: {
            courses: ['Online Courses', 'Bootcamps', 'University Programs'],
            platforms: ['YouTube', 'Coursera', 'Udemy', 'FreeCodeCamp', 'Khan Academy'],
            books: ['Technical Books', 'Reference Guides', 'Practice Workbooks'],
            communities: ['Stack Overflow', 'Reddit', 'Discord', 'LinkedIn Groups']
          }
        },
        estimated_timeline: "6-12 months",
        success_metrics: ["Complete 3 projects", "Earn 1 certification", "Apply for 5 jobs"]
      };
    }

    // Store roadmap in MongoDB
    let roadmapId;
    if (persistenceMode === 'mongo') {
      try {
        const roadmapDoc = await Roadmap.create({
          userId: req.headers['x-user-id'] || 'anonymous',
          analysisId: analysisId,
          role: role,
          roadmap: roadmapData.roadmap,
          estimated_timeline: roadmapData.estimated_timeline,
          success_metrics: roadmapData.success_metrics,
          model_used: 'gemini-2.5-flash',
          generated_at: new Date()
        });
        roadmapId = roadmapDoc._id;
        console.log('Roadmap stored in MongoDB with ID:', roadmapId);
      } catch (error) {
        console.error('Failed to store roadmap in MongoDB:', error);
        // Continue without storing if MongoDB fails
      }
    }

    // Enhance roadmap with actual YouTube video links
    try {
      console.log('Enhancing roadmap with YouTube video links...');
      console.log('Roadmap data before enhancement (first 1000 chars):', JSON.stringify(roadmapData, null, 2).substring(0, 1000));
      
      // Check if we have any skills to enhance
      const hasSkills = roadmapData.roadmap && (
        (roadmapData.roadmap.stage_1_critical_gaps && roadmapData.roadmap.stage_1_critical_gaps.length > 0) ||
        (roadmapData.roadmap.stage_2_important_gaps && roadmapData.roadmap.stage_2_important_gaps.length > 0) ||
        (roadmapData.roadmap.stage_3_nice_to_have && roadmapData.roadmap.stage_3_nice_to_have.length > 0)
      );
      
      if (hasSkills) {
        roadmapData = await youtubeService.generateRoadmapVideoLinks(roadmapData);
        console.log('YouTube video links added successfully');
        console.log('Roadmap data after enhancement (first 1000 chars):', JSON.stringify(roadmapData, null, 2).substring(0, 1000));
      } else {
        console.log('No skills found in roadmap, skipping YouTube enhancement');
      }
    } catch (error) {
      console.error('Failed to enhance roadmap with YouTube links:', error);
      // Continue with original roadmap data
    }

    return res.json({
      success: true,
      roadmap_id: roadmapId,
      analysis_id: analysisId,
      role: role,
      roadmap: roadmapData,
      model_used: 'gemini-2.5-flash',
      generated_at: new Date().toISOString(),
      stored_in_mongodb: persistenceMode === 'mongo' && !!roadmapId
    });
    
  } catch (error) {
    console.error('Learning roadmap generation error:', error);
    return res.status(500).json({ 
      error: 'Learning roadmap generation failed', 
      details: error.message 
    });
  }
});

// Start Career Simulation endpoint using Gemini + RAG
app.post('/start-career-simulation', async (req, res) => {
  try {
    const { analysisId, role, skillsPresent, skillsMissing, jobMatches } = req.body;
    
    if (!role || !skillsPresent) {
      return res.status(400).json({ 
        error: 'Missing required fields: role, skillsPresent' 
      });
    }

    console.log('Starting career simulation with Gemini + RAG...');
    
    // Build comprehensive prompt for career simulation
    const simulationPrompt = `Create an interactive career simulation for a ${role} role based on the following profile:

CURRENT SKILLS: ${skillsPresent.join(', ')}
MISSING SKILLS: ${skillsMissing.join(', ')}
JOB MATCHES: ${JSON.stringify(jobMatches || [])}

Generate a realistic career simulation with:
1. Multiple career scenarios and paths
2. Interview simulations with real questions
3. Skill assessment challenges
4. Project-based learning scenarios
5. Networking and mentorship opportunities
6. Salary negotiation simulations

Return ONLY valid JSON with this structure:
{
  "simulation": {
    "scenarios": [
      {
        "id": "scenario1",
        "title": "scenario title",
        "description": "scenario description",
        "difficulty": "beginner/intermediate/advanced",
        "duration": "30-60 minutes",
        "skills_tested": ["skill1", "skill2"],
        "outcomes": ["outcome1", "outcome2"]
      }
    ],
    "interview_simulations": [
      {
        "company": "company name",
        "role": "role title",
        "questions": [
          {
            "question": "interview question",
            "type": "technical/behavioral/situational",
            "expected_answer": "expected answer",
            "tips": ["tip1", "tip2"]
          }
        ],
        "difficulty": "easy/medium/hard"
      }
    ],
    "skill_challenges": [
      {
        "skill": "skill name",
        "challenge_type": "coding/design/analysis",
        "description": "challenge description",
        "time_limit": "time limit",
        "evaluation_criteria": ["criteria1", "criteria2"]
      }
    ],
    "projects": [
      {
        "name": "project name",
        "description": "project description",
        "technologies": ["tech1", "tech2"],
        "timeline": "timeline",
        "deliverables": ["deliverable1", "deliverable2"]
      }
    ],
    "networking_opportunities": [
      {
        "event": "event name",
        "type": "conference/meetup/workshop",
        "description": "event description",
        "networking_tips": ["tip1", "tip2"]
      }
    ],
    "salary_negotiation": {
      "scenarios": [
        {
          "situation": "negotiation situation",
          "current_salary": "current salary range",
          "target_salary": "target salary range",
          "negotiation_tips": ["tip1", "tip2"]
        }
      ]
    }
  },
  "estimated_duration": "2-4 hours",
  "learning_objectives": ["objective1", "objective2"]
}`;

    // Call Gemini for simulation generation
    const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
    const vertex = new VertexAI({ project, location, googleAuthOptions: { keyFile: credentialsPath } });
    const model = vertex.getGenerativeModel({ model: process.env.VERTEX_MODEL || 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: simulationPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    });
    
    const simulationText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON response robustly by scanning for balanced structures
    const safeParse = (text) => {
      if (!text || typeof text !== 'string') {
        console.error('Invalid text input for JSON parsing');
        return null;
      }

      // Remove code fences and trim noise
      let cleaned = text.replace(/```(?:json)?/gi, '').trim();

      // Fast path
      try { return JSON.parse(cleaned); } catch (e) {
        console.error('JSON parse error:', e.message);
      }

      // Scanner that respects quotes and escapes for both objects and arrays
      const tryScan = (openChar, closeChar) => {
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
          if (ch === openChar) { if (depth === 0) start = i; depth++; continue; }
          if (ch === closeChar) {
            if (depth > 0) depth--;
            if (depth === 0 && start !== -1) {
              const candidate = cleaned.slice(start, i + 1);
              try { return JSON.parse(candidate); } catch (_) { /* keep scanning */ }
            }
          }
        }
        return null;
      };

      // Try scanning for object first, then array
      const obj = tryScan('{', '}');
      if (obj) return obj;
      const arr = tryScan('[', ']');
      if (arr) return arr;

      // As a last attempt, remove trailing commas and retry
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
      try { return JSON.parse(cleaned); } catch (_) { return null; }
    };
    
    const simulationData = safeParse(simulationText) || {
      simulation: {
        scenarios: [],
        interview_simulations: [],
        skill_challenges: [],
        projects: [],
        networking_opportunities: [],
        salary_negotiation: { scenarios: [] }
      },
      estimated_duration: "2-4 hours",
      learning_objectives: ["Improve technical skills", "Practice interviews", "Build portfolio"]
    };

    // Store simulation in MongoDB
    let simulationId;
    if (persistenceMode === 'mongo') {
      try {
        const simulationDoc = await Simulation.create({
          userId: req.headers['x-user-id'] || 'anonymous',
          analysisId: analysisId,
          role: role,
          simulation: simulationData.simulation,
          estimated_duration: simulationData.estimated_duration,
          learning_objectives: simulationData.learning_objectives,
          model_used: 'gemini-2.5-flash',
          started_at: new Date(),
          status: 'active',
          progress: {
            completed_scenarios: [],
            completed_interviews: [],
            completed_challenges: [],
            completed_projects: [],
            overall_progress: 0
          }
        });
        simulationId = simulationDoc._id;
        console.log('Simulation stored in MongoDB with ID:', simulationId);
      } catch (error) {
        console.error('Failed to store simulation in MongoDB:', error);
        // Continue without storing if MongoDB fails
      }
    }

    return res.json({
      success: true,
      simulation_id: simulationId,
      analysis_id: analysisId,
      role: role,
      simulation: simulationData,
      model_used: 'gemini-2.5-flash',
      started_at: new Date().toISOString(),
      stored_in_mongodb: persistenceMode === 'mongo' && !!simulationId
    });
    
  } catch (error) {
    console.error('Career simulation generation error:', error);
    return res.status(500).json({ 
      error: 'Career simulation generation failed', 
      details: error.message 
    });
  }
});

// Generate simulations based on resume analysis
app.post('/generate-simulations', async (req, res) => {
  try {
    const { userId, resumeAnalysis, role, skillsPresent, skillsMissing } = req.body;
    
    if (!userId || !resumeAnalysis) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, resumeAnalysis' 
      });
    }

    console.log('Generating simulations based on resume analysis...');
    
    // Extract skills and role information from resume analysis
    const detectedRole = role || resumeAnalysis.role || 'Data Analyst';
    const presentSkills = skillsPresent || resumeAnalysis.skillsPresent || [];
    const missingSkills = skillsMissing || resumeAnalysis.skillsMissing || [];
    const skillsGap = resumeAnalysis.skillsGap || [];
    
    // Build comprehensive prompt for simulation generation
    const simulationPrompt = `Generate personalized career simulations for a ${detectedRole} role based on this resume analysis:

CURRENT SKILLS: ${presentSkills.join(', ')}
MISSING SKILLS: ${missingSkills.join(', ')}
SKILLS GAP ANALYSIS: ${JSON.stringify(skillsGap)}
DETECTED ROLE: ${detectedRole}

Create realistic simulations that match the existing structure with these exact fields:
1. Multiple simulation modes (guided, challenge, project, peer)
2. Skills-based challenges matching the user's skill gaps
3. Progressive difficulty levels
4. Real-world scenarios relevant to the ${detectedRole} role

Return ONLY valid JSON with this exact structure:
{
  "simulations": [
    {
      "id": "simulation_id",
      "title": "simulation title",
      "type": "Data Analysis|Visualization|Analytics|Machine Learning",
      "difficulty": "Beginner|Intermediate|Advanced",
      "description": "detailed description",
      "skills": ["skill1", "skill2", "skill3"],
      "category": "Data Analysis|Visualization|Analytics|Machine Learning",
      "completedModes": [],
      "overallProgress": 0,
      "modes": [
        {
          "id": "guided",
          "name": "Guided Mode",
          "description": "Step-by-step walkthrough with hints and explanations",
          "xpReward": 100,
          "estimatedTime": "30-60 min",
          "difficulty": "Easy|Medium|Hard",
          "unlocked": true,
          "completed": false,
          "badge": "badge name"
        },
        {
          "id": "challenge",
          "name": "Challenge Mode", 
          "description": "Timed task with no hints",
          "xpReward": 300,
          "estimatedTime": "20-45 min",
          "difficulty": "Easy|Medium|Hard",
          "unlocked": true,
          "completed": false,
          "badge": "badge name"
        },
        {
          "id": "project",
          "name": "Project Mode",
          "description": "Open-ended problem solving",
          "xpReward": 500,
          "estimatedTime": "1-3 hours",
          "difficulty": "Easy|Medium|Hard",
          "unlocked": false,
          "completed": false,
          "badge": "badge name"
        },
        {
          "id": "peer",
          "name": "Peer Compare",
          "description": "Compare with peer averages",
          "xpReward": 150,
          "estimatedTime": "15-30 min",
          "difficulty": "Easy|Medium|Hard",
          "unlocked": false,
          "completed": false,
          "badge": "badge name"
        }
      ]
    }
  ]
}`;

    // Call Gemini for simulation generation
    const project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../', envCred);
    
    const vertex = new VertexAI({ 
      project, 
      location, 
      googleAuthOptions: { keyFile: credentialsPath } 
    });
    
    const model = vertex.getGenerativeModel({ 
      model: process.env.VERTEX_MODEL || 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: simulationPrompt }] }]
    });
    
    const simulationText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    console.log('Generated simulations:', simulationText);

    const safeParse = (text) => {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.log('Problematic JSON text:', text.substring(0, 200) + '...');
        
        try {
          const first = text.indexOf('{');
          const last = text.lastIndexOf('}');
          if (first !== -1 && last !== -1 && last > first) {
            const jsonPart = text.slice(first, last + 1);
            return JSON.parse(jsonPart);
          }
        } catch (extractError) {
          console.error('Failed to extract JSON:', extractError);
        }
        
        return null;
      }
    };
    
    let simulationData = safeParse(simulationText);
    
    // If parsing failed, create fallback simulations based on skills gap
    if (!simulationData || !simulationData.simulations) {
      console.log('Creating structured simulations based on skills gap...');
      
      // Create comprehensive simulations based on skill gaps
      const createSimulation = (skill, index) => {
        const skillName = skill.skill;
        const gapLevel = skill.gap;
        
        // Determine simulation type and category based on skill
        let simulationType, category, description, skills;
        
        if (skillName.toLowerCase().includes('python') || skillName.toLowerCase().includes('programming')) {
          simulationType = 'Data Analysis';
          category = 'Data Analysis';
          description = `Master ${skillName} programming through hands-on data analysis challenges and real-world projects. Build your coding skills with practical exercises.`;
          skills = [skillName, 'Programming', 'Data Analysis', 'Problem Solving', 'Algorithms', 'Data Structures'];
        } else if (skillName.toLowerCase().includes('sql') || skillName.toLowerCase().includes('database')) {
          simulationType = 'Analytics';
          category = 'Analytics';
          description = `Develop advanced ${skillName} skills through complex query challenges and database optimization scenarios. Perfect your data retrieval and analysis techniques.`;
          skills = [skillName, 'Database Management', 'Query Optimization', 'Data Analysis', 'Business Intelligence'];
        } else if (skillName.toLowerCase().includes('tableau') || skillName.toLowerCase().includes('visualization')) {
          simulationType = 'Visualization';
          category = 'Visualization';
          description = `Create stunning data visualizations and interactive dashboards using ${skillName}. Learn to tell compelling data stories.`;
          skills = [skillName, 'Data Visualization', 'Dashboard Design', 'Business Intelligence', 'Storytelling'];
        } else if (skillName.toLowerCase().includes('machine learning') || skillName.toLowerCase().includes('ml') || skillName.toLowerCase().includes('ai')) {
          simulationType = 'Machine Learning';
          category = 'Machine Learning';
          description = `Build and deploy machine learning models using ${skillName}. Work with real datasets and solve complex prediction problems.`;
          skills = [skillName, 'Machine Learning', 'Statistics', 'Data Science', 'Model Building', 'Python'];
        } else {
          simulationType = 'Data Analysis';
          category = 'Data Analysis';
          description = `Master ${skillName} through comprehensive hands-on challenges and real-world scenarios. Build practical skills for your career.`;
          skills = [skillName, 'Problem Solving', 'Data Analysis', 'Critical Thinking'];
        }
        
        // Determine difficulty based on gap level
        const difficulty = gapLevel > 40 ? 'Advanced' : gapLevel > 20 ? 'Intermediate' : 'Beginner';
        
        return {
          id: `simulation_${index + 1}`,
          title: `${skillName} Mastery Challenge`,
          type: simulationType,
          difficulty: difficulty,
          description: description,
          skills: skills,
          category: category,
          completedModes: [],
          overallProgress: 0,
          modes: [
            {
              id: 'guided',
              name: 'Guided Mode',
              description: `Step-by-step walkthrough with hints and explanations. Perfect for learning ${skillName} fundamentals.`,
              xpReward: 100,
              estimatedTime: '45 min',
              difficulty: 'Easy',
              unlocked: true,
              completed: false,
              badge: 'Strategist'
            },
            {
              id: 'challenge',
              name: 'Challenge Mode',
              description: `Timed task with no hints. Test your ${skillName} skills under pressure and compete for the best score.`,
              xpReward: 300,
              estimatedTime: '30 min',
              difficulty: 'Hard',
              unlocked: true,
              completed: false,
              badge: 'Speedster'
            },
            {
              id: 'project',
              name: 'Project Mode',
              description: `Open-ended problem solving. Submit your complete ${skillName} solution for AI mentor evaluation.`,
              xpReward: 500,
              estimatedTime: '2 hours',
              difficulty: 'Hard',
              unlocked: false,
              completed: false,
              badge: 'Architect'
            },
            {
              id: 'peer',
              name: 'Peer Compare',
              description: `Compare your ${skillName} performance with anonymized averages and learn from the community.`,
              xpReward: 150,
              estimatedTime: '20 min',
              difficulty: 'Medium',
              unlocked: false,
              completed: false,
              badge: 'Collaborator'
            }
          ]
        };
      };
      
      simulationData = {
        simulations: skillsGap.slice(0, 4).map((skill, index) => createSimulation(skill, index))
      };
    }

    // Enhance simulations with YouTube video links
    try {
      console.log('Enhancing simulations with YouTube video links...');
      for (const simulation of simulationData.simulations) {
        if (simulation.skills && simulation.skills.length > 0) {
          // Create YouTube videos for the main skill
          const mainSkill = simulation.skills[0];
          simulation.youtube_videos = [
            {
              title: `${mainSkill} Tutorial for Beginners`,
              topic: `Learn ${mainSkill} fundamentals and best practices`,
              search_query: `${mainSkill} tutorial beginner`
            },
            {
              title: `${mainSkill} Advanced Concepts`,
              topic: `Master advanced ${mainSkill} techniques`,
              search_query: `${mainSkill} advanced tutorial`
            }
          ];
        }
      }
      
      // Use YouTube service to enhance video links
      for (const simulation of simulationData.simulations) {
        if (simulation.youtube_videos) {
          for (const video of simulation.youtube_videos) {
            if (video.search_query) {
              try {
                const searchResults = await youtubeService.searchVideosWithDetails(video.search_query, 1);
                if (searchResults.length > 0) {
                  const bestMatch = searchResults[0];
                  video.url = bestMatch.url;
                  video.videoId = bestMatch.videoId;
                  video.thumbnail = bestMatch.thumbnail;
                  video.duration = bestMatch.duration;
                  video.viewCount = bestMatch.viewCount;
                  video.channelTitle = bestMatch.channelTitle;
                  video.publishedAt = bestMatch.publishedAt;
                  console.log(`Enhanced simulation video: ${video.title} -> ${video.url}`);
                }
              } catch (error) {
                console.error(`Error enhancing simulation video for "${video.search_query}":`, error);
              }
            }
          }
        }
      }
      console.log('YouTube video links added to simulations successfully');
    } catch (error) {
      console.error('Failed to enhance simulations with YouTube links:', error);
      // Continue with original simulation data
    }

    // Store simulations in MongoDB if available
    let simulationIds = [];
    if (persistenceMode === 'mongo') {
      try {
        for (const simulation of simulationData.simulations) {
          const simulationDoc = await Simulation.create({
            userId: userId,
            role: detectedRole,
            simulation: simulation,
            estimated_duration: simulation.estimated_duration || "2-4 hours",
            learning_objectives: simulation.learning_objectives || ["Improve technical skills", "Practice interviews", "Build portfolio"],
            skillsTargeted: simulation.skills,
            difficulty: simulation.difficulty,
            generatedAt: new Date(),
            status: 'active',
            progress: {
              completedModes: simulation.completedModes,
              overallProgress: simulation.overallProgress
            }
          });
          simulationIds.push(simulationDoc._id);
        }
        console.log('Simulations stored in MongoDB with IDs:', simulationIds);
      } catch (error) {
        console.error('Failed to store simulations in MongoDB:', error);
      }
    }

    return res.json({
      success: true,
      userId: userId,
      role: detectedRole,
      simulations: simulationData.simulations,
      simulationIds: simulationIds,
      generatedAt: new Date().toISOString(),
      storedInMongoDB: persistenceMode === 'mongo' && simulationIds.length > 0
    });
    
  } catch (error) {
    console.error('Failed to generate simulations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate simulations',
      details: error.message
    });
  }
});

// Get stored roadmap by ID
app.get('/roadmap/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (persistenceMode === 'mongo') {
      const roadmap = await Roadmap.findById(id);
      if (!roadmap) {
        return res.status(404).json({ error: 'Roadmap not found' });
      }
      
      return res.json({
        success: true,
        roadmap_id: roadmap._id,
        analysis_id: roadmap.analysisId,
        role: roadmap.role,
        roadmap: roadmap.roadmap,
        estimated_timeline: roadmap.estimated_timeline,
        success_metrics: roadmap.success_metrics,
        model_used: roadmap.model_used,
        generated_at: roadmap.generated_at,
        created_at: roadmap.created_at,
        updated_at: roadmap.updated_at
      });
    } else {
      return res.status(404).json({ error: 'Roadmap not found (memory mode)' });
    }
  } catch (error) {
    console.error('Roadmap retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve roadmap' });
  }
});

// Get stored simulation by ID
app.get('/simulation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (persistenceMode === 'mongo') {
      const simulation = await Simulation.findById(id);
      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }
      
      return res.json({
        success: true,
        simulation_id: simulation._id,
        analysis_id: simulation.analysisId,
        role: simulation.role,
        simulation: simulation.simulation,
        estimated_duration: simulation.estimated_duration,
        learning_objectives: simulation.learning_objectives,
        model_used: simulation.model_used,
        started_at: simulation.started_at,
        status: simulation.status,
        progress: simulation.progress,
        created_at: simulation.created_at,
        updated_at: simulation.updated_at
      });
    } else {
      return res.status(404).json({ error: 'Simulation not found (memory mode)' });
    }
  } catch (error) {
    console.error('Simulation retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve simulation' });
  }
});

// Get user's roadmaps
app.get('/user/:userId/roadmaps', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (persistenceMode === 'mongo') {
      const roadmaps = await Roadmap.find({ userId }).sort({ created_at: -1 });
      
      return res.json({
        success: true,
        roadmaps: roadmaps.map(roadmap => ({
          roadmap_id: roadmap._id,
          analysis_id: roadmap.analysisId,
          role: roadmap.role,
          estimated_timeline: roadmap.estimated_timeline,
          model_used: roadmap.model_used,
          generated_at: roadmap.generated_at,
          created_at: roadmap.created_at
        }))
      });
    } else {
      return res.json({ success: true, roadmaps: [] });
    }
  } catch (error) {
    console.error('User roadmaps retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user roadmaps' });
  }
});

// Get user's simulations
app.get('/user/:userId/simulations', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (persistenceMode === 'mongo') {
      const simulations = await Simulation.find({ userId }).sort({ created_at: -1 });
      
      return res.json({
        success: true,
        simulations: simulations.map(simulation => ({
          simulation_id: simulation._id,
          analysis_id: simulation.analysisId,
          role: simulation.role,
          estimated_duration: simulation.estimated_duration,
          model_used: simulation.model_used,
          started_at: simulation.started_at,
          status: simulation.status,
          progress: simulation.progress,
          created_at: simulation.created_at
        }))
      });
    } else {
      return res.json({ success: true, simulations: [] });
    }
  } catch (error) {
    console.error('User simulations retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user simulations' });
  }
});

// Update simulation progress
app.put('/simulation/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_scenarios, completed_interviews, completed_challenges, completed_projects, overall_progress } = req.body;
    
    if (persistenceMode === 'mongo') {
      const simulation = await Simulation.findByIdAndUpdate(
        id,
        {
          $set: {
            'progress.completed_scenarios': completed_scenarios || [],
            'progress.completed_interviews': completed_interviews || [],
            'progress.completed_challenges': completed_challenges || [],
            'progress.completed_projects': completed_projects || [],
            'progress.overall_progress': overall_progress || 0,
            updated_at: new Date()
          }
        },
        { new: true }
      );
      
      if (!simulation) {
        return res.status(404).json({ error: 'Simulation not found' });
      }
      
      return res.json({
        success: true,
        simulation_id: simulation._id,
        progress: simulation.progress,
        updated_at: simulation.updated_at
      });
    } else {
      return res.status(404).json({ error: 'Simulation not found (memory mode)' });
    }
  } catch (error) {
    console.error('Simulation progress update error:', error);
    return res.status(500).json({ error: 'Failed to update simulation progress' });
  }
});

// Generate detailed roadmap for individual skill
app.post('/generate-skill-roadmap', async (req, res) => {
  const { skill, currentLevel, targetLevel, priority, role } = req.body;

  try {
    const skillRoadmapPrompt = `Generate a comprehensive learning roadmap for the skill "${skill}" to help a ${role} reach from ${currentLevel}% to ${targetLevel}% proficiency level.

    SKILL: ${skill}
    CURRENT LEVEL: ${currentLevel}%
    TARGET LEVEL: ${targetLevel}%
    PRIORITY: ${priority}
    ROLE: ${role}
    GAP: ${targetLevel - currentLevel} points needed

    Create a detailed, structured learning roadmap with:
    1. Learning phases (Beginner → Intermediate → Advanced)
    2. Specific topics to cover in each phase
    3. Hands-on projects for each phase
    4. YouTube video recommendations with specific topics
    5. Online courses and certifications
    6. Practice exercises and challenges
    7. Timeline for each phase
    8. Assessment methods to track progress

    Return ONLY valid JSON with this structure:
    {
      "skill": "${skill}",
      "current_level": ${currentLevel},
      "target_level": ${targetLevel},
      "gap_points": ${targetLevel - currentLevel},
      "priority": "${priority}",
      "roadmap": {
        "beginner_phase": {
          "duration": "2-3 weeks",
          "topics": ["topic1", "topic2", "topic3"],
          "projects": [
            {
              "name": "project name",
              "description": "project description",
              "skills_developed": ["skill1", "skill2"],
              "timeline": "1 week"
            }
          ],
          "youtube_videos": [
            {
              "title": "video title",
              "topic": "specific topic",
              "search_query": "youtube search query",
              "duration": "video duration"
            }
          ],
          "courses": ["course1", "course2"],
          "certifications": ["cert1", "cert2"],
          "practice_exercises": ["exercise1", "exercise2"],
          "assessment": "how to assess progress"
        },
        "intermediate_phase": {
          "duration": "3-4 weeks",
          "topics": ["topic1", "topic2", "topic3"],
          "projects": [
            {
              "name": "project name",
              "description": "project description",
              "skills_developed": ["skill1", "skill2"],
              "timeline": "2 weeks"
            }
          ],
          "youtube_videos": [
            {
              "title": "video title",
              "topic": "specific topic",
              "search_query": "youtube search query",
              "duration": "video duration"
            }
          ],
          "courses": ["course1", "course2"],
          "certifications": ["cert1", "cert2"],
          "practice_exercises": ["exercise1", "exercise2"],
          "assessment": "how to assess progress"
        },
        "advanced_phase": {
          "duration": "2-3 weeks",
          "topics": ["topic1", "topic2", "topic3"],
          "projects": [
            {
              "name": "project name",
              "description": "project description",
              "skills_developed": ["skill1", "skill2"],
              "timeline": "1 week"
            }
          ],
          "youtube_videos": [
            {
              "title": "video title",
              "topic": "specific topic",
              "search_query": "youtube search query",
              "duration": "video duration"
            }
          ],
          "courses": ["course1", "course2"],
          "certifications": ["cert1", "cert2"],
          "practice_exercises": ["exercise1", "exercise2"],
          "assessment": "how to assess progress"
        }
      },
      "total_timeline": "overall timeline",
      "success_metrics": ["metric1", "metric2", "metric3"],
      "learning_resources": {
        "platforms": ["platform1", "platform2"],
        "books": ["book1", "book2"],
        "communities": ["community1", "community2"],
        "tools": ["tool1", "tool2"]
      }
    }`;

    // Use RAG service instead of vertex.js
    const roadmapResponse = await ragAnalyzer.generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: skillRoadmapPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    });
    const roadmapText = roadmapResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    console.log('Generated skill roadmap:', roadmapText);

    const safeParse = (text) => {
      try {
        // First try to parse as-is
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e);
        console.log('Problematic JSON text:', text.substring(0, 200) + '...');
        
        // Try to clean and fix common JSON issues
        try {
          let cleanedText = text.trim();
          
          // Remove any text before the first { or [
          const firstBrace = cleanedText.indexOf('{');
          const firstBracket = cleanedText.indexOf('[');
          const start = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
          
          if (start !== -1) {
            cleanedText = cleanedText.substring(start);
          }
          
          // Try to fix common issues
          cleanedText = cleanedText
            .replace(/,\s*}/g, '}')  // Remove trailing commas before }
            .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Add quotes around unquoted keys
            .replace(/:\s*([^",{\[\s][^,}\]]*?)(\s*[,}])/g, ': "$1"$2')  // Add quotes around unquoted string values
            .replace(/: "(\d+\.?\d*)"(\s*[,}])/g, ': $1$2')  // Remove quotes from numbers
            .replace(/: "(true|false|null)"(\s*[,}])/g, ': $1$2');  // Remove quotes from booleans and null
          
          return JSON.parse(cleanedText);
        } catch (cleanError) {
          console.error('Failed to clean JSON:', cleanError);
        }
        
        // Try to extract JSON from the text if it's embedded in other content
        try {
          // Find the first complete JSON object by tracking braces
          let start = text.indexOf('{');
          if (start === -1) {
            start = text.indexOf('[');
            if (start === -1) return null;
          }
          
          let braceCount = 0;
          let inString = false;
          let escapeNext = false;
          let end = -1;
          
          for (let i = start; i < text.length; i++) {
            const char = text[i];
            
            if (escapeNext) {
              escapeNext = false;
              continue;
            }
            
            if (char === '\\') {
              escapeNext = true;
              continue;
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString;
              continue;
            }
            
            if (!inString) {
              if (char === '{' || char === '[') {
                braceCount++;
              } else if (char === '}' || char === ']') {
                braceCount--;
                if (braceCount === 0) {
                  end = i;
                  break;
                }
              }
            }
          }
          
          if (end !== -1) {
            const jsonPart = text.slice(start, end + 1);
            return JSON.parse(jsonPart);
          }
        } catch (extractError) {
          console.error('Failed to extract JSON:', extractError);
        }
        
        return null;
      }
    };

    let roadmapData = safeParse(roadmapText);
    
    // If parsing failed, create fallback data
    if (!roadmapData || !roadmapData.roadmap) {
      console.log('Creating fallback skill roadmap data...');
      
      roadmapData = {
        skill: skill,
        current_level: currentLevel,
        target_level: targetLevel,
        gap_points: targetLevel - currentLevel,
        priority: priority,
        roadmap: {
          beginner_phase: {
            duration: "2-3 weeks",
            topics: [`${skill} Fundamentals`, `${skill} Basics`, `${skill} Introduction`],
            projects: [
              {
                name: `${skill} Practice Project`,
                description: `Build a basic project using ${skill} to understand fundamentals`,
                skills_developed: [skill, 'Problem Solving'],
                timeline: '1 week'
              }
            ],
            youtube_videos: [
              {
                title: `${skill} Tutorial for Beginners`,
                topic: `Learn ${skill} fundamentals`,
                search_query: `${skill} tutorial beginner`,
                duration: '30-45 min'
              }
            ],
            courses: [`${skill} Fundamentals Course`, `${skill} Basics Training`],
            certifications: [`${skill} Beginner Certificate`],
            practice_exercises: [`${skill} Basic Exercises`, `${skill} Practice Problems`],
            assessment: `Complete ${skill} beginner assessment`
          },
          intermediate_phase: {
            duration: "3-4 weeks",
            topics: [`${skill} Intermediate Concepts`, `${skill} Advanced Features`, `${skill} Best Practices`],
            projects: [
              {
                name: `${skill} Intermediate Project`,
                description: `Build an intermediate project using ${skill} with advanced features`,
                skills_developed: [skill, 'Advanced Problem Solving'],
                timeline: '2 weeks'
              }
            ],
            youtube_videos: [
              {
                title: `${skill} Intermediate Tutorial`,
                topic: `Learn ${skill} intermediate concepts`,
                search_query: `${skill} intermediate tutorial`,
                duration: '45-60 min'
              }
            ],
            courses: [`${skill} Intermediate Course`, `${skill} Advanced Training`],
            certifications: [`${skill} Intermediate Certificate`],
            practice_exercises: [`${skill} Intermediate Exercises`, `${skill} Advanced Problems`],
            assessment: `Complete ${skill} intermediate assessment`
          },
          advanced_phase: {
            duration: "2-3 weeks",
            topics: [`${skill} Advanced Concepts`, `${skill} Expert Techniques`, `${skill} Optimization`],
            projects: [
              {
                name: `${skill} Advanced Project`,
                description: `Build an advanced project using ${skill} with expert techniques`,
                skills_developed: [skill, 'Expert Problem Solving'],
                timeline: '1 week'
              }
            ],
            youtube_videos: [
              {
                title: `${skill} Advanced Tutorial`,
                topic: `Learn ${skill} advanced concepts`,
                search_query: `${skill} advanced tutorial`,
                duration: '60-90 min'
              }
            ],
            courses: [`${skill} Advanced Course`, `${skill} Expert Training`],
            certifications: [`${skill} Advanced Certificate`, `${skill} Expert Certificate`],
            practice_exercises: [`${skill} Advanced Exercises`, `${skill} Expert Problems`],
            assessment: `Complete ${skill} advanced assessment`
          }
        },
        total_timeline: "6-10 weeks",
        success_metrics: [
          `Complete ${skill} beginner assessment`,
          `Complete ${skill} intermediate assessment`,
          `Complete ${skill} advanced assessment`,
          `Build 3 projects using ${skill}`,
          `Earn ${skill} certification`
        ],
        learning_resources: {
          platforms: ['YouTube', 'Coursera', 'Udemy', 'FreeCodeCamp'],
          books: [`${skill} Reference Guide`, `${skill} Best Practices Book`],
          communities: ['Stack Overflow', 'Reddit', 'Discord', 'LinkedIn Groups'],
          tools: [`${skill} Official Documentation`, `${skill} Practice Tools`]
        }
      };
    }

    // Enhance skill roadmap with actual YouTube video links
    try {
      console.log('Enhancing skill roadmap with YouTube video links...');
      roadmapData = await youtubeService.generateRoadmapVideoLinks(roadmapData);
      console.log('YouTube video links added to skill roadmap successfully');
    } catch (error) {
      console.error('Failed to enhance skill roadmap with YouTube links:', error);
      // Continue with original roadmap data
    }

    res.json({
      success: true,
      roadmap: roadmapData
    });

  } catch (error) {
    console.error('Skill roadmap generation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate skill roadmap: ' + error.message 
    });
  }
});

// Test YouTube service endpoint
app.get('/test-youtube/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!youtubeService) {
      return res.status(503).json({ 
        success: false, 
        error: 'YouTube service not initialized' 
      });
    }

    console.log(`Testing YouTube search for: ${query}`);
    const results = await youtubeService.searchVideosWithDetails(query, 3);
    
    res.json({
      success: true,
      query: query,
      results: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('YouTube test error:', error);
    res.status(500).json({
      success: false,
      error: 'YouTube test failed',
      details: error.message
    });
  }
});

// Find job matches based on role and skills
function findJobMatches(role, foundSkills) {
  console.log(`Finding job matches for role: ${role}`);
  console.log(`Found skills: ${foundSkills.join(', ')}`);
  console.log(`Found skills type: ${typeof foundSkills}, length: ${foundSkills?.length}`);
  
  const jobs = JOB_DATABASE[role] || [];
  console.log(`Available jobs for ${role}: ${jobs.length}`);
  
  if (!foundSkills || foundSkills.length === 0) {
    console.log('No skills found for job matching');
    return [];
  }
  
  const matches = [];
  
  for (const job of jobs) {
    // Calculate match percentage based on required and preferred skills
    const requiredSkills = job.requiredSkills || [];
    const preferredSkills = job.preferredSkills || [];
    
    // Enhanced skill matching with better synonym handling
    const skillSynonyms = {
      'rest': ['rest api', 'restful', 'rest apis', 'api'],
      'gcp': ['google cloud platform', 'google cloud', 'gcp'],
      'aws': ['amazon web services', 'aws'],
      'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment', 'cicd'],
      'testing': ['test', 'testing', 'test-driven development', 'tdd', 'unit testing'],
      'javascript': ['js', 'javascript', 'ecmascript'],
      'typescript': ['ts', 'typescript'],
      'react': ['react', 'reactjs', 'react.js'],
      'node.js': ['node', 'nodejs', 'node.js'],
      'sql': ['sql', 'mysql', 'postgresql', 'database', 'databases'],
      'docker': ['docker', 'containerization', 'containers'],
      'kubernetes': ['kubernetes', 'k8s'],
      'java': ['java', 'jvm'],
      'python': ['python', 'py'],
      'git': ['git', 'github', 'version control'],
      'html': ['html', 'html5'],
      'css': ['css', 'css3', 'styling'],
      'mongodb': ['mongodb', 'mongo'],
      'express': ['express', 'expressjs'],
      'angular': ['angular', 'angularjs'],
      'vue': ['vue', 'vuejs'],
      'linux': ['linux', 'unix'],
      'graphql': ['graphql'],
      'machine learning': ['ml', 'ai', 'artificial intelligence', 'machine learning'],
      'agile': ['agile', 'scrum'],
      'azure': ['azure', 'microsoft azure']
    };

    const normalizeSkill = (skill) => {
      const lower = skill.toLowerCase();
      for (const [key, synonyms] of Object.entries(skillSynonyms)) {
        if (synonyms.some(synonym => lower.includes(synonym) || synonym.includes(lower))) {
          return key;
        }
      }
      return lower;
    };

    // Count how many required skills the candidate has
    const requiredMatches = requiredSkills.filter(skill => {
      const normalizedJobSkill = normalizeSkill(skill);
      const hasMatch = foundSkills.some(foundSkill => {
        const normalizedFoundSkill = normalizeSkill(foundSkill);
        const isMatch = normalizedFoundSkill === normalizedJobSkill ||
               normalizedFoundSkill.includes(normalizedJobSkill) ||
               normalizedJobSkill.includes(normalizedFoundSkill);
        if (isMatch) {
          console.log(`✓ Match found: "${foundSkill}" (${normalizedFoundSkill}) matches "${skill}" (${normalizedJobSkill})`);
        }
        return isMatch;
      });
      if (!hasMatch) {
        console.log(`✗ No match for required skill: "${skill}" (${normalizedJobSkill})`);
      }
      return hasMatch;
    }).length;
    
    // Count how many preferred skills the candidate has
    const preferredMatches = preferredSkills.filter(skill => {
      const normalizedJobSkill = normalizeSkill(skill);
      return foundSkills.some(foundSkill => {
        const normalizedFoundSkill = normalizeSkill(foundSkill);
        return normalizedFoundSkill === normalizedJobSkill ||
               normalizedFoundSkill.includes(normalizedJobSkill) ||
               normalizedJobSkill.includes(normalizedFoundSkill);
      });
    }).length;
    
    // Calculate match percentage (required skills weighted more heavily)
    const requiredWeight = 0.7;
    const preferredWeight = 0.3;
    const totalRequired = requiredSkills.length;
    const totalPreferred = preferredSkills.length;
    
    const matchPercentage = Math.round(
      ((requiredMatches / Math.max(totalRequired, 1)) * requiredWeight + 
       (preferredMatches / Math.max(totalPreferred, 1)) * preferredWeight) * 100
    );
    
    console.log(`Job: ${job.title} - Match: ${matchPercentage}% (Required: ${requiredMatches}/${totalRequired}, Preferred: ${preferredMatches}/${totalPreferred})`);
    
    // Only include jobs with at least 30% match
    if (matchPercentage >= 30) {
      const missingSkills = [...requiredSkills, ...preferredSkills].filter(skill => {
        const normalizedJobSkill = normalizeSkill(skill);
        return !foundSkills.some(foundSkill => {
          const normalizedFoundSkill = normalizeSkill(foundSkill);
          return normalizedFoundSkill === normalizedJobSkill ||
                 normalizedFoundSkill.includes(normalizedJobSkill) ||
                 normalizedJobSkill.includes(normalizedFoundSkill);
        });
      });
      
      const match = {
        title: job.title,
        company: job.company,
        location: job.location,
        matchPercentage: matchPercentage,
        missingSkills: missingSkills.slice(0, 3), // Top 3 missing skills
        strongPoints: foundSkills.filter(skill => {
          const normalizedFoundSkill = normalizeSkill(skill);
          return [...requiredSkills, ...preferredSkills].some(jobSkill => {
            const normalizedJobSkill = normalizeSkill(jobSkill);
            return normalizedFoundSkill === normalizedJobSkill ||
                   normalizedFoundSkill.includes(normalizedJobSkill) ||
                   normalizedJobSkill.includes(normalizedFoundSkill);
          });
        }).slice(0, 3), // Top 3 strong points
        description: job.description,
        salary: job.salary
      };
      
      matches.push(match);
      console.log(`Added job match: ${job.title} (${matchPercentage}%)`);
    } else {
      console.log(`Job ${job.title} below 50% threshold (${matchPercentage}%)`);
    }
  }
  
  // Sort by match percentage (highest first) and return top 5
  const finalMatches = matches.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 5);
  console.log(`Final job matches for ${role}: ${finalMatches.length} matches`);
  console.log('Final matches:', JSON.stringify(finalMatches, null, 2));
  return finalMatches;
}

// Auto-detect role from resume content
async function detectRoleFromResume(resumeText) {
  const lowerText = resumeText.toLowerCase();
  console.log('Starting role detection for text length:', resumeText.length);
  console.log('Sample text for role detection:', resumeText.substring(0, 200));
  
  // Define role-specific keywords and their weights
  const roleKeywords = {
    'software-engineer': {
      keywords: ['javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'git', 'docker', 'aws', 'rest api', 'microservices', 'ci/cd', 'jenkins', 'kubernetes', 'backend', 'frontend', 'full-stack', 'programming', 'development', 'software engineer', 'developer'],
      weight: 1
    },
    'data-analyst': {
      keywords: ['sql', 'python', 'tableau', 'power bi', 'excel', 'statistics', 'data analysis', 'analytics', 'machine learning', 'data visualization', 'etl', 'bigquery', 'pandas', 'numpy', 'data analyst', 'business intelligence'],
      weight: 1
    },
    'product-manager': {
      keywords: ['product strategy', 'user research', 'analytics', 'roadmapping', 'agile', 'scrum', 'stakeholder management', 'product manager', 'product owner', 'market research', 'competitive analysis', 'a/b testing'],
      weight: 1
    },
    'ux-designer': {
      keywords: ['figma', 'sketch', 'adobe xd', 'prototyping', 'user research', 'wireframing', 'usability testing', 'ux designer', 'ui designer', 'user experience', 'user interface', 'design system', 'accessibility'],
      weight: 1
    }
  };

  // Calculate scores for each role
  const roleScores = {};
  for (const [role, config] of Object.entries(roleKeywords)) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (lowerText.includes(keyword)) {
        score += config.weight;
      }
    }
    roleScores[role] = score;
  }

  // Find the role with the highest score
  const bestRole = Object.entries(roleScores).reduce((a, b) => roleScores[a[0]] > roleScores[b[0]] ? a : b);
  
  console.log('Role detection scores:', roleScores);
  console.log('Best role match:', bestRole);
  
  // If no clear match, default to software-engineer for technical resumes
  if (bestRole[1] === 0) {
    const hasTechnicalSkills = lowerText.includes('javascript') || lowerText.includes('python') || 
                              lowerText.includes('java') || lowerText.includes('programming') ||
                              lowerText.includes('developer') || lowerText.includes('engineer');
    console.log('No clear match, has technical skills:', hasTechnicalSkills);
    return hasTechnicalSkills ? 'software-engineer' : 'data-analyst';
  }

  console.log('Detected role:', bestRole[0]);
  return bestRole[0];
}

// Intelligent resume analysis function
async function analyzeResumeIntelligently(resumeText, jdText, target_role) {
  // Extract skills from resume text
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
    'Data Analysis': ['data analysis', 'analytics', 'statistics'],
    'Tableau': ['tableau'],
    'Power BI': ['power bi', 'powerbi'],
    'Excel': ['excel'],
    'Figma': ['figma'],
    'Sketch': ['sketch'],
    'Adobe': ['adobe', 'photoshop', 'illustrator'],
    'Agile': ['agile', 'scrum'],
    'CI/CD': ['ci/cd', 'continuous integration', 'continuous deployment'],
    'Jenkins': ['jenkins'],
    'Azure': ['azure', 'microsoft azure'],
    'GCP': ['gcp', 'google cloud', 'google cloud platform']
  };

  const foundSkills = [];
  const lowerText = resumeText.toLowerCase();
  
  console.log('Starting skill extraction for role:', target_role);
  console.log('Resume text length for skill extraction:', resumeText.length);
  
  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      foundSkills.push(skill);
      console.log(`Found skill: ${skill} (keywords: ${keywords.join(', ')})`);
    }
  }
  
  console.log('Total skills found:', foundSkills.length);
  console.log('Found skills:', foundSkills);

  // Define role requirements
  const roleRequirements = {
    'software-engineer': ['Python', 'Docker', 'AWS', 'Machine Learning', 'Kubernetes', 'CI/CD'],
    'data-analyst': ['Python', 'SQL', 'Tableau', 'Statistics', 'Machine Learning', 'Excel'],
    'product-manager': ['User Research', 'Analytics', 'Agile', 'Stakeholder Management', 'Excel'],
    'ux-designer': ['Figma', 'User Research', 'Prototyping', 'Accessibility', 'Adobe']
  };

  const requiredSkills = roleRequirements[target_role] || [];
  const missingSkills = requiredSkills.filter(skill => !foundSkills.includes(skill));

  // Generate recommendations based on missing skills
  const recommendations = [];
  if (missingSkills.includes('Python')) {
    recommendations.push('Learn Python for data analysis and backend development');
  }
  if (missingSkills.includes('Docker')) {
    recommendations.push('Get familiar with Docker for containerization');
  }
  if (missingSkills.includes('AWS')) {
    recommendations.push('Study AWS cloud services for deployment');
  }
  if (missingSkills.includes('Machine Learning')) {
    recommendations.push('Consider learning machine learning basics');
  }
  if (missingSkills.includes('Kubernetes')) {
    recommendations.push('Explore Kubernetes for container orchestration');
  }
  if (missingSkills.includes('SQL')) {
    recommendations.push('Master SQL for database management and queries');
  }
  if (missingSkills.includes('Tableau')) {
    recommendations.push('Learn Tableau for data visualization');
  }
  if (missingSkills.includes('Figma')) {
    recommendations.push('Master Figma for UI/UX design');
  }

  // Calculate match score based on found skills vs requirements
  const matchScore = Math.min(100, Math.round((foundSkills.length / Math.max(requiredSkills.length, 1)) * 100));

  // Find job matches for the detected role
  const jobMatches = findJobMatches(target_role, foundSkills);
  console.log(`Found ${jobMatches.length} job matches for role: ${target_role}`);
  console.log('Job matches details:', JSON.stringify(jobMatches, null, 2));

  const result = {
    match_score: matchScore,
    skills_present: foundSkills,
    skills_missing: missingSkills,
    job_matches: jobMatches,
    recommendations: recommendations.length > 0 ? recommendations : [
      'Continue building experience in your current role',
      'Seek opportunities to work on diverse projects',
      'Consider obtaining relevant certifications'
    ]
  };
  
  console.log('Final analysis result:', JSON.stringify(result, null, 2));
  return result;
}

const PORT = process.env.PORT || 3001;

// Keep the server running and handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Test YouTube service endpoint
app.get('/test-youtube-service', async (req, res) => {
  try {
    const testQuery = 'Python programming tutorial';
    const videos = await youtubeService.searchVideosWithDetails(testQuery, 1);
    
    res.json({
      apiKeyAvailable: !!process.env.YOUTUBE_API_KEY,
      testQuery: testQuery,
      videosFound: videos.length,
      sampleVideo: videos.length > 0 ? videos[0] : null,
      videos: videos
    });
  } catch (error) {
    console.error('YouTube service test error:', error);
    res.status(500).json({
      error: 'YouTube service test failed',
      details: error.message,
      apiKeyAvailable: !!process.env.YOUTUBE_API_KEY
    });
  }
});

// For Vercel deployment

export default app;

// Start HTTP listener when running locally OR in container hosts like Render
if (process.env.NODE_ENV !== 'production' || process.env.RENDER || process.env.RUN_IN_CONTAINER === 'true') {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`📊 Persistence mode: ${persistenceMode}`);
  });
}


