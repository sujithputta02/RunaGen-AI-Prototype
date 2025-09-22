import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, Loader2, 
  Trash2, RefreshCw, Target, TrendingUp,
  Award, Lightbulb, ArrowRight, Star, Zap, Youtube
} from 'lucide-react';
import FullAnalysisModal from './FullAnalysisModal';
import YouTubeVideoCard from './YouTubeVideoCard';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface SkillGap {
  skill: string;
  current: number;
  required: number;
  gap: number;
  priority: 'high' | 'medium' | 'low';
}

interface JobMatch {
  title: string;
  company: string;
  matchPercentage: number;
  missingSkills: string[];
  strongPoints: string[];
  location?: string;
  description?: string;
  salary?: string;
}

interface ResumeAnalysis {
  analysisId?: string;
  skillsFound: string[];
  skillsGap: SkillGap[];
  jobMatches: JobMatch[];
  overallScore: number;
  recommendations: string[];
  experienceLevel: string;
  careerTracks: string[];
}

interface ResumeUploadProps {
  onAnalysisComplete?: (analysis: ResumeAnalysis) => void;
  onRoadmapGenerated?: (roadmap: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete, onRoadmapGenerated }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedJobRole, setSelectedJobRole] = useState('auto-detect');
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isStartingSimulation, setIsStartingSimulation] = useState(false);

  // Test server connection and templates
  const testServer = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-templates`);
      const data = await response.json();
      console.log('Server test response:', data);
      alert(`Server is running! Available roles: ${data.available_roles.join(', ')}`);
    } catch (error) {
      console.error('Server test failed:', error);
      alert('Server test failed: ' + error.message);
    }
  };

  // Test job database
  const testJobDatabase = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-job-database`);
      const data = await response.json();
      console.log('Job database test response:', data);
      
      const message = `
Job Database Test Results:
- Available Roles: ${data.available_roles.join(', ')}
- Software Engineer Jobs: ${data.software_engineer_jobs}
- Sample Job: ${data.sample_job ? data.sample_job.title : 'None'}
      `;
      
      alert(message);
    } catch (error) {
      console.error('Job database test failed:', error);
      alert('Job database test failed: ' + error.message);
    }
  };

  // Test YouTube service
  const testYouTubeService = async () => {
    try {
      const response = await fetch(`${API_BASE}/test-youtube-service`);
      const data = await response.json();
      console.log('YouTube service test response:', data);
      
      const message = `
YouTube Service Test Results:
- API Key Available: ${data.apiKeyAvailable ? 'Yes' : 'No'}
- Test Query: ${data.testQuery}
- Videos Found: ${data.videosFound}
- Sample Video: ${data.sampleVideo ? data.sampleVideo.title : 'None'}
- Video URL: ${data.sampleVideo ? data.sampleVideo.url : 'None'}
      `;
      
      alert(message);
    } catch (error) {
      console.error('YouTube service test failed:', error);
      alert('YouTube service test failed: ' + error.message);
    }
  };

  // Test job matches
  const testJobMatches = async () => {
    try {
      // First, detect role from uploaded file if available
      let testRole = 'software-engineer';
      let testSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS', 'Docker'];
      
      if (uploadedFile) {
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          
          const pdfResponse = await fetch(`${API_BASE}/test-pdf-parsing`, {
            method: 'POST',
            body: formData,
          });
          
          const pdfData = await pdfResponse.json();
          if (pdfData.success && pdfData.detected_role) {
            testRole = pdfData.detected_role;
            console.log('Detected role from uploaded file:', testRole);
            
            // Use role-appropriate skills
            switch (testRole) {
              case 'ux-designer':
                testSkills = ['Figma', 'Prototyping', 'User Research', 'Usability Testing', 'Design Systems', 'Adobe Creative Suite', 'Wireframing', 'Accessibility'];
                break;
              case 'data-analyst':
                testSkills = ['SQL', 'Python', 'Tableau', 'Power BI', 'Statistics', 'Excel', 'Machine Learning', 'Analytics'];
                break;
              case 'product-manager':
                testSkills = ['Product Strategy', 'User Research', 'Analytics', 'Agile', 'Stakeholder Management', 'A/B Testing', 'Roadmapping'];
                break;
              default:
                testSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS', 'Docker'];
            }
          }
        } catch (error) {
          console.log('Could not detect role from file, using default:', error.message);
        }
      }
      
      console.log('Testing job matches with role:', testRole, 'and skills:', testSkills);
      
      const response = await fetch(`${API_BASE}/test-job-matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: testRole,
          skills: testSkills
        }),
      });

      const data = await response.json();
      console.log('Job matching test response:', data);
      
      const message = `
Job Matching Test Results:
- Role: ${data.role}
- Skills: ${data.skills.join(', ')}
- Total Matches: ${data.total_matches}

Job Matches:
${data.job_matches.map((job: any) => 
  `• ${job.title} at ${job.company} (${job.matchPercentage}% match)`
).join('\n')}
      `;
      
      alert(message);
    } catch (error) {
      console.error('Job matches test failed:', error);
      alert('Job matches test failed: ' + error.message);
    }
  };

  // Test PDF parsing
  const testPdfParsing = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch(`${API_BASE}/test-pdf-parsing`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('PDF parsing test response:', data);
      
      const message = `
PDF Parsing Test Results:
- File Type: ${data.file_type}
- Text Length: ${data.text_length} characters
- Detected Role: ${data.detected_role}
- Has JavaScript: ${data.has_javascript}
- Has Python: ${data.has_python}
- Has React: ${data.has_react}
- Has Node: ${data.has_node}
- Has SQL: ${data.has_sql}
- Has Tableau: ${data.has_tableau}

First 500 characters:
${data.first_500_chars}
      `;
      
      alert(message);
    } catch (error) {
      console.error('PDF parsing test failed:', error);
      alert('PDF parsing test failed: ' + error.message);
    }
  };

  // Mock job descriptions for different roles
  const jobDescriptions = {
    'auto-detect': {
      title: 'Auto-Detect Role',
      skills: ['Automatic role detection based on resume content'],
      description: 'Let AI determine the best role match for your resume'
    },
    'data-analyst': {
      title: 'Data Analyst',
      skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics', 'Power BI', 'R'],
      description: 'Analyze complex datasets to drive business decisions'
    },
    'software-engineer': {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'AWS', 'Docker'],
      description: 'Build scalable web applications and systems'
    },
    'product-manager': {
      title: 'Product Manager',
      skills: ['Product Strategy', 'Analytics', 'User Research', 'Agile', 'SQL', 'Figma'],
      description: 'Drive product vision and strategy from conception to launch'
    },
    'ux-designer': {
      title: 'UX Designer',
      skills: ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Adobe Creative Suite', 'Usability Testing'],
      description: 'Design intuitive user experiences and interfaces'
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
      } else {
        alert('Please upload a PDF file only.');
      }
    }
  };

  const simulateResumeAnalysis = async (): Promise<ResumeAnalysis> => {
    // Simulate API call delay and progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const selectedJob = jobDescriptions[selectedJobRole as keyof typeof jobDescriptions];
    
    // Mock analysis based on selected job role
    const mockAnalysis: ResumeAnalysis = {
      skillsFound: ['Python', 'Excel', 'Communication', 'Project Management', 'SQL'],
      skillsGap: [
        { skill: 'Python', current: 70, required: 80, gap: 10, priority: 'medium' },
        { skill: 'SQL', current: 60, required: 90, gap: 30, priority: 'high' },
        { skill: 'Tableau', current: 20, required: 75, gap: 55, priority: 'high' },
        { skill: 'Statistics', current: 45, required: 70, gap: 25, priority: 'medium' },
        { skill: 'Power BI', current: 0, required: 60, gap: 60, priority: 'low' }
      ],
      jobMatches: [
        {
          title: 'Junior Data Analyst',
          company: 'TechCorp Inc.',
          matchPercentage: 75,
          missingSkills: ['Tableau', 'Advanced SQL'],
          strongPoints: ['Python', 'Excel', 'Communication']
        },
        {
          title: 'Business Analyst',
          company: 'DataFlow Solutions',
          matchPercentage: 68,
          missingSkills: ['Power BI', 'Statistics'],
          strongPoints: ['Project Management', 'Excel']
        },
        {
          title: 'Data Analyst Intern',
          company: 'StartupXYZ',
          matchPercentage: 82,
          missingSkills: ['Tableau'],
          strongPoints: ['Python', 'SQL', 'Communication']
        }
      ],
      overallScore: 72,
      recommendations: [
        'Focus on improving SQL skills - this is critical for data analyst roles',
        'Learn Tableau for data visualization - highly demanded skill',
        'Consider taking a statistics course to strengthen analytical foundation',
        'Add more quantifiable achievements to your resume',
        'Include specific projects that demonstrate data analysis skills'
      ],
      experienceLevel: 'Entry Level',
      careerTracks: ['Data Analyst', 'Business Analyst', 'Data Scientist (with additional training)']
    };

    return mockAnalysis;
  };

  const analyzeResume = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      const form = new FormData();
      form.append('file', uploadedFile);
      
      form.append('target_role', selectedJobRole);
      console.log('Sending target_role:', selectedJobRole);

      const url = `${API_BASE}/upload_resume`;

      const data: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('x-user-id', 'demo-user');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          console.log('Server response status:', xhr.status);
          console.log('Server response text:', xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            try { 
              const response = JSON.parse(xhr.responseText);
              console.log('Parsed response:', response);
              resolve(response); 
            } catch (e) { 
              console.error('JSON parse error:', e);
              resolve({}); 
            }
          } else {
            console.error('Server error:', xhr.status, xhr.responseText);
            // If server is not available, fall back to mock analysis
            if (xhr.status === 0 || xhr.status >= 500) {
              console.log('Server not available, using mock analysis');
              resolve({ 
                match_score: 85, 
                skills_present: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'Git', 'AWS', 'Docker'],
                skills_missing: ['Kubernetes', 'CI/CD', 'Machine Learning'],
                recommendations: ['Learn Kubernetes for container orchestration', 'Master CI/CD practices', 'Explore machine learning basics'],
                detected_role: 'software-engineer'
              });
            } else {
              reject(new Error(xhr.responseText || 'Upload failed'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(form);
      });

      // Debug: Log the received data
      console.log('Received analysis data:', data);
      console.log('Job matches from server:', data.job_matches);

      // Update selected role if auto-detection was used
      if (data.detected_role && data.detected_role !== 'auto-detect') {
        setSelectedJobRole(data.detected_role);
      }

      // Map backend payload to existing UI shape for MVP
      const analysisResult: ResumeAnalysis = {
        analysisId: data.id || null,
        skillsFound: data.skills_present || [],
        skillsGap: (data.skills_missing || []).slice(0,5).map((s: string, index: number) => {
          const current = Math.floor(Math.random() * 40) + 10; // Random current level 10-50
          const required = Math.floor(Math.random() * 30) + 70; // Random required level 70-100
          return {
            skill: s,
            current: current,
            required: required,
            gap: Math.max(0, required - current),
            priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
          };
        }),
        jobMatches: (() => {
          const jobMatches = data.job_matches || [];
          console.log('Processing job matches:', jobMatches);
          const mapped = jobMatches.map((job: any) => ({
            title: job.title,
            company: job.company,
            matchPercentage: job.matchPercentage,
            missingSkills: job.missingSkills || [],
            strongPoints: job.strongPoints || [],
            location: job.location,
            description: job.description,
            salary: job.salary
          }));
          console.log('Mapped job matches:', mapped);
          return mapped;
        })(),
        overallScore: data.match_score ?? 0,
        recommendations: data.recommendations || [],
        experienceLevel: '—',
        careerTracks: []
      };

      console.log('Mapped analysis result:', analysisResult);
      console.log('Final job matches count:', analysisResult.jobMatches.length);

      setAnalysis(analysisResult);
      setAnalysisId(data.id || null);
      onAnalysisComplete?.(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setAnalysis(null);
    setUploadProgress(0);
    setRoadmap(null);
    setSimulation(null);
  };

  // Generate Learning Roadmap
  const generateLearningRoadmap = async () => {
    if (!analysis || !analysisId) {
      alert('Please analyze your resume first');
      return;
    }

    setIsGeneratingRoadmap(true);
    try {
      const response = await fetch(`${API_BASE}/generate-learning-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisId,
          role: analysis.experienceLevel || 'software-engineer',
          skillsPresent: analysis.skillsFound,
          skillsMissing: analysis.skillsGap.map(s => s.skill),
          recommendations: analysis.recommendations
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRoadmap(data.roadmap);
        if (onRoadmapGenerated) {
          onRoadmapGenerated(data.roadmap);
        }
        alert('Learning roadmap generated successfully! Check the roadmap section below and in the Dashboard.');
      } else {
        alert('Failed to generate roadmap: ' + data.error);
      }
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      alert('Failed to generate roadmap: ' + error.message);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Start Career Simulation
  const startCareerSimulation = async () => {
    if (!analysis || !analysisId) {
      alert('Please analyze your resume first');
      return;
    }

    setIsStartingSimulation(true);
    try {
      const response = await fetch(`${API_BASE}/start-career-simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysisId,
          role: analysis.experienceLevel || 'software-engineer',
          skillsPresent: analysis.skillsFound,
          skillsMissing: analysis.skillsGap.map(s => s.skill),
          jobMatches: analysis.jobMatches
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSimulation(data.simulation);
        alert('Career simulation started successfully! Check the simulation section below.');
      } else {
        alert('Failed to start simulation: ' + data.error);
      }
    } catch (error) {
      console.error('Simulation start failed:', error);
      alert('Failed to start simulation: ' + error.message);
    } finally {
      setIsStartingSimulation(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Resume Analysis & Job Matching</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your resume and get AI-powered insights on skill gaps, job matches, and personalized recommendations
        </p>
        <div className="mt-4 space-x-2">
          <button 
            onClick={testServer}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Test Server Connection
          </button>
          <button 
            onClick={testPdfParsing}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            disabled={!uploadedFile}
          >
            Test PDF Parsing
          </button>
          <button 
            onClick={testJobMatches}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Test Job Matches
          </button>
          <button 
            onClick={testJobDatabase}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Test Job Database
          </button>
          <button 
            onClick={testYouTubeService}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Test YouTube Service
          </button>
        </div>
      </div>

      {/* Job Role Selection */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Target Role</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(jobDescriptions).map(([key, job]) => (
            <button
              key={key}
              onClick={() => setSelectedJobRole(key)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                selectedJobRole === key
                  ? 'border-teal-500/60 bg-teal-50/80 backdrop-blur-sm shadow-lg'
                  : 'border-white/40 hover:border-teal-300/60 bg-white/80 backdrop-blur-sm hover:shadow-lg'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{job.description}</p>
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 3 && (
                  <span className="text-xs text-gray-500">+{job.skills.length - 3} more</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Upload Your Resume</h3>
        
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-teal-500 bg-teal-50/80 backdrop-blur-sm' 
                : 'border-white/40 hover:border-teal-400/60 bg-white/80 backdrop-blur-sm'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Drop your resume here or click to browse
            </h4>
            <p className="text-gray-600 mb-4">Supports PDF files up to 10MB</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/20"
            >
              <Upload className="h-5 w-5 mr-2" />
              Choose File
            </label>
          </div>
        ) : (
          <div className="border border-white/40 rounded-xl p-4 bg-white/80 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-red-500" />
                <div>
                  <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isAnalyzing && !analysis && (
                  <button
                    onClick={analyzeResume}
                    className="px-4 py-2 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                  >
                    <Target className="h-4 w-4 mr-2 inline" />
                    Analyze Resume
                  </button>
                )}
                <button
                  onClick={removeFile}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {isAnalyzing && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Analyzing Resume...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-slate-50 via-teal-50/50 to-cyan-50/50 rounded-2xl p-6 border border-white/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Analysis Results</h3>
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{analysis.overallScore}/100</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Experience Level</p>
                <p className="text-lg font-semibold text-gray-900">{analysis.experienceLevel}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Skills Found</p>
                <p className="text-lg font-semibold text-gray-900">{analysis.skillsFound.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Job Matches</p>
                <p className="text-lg font-semibold text-gray-900">{analysis.jobMatches.length}</p>
              </div>
            </div>
          </div>

          {/* Skills Gap Analysis */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Skills Gap Analysis
            </h3>
            <div className="space-y-4">
              {analysis.skillsGap.map((skill) => (
                <div key={skill.skill} className="p-4 border border-white/40 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-gray-900">{skill.skill}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(skill.priority)}`}>
                        {skill.priority} priority
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {skill.current}% / {skill.required}% required
                    </span>
                  </div>
                  <div className="flex space-x-2 mb-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${skill.current}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${skill.required}%` }}
                      ></div>
                    </div>
                  </div>
                  {skill.gap > 0 && (
                    <p className="text-sm text-orange-600">
                      Gap: {skill.gap} points to reach target level
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Job Matches */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-600" />
              Job Matches
            </h3>
            {analysis.jobMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analysis.jobMatches.map((job, index) => (
                <div key={index} className="border border-white/40 rounded-xl p-4 hover:border-teal-300/60 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    <span className="text-lg font-bold text-green-600">{job.matchPercentage}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{job.company}</p>
                  {job.location && <p className="text-xs text-gray-500 mb-1">📍 {job.location}</p>}
                  {job.salary && <p className="text-xs text-green-600 mb-2 font-medium">💰 {job.salary}</p>}
                  {job.description && <p className="text-xs text-gray-600 mb-3">{job.description}</p>}
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1">Strong Points:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.strongPoints.map((point) => (
                          <span key={point} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-orange-700 mb-1">Missing Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.missingSkills.map((skill) => (
                          <span key={skill} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 text-sm backdrop-blur-sm border border-white/20">
                    View Full Job Description
                  </button>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Target className="h-12 w-12 mx-auto" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Job Matches Found</h4>
                <p className="text-gray-600 mb-4">
                  We couldn't find any job matches for your current skills. Try improving your skills or selecting a different role.
                </p>
                <button 
                  onClick={() => setSelectedJobRole('software-engineer')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Software Engineer Role
                </button>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-yellow-600" />
              AI Recommendations
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50/80 backdrop-blur-sm rounded-xl border border-yellow-200/60 shadow-lg">
                  <Zap className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={generateLearningRoadmap}
              disabled={isGeneratingRoadmap}
              className="flex-1 bg-gradient-to-r from-slate-800 to-teal-700 text-white py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
            >
              {isGeneratingRoadmap ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              {isGeneratingRoadmap ? 'Generating...' : 'Generate Learning Roadmap'}
            </button>
            <button 
              onClick={startCareerSimulation}
              disabled={isStartingSimulation}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-white/20"
            >
              {isStartingSimulation ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Award className="h-5 w-5 mr-2" />
              )}
              {isStartingSimulation ? 'Starting...' : 'Start Career Simulation'}
            </button>
            <button 
              onClick={() => analyzeResume()}
              className="px-6 py-3 border border-white/40 text-gray-700 rounded-xl hover:bg-white/80 transition-all duration-300 flex items-center justify-center backdrop-blur-sm shadow-lg"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Re-analyze
            </button>
            <button
              onClick={() => {
                if (analysisId) {
                  setShowFullModal(true);
                } else {
                  alert('Analysis ID not available. Please re-analyze your resume first.');
                }
              }}
              className="px-6 py-3 bg-white/80 border border-teal-300/60 text-teal-700 rounded-xl hover:bg-teal-50/80 transition-all duration-300 backdrop-blur-sm shadow-lg"
            >
              View full analysis
            </button>
          </div>
        </div>
      )}
      {/* Learning Roadmap Section */}
      {roadmap && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <ArrowRight className="h-6 w-6 mr-2 text-purple-600" />
            AI-Generated Learning Roadmap
          </h3>
          
          {/* Stage 1: Critical Gaps */}
          {roadmap.stage_1_critical_gaps && roadmap.stage_1_critical_gaps.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🚨 Stage 1: Critical Skill Gaps (1-2 months)</h4>
              <div className="space-y-3">
                {roadmap.stage_1_critical_gaps.map((skill: any, index: number) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{skill.skill}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                        skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {skill.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Timeline: {skill.timeline}</p>
                    
                    {/* YouTube Videos */}
                    {skill.youtube_videos && skill.youtube_videos.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <Youtube className="h-4 w-4 text-red-600 mr-1" />
                          <p className="text-sm font-medium text-gray-700">Learning Videos</p>
                        </div>
                        <div className="space-y-2">
                          {skill.youtube_videos.slice(0, 2).map((video: any, i: number) => (
                            <YouTubeVideoCard key={i} video={video} compact={true} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exam Preparation */}
                    {skill.exam_preparation && skill.exam_preparation.certifications && skill.exam_preparation.certifications.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">📚 Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.exam_preparation.certifications.slice(0, 2).map((cert: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {skill.projects && skill.projects.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">🛠️ Projects:</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.projects.slice(0, 2).map((project: any, i: number) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {project.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 2: Important Gaps */}
          {roadmap.stage_2_important_gaps && roadmap.stage_2_important_gaps.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">⚠️ Stage 2: Important Skill Gaps (3-6 months)</h4>
              <div className="space-y-3">
                {roadmap.stage_2_important_gaps.map((skill: any, index: number) => (
                  <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{skill.skill}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                        skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {skill.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Timeline: {skill.timeline}</p>
                    
                    {/* YouTube Videos */}
                    {skill.youtube_videos && skill.youtube_videos.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <Youtube className="h-4 w-4 text-yellow-600 mr-1" />
                          <p className="text-sm font-medium text-gray-700">Learning Videos</p>
                        </div>
                        <div className="space-y-2">
                          {skill.youtube_videos.slice(0, 2).map((video: any, i: number) => (
                            <YouTubeVideoCard key={i} video={video} compact={true} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exam Preparation */}
                    {skill.exam_preparation && skill.exam_preparation.certifications && skill.exam_preparation.certifications.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">📚 Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.exam_preparation.certifications.slice(0, 2).map((cert: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 3: Nice-to-Have Gaps */}
          {roadmap.stage_3_nice_to_have && roadmap.stage_3_nice_to_have.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Stage 3: Nice-to-Have Skills (6-12 months)</h4>
              <div className="space-y-3">
                {roadmap.stage_3_nice_to_have.map((skill: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{skill.skill}</h5>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                        skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {skill.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Timeline: {skill.timeline}</p>
                    
                    {/* YouTube Videos */}
                    {skill.youtube_videos && skill.youtube_videos.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <Youtube className="h-4 w-4 text-blue-600 mr-1" />
                          <p className="text-sm font-medium text-gray-700">Learning Videos</p>
                        </div>
                        <div className="space-y-2">
                          {skill.youtube_videos.slice(0, 2).map((video: any, i: number) => (
                            <YouTubeVideoCard key={i} video={video} compact={true} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exam Preparation */}
                    {skill.exam_preparation && skill.exam_preparation.certifications && skill.exam_preparation.certifications.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">📚 Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {skill.exam_preparation.certifications.slice(0, 2).map((cert: string, i: number) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Resources */}
          {roadmap.learning_resources && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">📚 Learning Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.learning_resources.courses && roadmap.learning_resources.courses.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Courses</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {roadmap.learning_resources.courses.map((course: string, i: number) => (
                        <li key={i}>• {course}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {roadmap.learning_resources.platforms && roadmap.learning_resources.platforms.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-semibold text-green-900 mb-2">Platforms</h5>
                    <ul className="text-sm text-green-800 space-y-1">
                      {roadmap.learning_resources.platforms.map((platform: string, i: number) => (
                        <li key={i}>• {platform}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          {roadmap.success_metrics && roadmap.success_metrics.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🎯 Success Metrics</h4>
              <div className="flex flex-wrap gap-2">
                {roadmap.success_metrics.map((metric: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Career Simulation Section */}
      {simulation && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Award className="h-6 w-6 mr-2 text-green-600" />
            Career Simulation
          </h3>
          
          {/* Scenarios */}
          {simulation.scenarios && simulation.scenarios.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🎮 Career Scenarios</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simulation.scenarios.map((scenario: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">{scenario.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${
                        scenario.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        scenario.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {scenario.difficulty}
                      </span>
                      <span className="text-gray-500">{scenario.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview Simulations */}
          {simulation.interview_simulations && simulation.interview_simulations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">💼 Interview Simulations</h4>
              <div className="space-y-4">
                {simulation.interview_simulations.map((interview: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-blue-900">{interview.company} - {interview.role}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${
                        interview.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        interview.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {interview.difficulty}
                      </span>
                    </div>
                    {interview.questions && interview.questions.slice(0, 2).map((question: any, qIndex: number) => (
                      <div key={qIndex} className="mb-2 p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-gray-800">{question.question}</p>
                        <span className="text-xs text-gray-500">{question.type}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          {simulation.learning_objectives && simulation.learning_objectives.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">🎯 Learning Objectives</h4>
              <div className="flex flex-wrap gap-2">
                {simulation.learning_objectives.map((objective: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {objective}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showFullModal && analysisId && (
        <FullAnalysisModal id={analysisId} onClose={() => setShowFullModal(false)} />
      )}
    </div>
  );
};

export default ResumeUpload;