import React, { useState, useCallback } from 'react';
import { 
  Zap, FileText, Target,
  CheckCircle, Copy,
  Sparkles, BarChart3, Award, RefreshCw,
  Upload, Trash2, Image, FileType
} from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface OptimizationResult {
  optimized_resume: string;
  key_improvements: Array<{
    section: string;
    original: string;
    optimized: string;
    reason: string;
  }>;
  ats_score: number;
  keyword_optimization: {
    added_keywords: string[];
    keyword_density: string;
    missing_keywords: string[];
  };
  formatting_improvements: string[];
  achievement_enhancements: Array<{
    original: string;
    enhanced: string;
  }>;
}

interface ATSAnalysis {
  ats_score: number;
  score_breakdown: {
    keyword_match: number;
    formatting: number;
    section_structure: number;
    readability: number;
  };
  keyword_analysis: {
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_density: string;
    optimal_density: string;
  };
  formatting_issues: string[];
  improvement_suggestions: string[];
  pass_probability: number;
}

interface CoverLetterResult {
  cover_letter: string;
  key_highlights: string[];
  personalization_elements: string[];
  call_to_action: string;
}

interface ResumeOptimizerProps {
  resumeText?: string;
  targetRole?: string;
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({ 
  resumeText: initialResumeText, 
  targetRole: initialTargetRole,
  onOptimizationComplete 
}) => {
  const [resumeText, setResumeText] = useState(initialResumeText || '');
  const [targetRole, setTargetRole] = useState(initialTargetRole || 'software-engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [supportedFormats, setSupportedFormats] = useState<any>(null);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCalculatingATS, setIsCalculatingATS] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [atsAnalysis, setATSAnalysis] = useState<ATSAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetterResult | null>(null);
  
  const [activeTab, setActiveTab] = useState<'optimize' | 'ats' | 'cover'>('optimize');

  const roles = [
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'data-analyst', label: 'Data Analyst' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'ux-designer', label: 'UX Designer' },
  ];

  // Fetch supported formats on component mount
  React.useEffect(() => {
    const fetchSupportedFormats = async () => {
      try {
        console.log('Fetching supported formats from:', `${API_BASE}/optimizer/supported-formats`);
        const response = await fetch(`${API_BASE}/optimizer/supported-formats`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Supported formats response:', data);
        
        if (data.success) {
          setSupportedFormats(data);
        } else {
          console.error('API returned success: false');
        }
      } catch (error) {
        console.error('Failed to fetch supported formats:', error);
        // Set default supported formats as fallback
        setSupportedFormats({
          success: true,
          supported_extensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'],
          supported_mime_types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain'],
          max_file_size: '50MB',
          formats: {
            pdf: 'PDF documents (.pdf)',
            word: 'Word documents (.doc, .docx)',
            image: 'Images (.jpg, .jpeg, .png)',
            text: 'Text files (.txt)'
          }
        });
      }
    };
    fetchSupportedFormats();
  }, []);

  // File drag and drop handlers
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
      handleFileSelection(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file type
    const validExtensions = supportedFormats?.supported_extensions || ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt', '.rtf'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      alert(`Unsupported file format: ${fileExtension}\n\nSupported formats: ${validExtensions.join(', ')}`);
      return;
    }
    
    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 50MB`);
      return;
    }
    
    console.log(`File selected: ${file.name} (${fileExtension}, ${(file.size / 1024).toFixed(2)} KB)`);
    setInputMode('file');
    setUploadedFile(file);
    setResumeText(''); // Clear text input when file is selected
  };

  const removeFile = () => {
    setUploadedFile(null);
    setOptimization(null);
    setATSAnalysis(null);
    setCoverLetter(null);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileType className="h-8 w-8 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tiff':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const optimizeResume = async () => {
    if (inputMode === 'file' && uploadedFile) {
      return optimizeResumeFromFile();
    }
    
    if (inputMode === 'text') {
      if (!resumeText.trim()) {
        alert('Please enter your resume text or upload a file');
        return;
      }
    } else if (inputMode === 'file') {
      if (!uploadedFile) {
        alert('Please upload a resume file');
        return;
      }
    }

    setIsOptimizing(true);
    try {
      const response = await fetch(`${API_BASE}/optimize-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          targetRole,
          jobDescriptions: jobDescription ? [jobDescription] : []
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOptimization(data);
        onOptimizationComplete?.(data);
      } else {
        alert('Optimization failed: ' + data.error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Optimization failed:', error);
      alert('Optimization failed: ' + message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeResumeFromFile = async () => {
    if (!uploadedFile) {
      alert('Please upload a file');
      return;
    }

    setIsOptimizing(true);
    try {
      console.log(`Starting file optimization for: ${uploadedFile.name}`);
      
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('targetRole', targetRole);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      if (companyName) formData.append('companyName', companyName);

      console.log(`Sending request to: ${API_BASE}/optimize-resume-file`);
      
      const response = await fetch(`${API_BASE}/optimize-resume-file`, {
        method: 'POST',
        body: formData,
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('File optimization response:', data);
      
      if (data.success) {
        // Set the extracted text for display
        if (data.original_text) {
          setResumeText(data.original_text);
          console.log(`Extracted ${data.original_text.length} characters from file`);
        }
        
        // Set optimization results
        if (data.optimization) {
          setOptimization(data.optimization);
          onOptimizationComplete?.(data.optimization);
          console.log('Optimization results set');
        }
        
        // Set ATS analysis if available
        if (data.ats_analysis) {
          setATSAnalysis(data.ats_analysis);
          console.log('ATS analysis results set');
        }
        
        // Set cover letter if available
        if (data.cover_letter) {
          setCoverLetter(data.cover_letter);
          console.log('Cover letter generated');
        }
        
        alert(`File processed successfully!\n\nFile: ${data.file_info?.original_name}\nType: ${data.file_info?.file_type}\nText extracted: ${data.file_info?.text_length} characters`);
        
      } else {
        const errorMsg = data.error + (data.suggestion ? '\n\nSuggestion: ' + data.suggestion : '');
        console.error('File optimization failed:', errorMsg);
        alert('File optimization failed: ' + errorMsg);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('File optimization failed:', error);
      alert(`File optimization failed: ${message}\n\nPlease check:\n1. Server is running on port 3001\n2. File format is supported\n3. File is not corrupted`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const calculateATSScore = async () => {
    const currentResumeText = resumeText.trim();
    if (!jobDescription.trim()) {
      alert('Please provide a job description');
      return;
    }

    setIsCalculatingATS(true);
    try {
      if (inputMode === 'file' && uploadedFile) {
        // If a file is uploaded, use the file-based endpoint which also returns ats_analysis
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('targetRole', targetRole);
        formData.append('jobDescription', jobDescription);

        const response = await fetch(`${API_BASE}/optimize-resume-file`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
          if (data.original_text) {
            setResumeText(data.original_text);
          }
          if (data.ats_analysis) {
            setATSAnalysis(data.ats_analysis);
          } else {
            alert('ATS analysis not available from server response.');
          }
        } else {
          alert('ATS analysis failed: ' + (data.error || 'Unknown error'));
        }
      } else {
        // Text-input path uses the ATS-only endpoint
        if (!currentResumeText) {
          alert('Please enter your resume text or upload a file');
          return;
        }

        const response = await fetch(`${API_BASE}/calculate-ats-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: currentResumeText,
            jobDescription
          }),
        });

        const data = await response.json();
        if (data.success) {
          setATSAnalysis(data);
        } else {
          alert('ATS analysis failed: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('ATS analysis failed:', error);
      alert('ATS analysis failed: ' + message);
    } finally {
      setIsCalculatingATS(false);
    }
  };

  const generateCoverLetter = async () => {
    const currentResumeText = resumeText.trim();
    if (!jobDescription.trim() || !companyName.trim()) {
      alert('Please provide job description and company name');
      return;
    }

    setIsGeneratingCoverLetter(true);
    try {
      if (inputMode === 'file' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('targetRole', targetRole);
        formData.append('jobDescription', jobDescription);
        formData.append('companyName', companyName);

        const response = await fetch(`${API_BASE}/optimize-resume-file`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
          if (data.original_text) {
            setResumeText(data.original_text);
          }
          if (data.cover_letter) {
            setCoverLetter(data.cover_letter);
          } else {
            alert('Cover letter not available from server response.');
          }
        } else {
          alert('Cover letter generation failed: ' + (data.error || 'Unknown error'));
        }
      } else {
        if (!currentResumeText) {
          alert('Please enter your resume text or upload a file');
          return;
        }

        const response = await fetch(`${API_BASE}/generate-cover-letter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeData: {
              skills: currentResumeText.match(/skills?[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1]?.split(/[\,\n]/).map(s => s.trim()) || [],
              experience: currentResumeText.match(/experience[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1] || '',
              education: currentResumeText.match(/education[:\-\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i)?.[1] || ''
            },
            jobDescription,
            companyName
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCoverLetter(data);
        } else {
          alert('Cover letter generation failed: ' + (data.error || 'Unknown error'));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Cover letter generation failed:', error);
      alert('Cover letter generation failed: ' + message);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <Sparkles className="h-8 w-8 mr-3 text-purple-600" />
          AI Resume Optimizer
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          🎯 <strong>Hackathon Feature:</strong> AI-powered resume optimization, ATS scoring, and cover letter generation
        </p>
        <div className="mt-4">
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE}/optimizer/supported-formats`);
                const data = await response.json();
                alert(`API Test: ${data.success ? 'SUCCESS' : 'FAILED'}\nSupported formats: ${data.supported_extensions?.join(', ') || 'None'}`);
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                alert(`API Test FAILED: ${message}`);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Test API Connection
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'optimize', label: 'Resume Optimizer', icon: Zap },
          { id: 'ats', label: 'ATS Score', icon: BarChart3 },
          { id: 'cover', label: 'Cover Letter', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === id
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Input Mode Selection */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
        <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Text Input
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              inputMode === 'file'
                ? 'bg-white shadow-md text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            File Upload
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Resume Content
            </label>
            
            {inputMode === 'text' ? (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            ) : (
              <div>
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 h-64 flex flex-col justify-center ${
                      dragActive 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-purple-400 bg-gray-50'
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
                    <p className="text-gray-600 mb-4">
                      Supports: PDF, Word (.doc/.docx), Images (.jpg/.png), Text files
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Maximum file size: 50MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.txt,.rtf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-file-upload"
                    />
                    <label
                      htmlFor="resume-file-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-xl p-4 bg-white h-64 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(uploadedFile.name)}
                        <div>
                          <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {resumeText && (
                      <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-700">
                          <strong>Extracted text preview:</strong>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {resumeText.substring(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {supportedFormats && (
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Supported formats:</strong> {(supportedFormats?.formats ? Object.values(supportedFormats.formats) : []).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {(activeTab === 'ats' || activeTab === 'cover') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {activeTab === 'cover' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          {activeTab === 'optimize' && (
            <button
              onClick={optimizeResume}
              disabled={isOptimizing || (inputMode === 'text' && !resumeText.trim()) || (inputMode === 'file' && !uploadedFile)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isOptimizing ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Zap className="h-5 w-5 mr-2" />
              )}
              {isOptimizing ? 
                (inputMode === 'file' ? 'Processing File...' : 'Optimizing...') : 
                (inputMode === 'file' ? 'Process & Optimize File' : 'Optimize Resume')
              }
            </button>
          )}

          {activeTab === 'ats' && (
            <button
              onClick={calculateATSScore}
              disabled={isCalculatingATS}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isCalculatingATS ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-5 w-5 mr-2" />
              )}
              {isCalculatingATS ? 'Analyzing...' : 'Calculate ATS Score'}
            </button>
          )}

          {activeTab === 'cover' && (
            <button
              onClick={generateCoverLetter}
              disabled={isGeneratingCoverLetter}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isGeneratingCoverLetter ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <FileText className="h-5 w-5 mr-2" />
              )}
              {isGeneratingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      {activeTab === 'optimize' && optimization && (
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">ATS Compatibility Score</h3>
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(optimization.ats_score)}`}>
                {optimization.ats_score}/100
              </div>
            </div>
          </div>

          {/* Optimized Resume */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Optimized Resume</h3>
              <button
                onClick={() => copyToClipboard(optimization.optimized_resume)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">
                {optimization.optimized_resume}
              </pre>
            </div>
          </div>

          {/* Key Improvements */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Improvements</h3>
            <div className="space-y-4">
              {(optimization.key_improvements ?? []).map((improvement, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">{improvement.section}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Original:</p>
                      <p className="bg-red-50 p-2 rounded text-red-800">{improvement.original}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Optimized:</p>
                      <p className="bg-green-50 p-2 rounded text-green-800">{improvement.optimized}</p>
                    </div>
                  </div>
                  <p className="text-blue-600 text-sm mt-2 italic">{improvement.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATS Analysis Results */}
      {activeTab === 'ats' && atsAnalysis && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">ATS Analysis Results</h3>
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(atsAnalysis.ats_score ?? 0)}`}>
                {(atsAnalysis.ats_score ?? 0)}/100
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(atsAnalysis.score_breakdown ?? {}).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(Number(value) || 0)}`}>
                    {Number(value) || 0}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pass Probability */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">ATS Pass Probability</span>
                <span className="text-2xl font-bold text-purple-600">
                  {(atsAnalysis.pass_probability ?? 0)}%
                </span>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Matched Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {(atsAnalysis.keyword_analysis?.matched_keywords ?? []).map((keyword, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {(atsAnalysis.keyword_analysis?.missing_keywords ?? []).map((keyword, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Results */}
      {activeTab === 'cover' && coverLetter && (
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Generated Cover Letter</h3>
            <button
              onClick={() => copyToClipboard(coverLetter.cover_letter)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {coverLetter.cover_letter}
            </pre>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Key Highlights</h4>
              <ul className="space-y-2">
                {(coverLetter.key_highlights ?? []).map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">Personalization Elements</h4>
              <ul className="space-y-2">
                {(coverLetter.personalization_elements ?? []).map((element, index) => (
                  <li key={index} className="flex items-start">
                    <Award className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{element}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;