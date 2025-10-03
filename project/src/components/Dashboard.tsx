import React, { useState } from 'react';
import { 
  User, Settings, Target, Trophy, BookOpen, 
  Zap, Brain, TrendingUp,
  Award, FileText, BarChart3,
  Play
} from 'lucide-react';
import ResumeUpload from './ResumeUpload';
import ResumeOptimizer from './ResumeOptimizer';
import CareerIntelligence from './CareerIntelligence';
import ProfileSettings from './ProfileSettings';
import AIMentorChat from './AIMentorChat';
import BadgeShowcase from './BadgeShowcase';
import { SimulationCard } from './SimulationCard';
// import { enhancedSimulations } from './simulationsData'; // Using dynamic simulations now
import SkillLearningModal from './SkillLearningModal';
import SkillsGapAnalysis from './SkillsGapAnalysis';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
  type: 'strategist' | 'speedster' | 'innovator' | 'collaborator' | 'designer' | 'optimizer' | 'architect' | 'cleaner' | 'efficiency' | 'master';
}


interface ResumeAnalysis {
  analysisId?: string;
  skillsFound: string[];
  skillsGap: any[];
  jobMatches: any[];
  overallScore: number;
  recommendations: string[];
  experienceLevel: string;
  careerTracks: string[];
  role?: string;
  skillsPresent?: string[];
  skillsMissing?: string[];
}

interface LearningRoadmap {
  stage_1_critical_gaps: Array<{
    skill: string;
    gap_level: string;
    timeline: string;
    priority: string;
    youtube_videos: Array<{
      title: string;
      topic: string;
      search_query: string;
    }>;
    exam_preparation: {
      certifications: string[];
      practice_tests: string[];
      study_materials: string[];
    };
    projects: Array<{
      name: string;
      description: string;
      skills_developed: string[];
      timeline: string;
    }>;
    learning_platforms: string[];
  }>;
  stage_2_important_gaps: Array<{
    skill: string;
    gap_level: string;
    timeline: string;
    priority: string;
    youtube_videos: Array<{
      title: string;
      topic: string;
      search_query: string;
    }>;
    exam_preparation: {
      certifications: string[];
      practice_tests: string[];
      study_materials: string[];
    };
    projects: Array<{
      name: string;
      description: string;
      skills_developed: string[];
      timeline: string;
    }>;
    learning_platforms: string[];
  }>;
  stage_3_nice_to_have: Array<{
    skill: string;
    gap_level: string;
    timeline: string;
    priority: string;
    youtube_videos: Array<{
      title: string;
      topic: string;
      search_query: string;
    }>;
    exam_preparation: {
      certifications: string[];
      practice_tests: string[];
      study_materials: string[];
    };
    projects: Array<{
      name: string;
      description: string;
      skills_developed: string[];
      timeline: string;
    }>;
    learning_platforms: string[];
  }>;
  learning_resources: {
    courses: string[];
    platforms: string[];
    books: string[];
    communities: string[];
  };
  estimated_timeline: string;
  success_metrics: string[];
}
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [learningRoadmap, setLearningRoadmap] = useState<LearningRoadmap | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [dynamicSimulations, setDynamicSimulations] = useState<any[]>([]);
  const [isLoadingSimulations, setIsLoadingSimulations] = useState(false);

  // Mock data based on PRD requirements
  const userData = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    careerTrack: "Data Analyst",
    level: 12,
    xp: 2840,
    xpToNext: 1160,
    profileComplete: 85,
    skillsGapScore: 72,
    personalityType: "Analytical Explorer"
  };

  const badges: Badge[] = [
    { id: '1', name: 'Pathfinder', icon: '🗺️', earned: true, description: 'Completed personality assessment', type: 'strategist' },
    { id: '2', name: 'Skill Explorer', icon: '🔍', earned: true, description: 'Analyzed skills gap', type: 'innovator' },
    { id: '3', name: 'Career Simulator Pro', icon: '🎮', earned: false, description: 'Complete 3 career simulations', type: 'master' },
    { id: '4', name: 'Resume Master', icon: '📄', earned: true, description: 'Optimized resume with AI feedback', type: 'designer' },
    { id: '5', name: 'Interview Ace', icon: '💼', earned: false, description: 'Practice 5 interview scenarios', type: 'collaborator' },
    { id: '6', name: 'Mentor Connect', icon: '🤝', earned: false, description: 'Engage with AI mentor 10 times', type: 'collaborator' }
  ];


  // Use resume analysis data if available, otherwise fallback to mock data
  const skillsGap = resumeAnalysis?.skillsGap || [
    { skill: 'Python', current: 60, required: 80, gap: 20 },
    { skill: 'SQL', current: 85, required: 90, gap: 5 },
    { skill: 'Tableau', current: 40, required: 75, gap: 35 },
    { skill: 'Statistics', current: 55, required: 80, gap: 25 }
  ];

  const recentActivity = [
    { type: 'simulation', title: 'Completed Sales Dashboard Challenge', time: '2 hours ago', points: '+150 XP' },
    { type: 'skill', title: 'Updated SQL proficiency level', time: '1 day ago', points: '+50 XP' },
    { type: 'badge', title: 'Earned Resume Master badge', time: '2 days ago', points: '+200 XP' },
    { type: 'mentor', title: 'AI mentor session completed', time: '3 days ago', points: '+75 XP' }
  ];

  const handleResumeAnalysis = async (analysis: ResumeAnalysis) => {
    console.log('Dashboard received analysis:', analysis);
    setResumeAnalysis(analysis);
    
    // Automatically generate learning roadmap when resume analysis is completed
    try {
      const response = await fetch(`${API_BASE}/generate-learning-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysis.analysisId || 'temp-id',
          role: analysis.experienceLevel || 'software-engineer',
          skillsPresent: analysis.skillsFound || [],
          skillsMissing: analysis.skillsGap?.map((s: any) => s.skill) || [],
          recommendations: analysis.recommendations || []
        }),
      });

      const data = await response.json();
      if (data.success && data.roadmap) {
        setLearningRoadmap(data.roadmap);
        console.log('Learning roadmap generated automatically:', data.roadmap);
      } else {
        console.error('Failed to generate roadmap automatically:', data.error);
      }
    } catch (error) {
      console.error('Automatic roadmap generation failed:', error);
    }
    
    // Update user data based on analysis
    // This could trigger badge awards, XP gains, etc.
  };

  const handleRoadmapGenerated = (roadmap: LearningRoadmap) => {
    console.log('Dashboard received roadmap:', roadmap);
    setLearningRoadmap(roadmap);
  };

  const handleSkillClick = (skill: any) => {
    // Redirect to simulations page with the selected skill
    setActiveTab('simulations');
    // Store the selected skill for filtering simulations
    localStorage.setItem('selectedSkill', JSON.stringify(skill));
  };

  // Fetch simulations based on resume analysis
  const fetchSimulations = async () => {
    if (!resumeAnalysis) return;
    
    setIsLoadingSimulations(true);
    try {
      const response = await fetch(`${API_BASE}/generate-simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          resumeAnalysis: resumeAnalysis,
          role: resumeAnalysis.role,
          skillsPresent: resumeAnalysis.skillsPresent || [],
          skillsMissing: resumeAnalysis.skillsMissing || []
        })
      });
      
      const data = await response.json();
      if (data.success && data.simulations) {
        setDynamicSimulations(data.simulations);
      }
    } catch (error) {
      console.error('Failed to fetch simulations:', error);
    } finally {
      setIsLoadingSimulations(false);
    }
  };

  // Fetch simulations when resume analysis is available
  React.useEffect(() => {
    if (resumeAnalysis && dynamicSimulations.length === 0) {
      fetchSimulations();
    }
  }, [resumeAnalysis]);
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Level</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.level}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Skills Gap Score</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.skillsGapScore}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                    <p className="text-2xl font-bold text-gray-900">{badges.filter(b => b.earned).length}/6</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30 hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total XP</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.xp.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Analysis Results - Only show if analysis exists */}
            {resumeAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analysis Results Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                    <FileText className="h-6 w-6 mr-2 text-green-600" />
                    Analysis Results
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-green-600">☆ {resumeAnalysis.overallScore}/100</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skills Found</span>
                      <span className="text-lg font-semibold text-gray-900">{resumeAnalysis.skillsFound.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Experience Level</span>
                      <span className="text-lg font-semibold text-gray-900">{resumeAnalysis.experienceLevel || '—'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Job Matches</span>
                      <span className="text-lg font-semibold text-gray-900">{resumeAnalysis.jobMatches.length}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations Card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                    <Brain className="h-6 w-6 mr-2 text-purple-600" />
                    AI Recommendations
                  </h2>
                  
                  <div className="space-y-3">
                    {resumeAnalysis.recommendations.length > 0 ? (
                      resumeAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <p className="text-sm text-gray-700">{recommendation}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No recommendations available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Career Roadmap */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/60">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-purple-600" />
                  AI-Generated Career Roadmap
                </h2>
                <span className="text-sm text-gray-500">
                  {learningRoadmap ? `Timeline: ${learningRoadmap.estimated_timeline}` : `${userData.careerTrack} Track`}
                </span>
              </div>
              
              {learningRoadmap ? (
                <div className="space-y-6">
                  {/* Stage 1: Critical Gaps */}
                  {learningRoadmap.stage_1_critical_gaps && learningRoadmap.stage_1_critical_gaps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Stage 1: Critical Skill Gaps (1-2 months)
                      </h3>
                      <div className="space-y-4">
                        {learningRoadmap.stage_1_critical_gaps.map((skill, index) => {
                          // Calculate progress based on skill gap (simulate some progress for demo)
                          const progress = Math.floor(Math.random() * 60) + 20; // 20-80% progress
                          const isCompleted = progress >= 100;
                          const isInProgress = progress > 0 && progress < 100;
                          const isLocked = false; // Critical skills are never locked
                          
                          return (
                            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : isInProgress ? (
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                    <div className="h-2 w-2 bg-white rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                                  <span className="text-sm text-gray-500">{skill.timeline}</span>
                                </div>
                                {!isLocked && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>

                              {isInProgress && (
                                <button 
                                  onClick={() => handleSkillClick(skill)}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stage 2: Important Gaps */}
                  {learningRoadmap.stage_2_important_gaps && learningRoadmap.stage_2_important_gaps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        Stage 2: Important Skill Gaps (3-6 months)
                      </h3>
                      <div className="space-y-4">
                        {learningRoadmap.stage_2_important_gaps.map((skill, index) => {
                          // Calculate progress - Stage 2 skills start with some progress
                          const progress = Math.floor(Math.random() * 40) + 10; // 10-50% progress
                          const isCompleted = progress >= 100;
                          const isInProgress = progress > 0 && progress < 100;
                          const isLocked = false; // Can be unlocked if Stage 1 is complete
                          
                          return (
                            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                              <div className="flex-shrink-0">
                                {isCompleted ? (
                                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                ) : isInProgress ? (
                                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                    <div className="h-2 w-2 bg-white rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                                  <span className="text-sm text-gray-500">{skill.timeline}</span>
                                </div>
                                {!isLocked && (
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>

                              {isInProgress && (
                                <button 
                                  onClick={() => handleSkillClick(skill)}
                                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stage 3: Nice-to-Have Gaps */}
                  {learningRoadmap.stage_3_nice_to_have && learningRoadmap.stage_3_nice_to_have.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Stage 3: Nice-to-Have Skills (6-12 months)
                      </h3>
                      <div className="space-y-4">
                        {learningRoadmap.stage_3_nice_to_have.map((skill, index) => {
                          // Stage 3 skills are locked until previous stages are complete
                          
                          return (
                            <div key={index} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                              <div className="flex-shrink-0">
                                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                                  <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                                  <span className="text-sm text-gray-500">{skill.timeline}</span>
                                </div>
                                {/* No progress bar for locked skills */}
                              </div>

                              {/* No button for locked skills */}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Success Metrics */}
                  {learningRoadmap.success_metrics && learningRoadmap.success_metrics.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        Success Metrics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {learningRoadmap.success_metrics.map((metric, i) => (
                          <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No personalized roadmap available</p>
                  <p className="text-sm text-gray-400">Upload and analyze your resume to generate an AI-powered career roadmap</p>
                </div>
              )}
            </div>

            {/* Skills Gap Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                Skills Gap Analysis
              </h2>
              
              {resumeAnalysis ? (
                <div className="space-y-4">
                  {skillsGap.map((skill) => (
                    <div key={skill.skill} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{skill.skill}</span>
                        <span className="text-sm text-gray-600">{skill.current}% / {skill.required}%</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-grow bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${skill.current}%` }}
                          ></div>
                        </div>
                        <div className="flex-grow bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-orange-500 h-3 rounded-full"
                            style={{ width: `${skill.required}%` }}
                          ></div>
                        </div>
                      </div>
                      {skill.gap > 0 && (
                        <p className="text-sm text-orange-600 mt-1">Gap: {skill.gap} points to reach target</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No resume analysis available</p>
                  <p className="text-sm text-gray-400">Upload your resume to see skills gap analysis</p>
                </div>
              )}
            </div>

            {/* Skills Gap Analysis Section */}
            {resumeAnalysis && (
              <SkillsGapAnalysis 
                skills={[
                  {
                    skill: 'Excel',
                    currentLevel: 14,
                    targetLevel: 98,
                    priority: 'high',
                    gap: 84
                  },
                  {
                    skill: 'Pandas',
                    currentLevel: 23,
                    targetLevel: 75,
                    priority: 'high',
                    gap: 52
                  },
                  {
                    skill: 'NumPy',
                    currentLevel: 29,
                    targetLevel: 79,
                    priority: 'medium',
                    gap: 50
                  },
                  {
                    skill: 'BigQuery',
                    currentLevel: 41,
                    targetLevel: 77,
                    priority: 'medium',
                    gap: 36
                  },
                  {
                    skill: 'Docker',
                    currentLevel: 41,
                    targetLevel: 85,
                    priority: 'low',
                    gap: 44
                  }
                ]}
                role={resumeAnalysis.experienceLevel || 'Data Analyst'}
              />
            )}
          </div>
        );

      case 'resume':
        return (
          <div className="space-y-6">
            <ResumeUpload 
              onAnalysisComplete={handleResumeAnalysis} 
              onRoadmapGenerated={handleRoadmapGenerated}
            />

            {/* Skills Gap Analysis Section */}
            {resumeAnalysis && (
              <SkillsGapAnalysis 
                skills={resumeAnalysis.skillsGap.map(skill => ({
                  skill: skill.skill,
                  currentLevel: skill.current,
                  targetLevel: skill.required,
                  priority: skill.priority,
                  gap: skill.gap
                }))}
                role={resumeAnalysis.experienceLevel || 'Data Analyst'}
              />
            )}
          </div>
        );

      case 'simulations':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                  <Play className="h-6 w-6 mr-2 text-green-600" />
                  Career Simulations
                </h2>
                {(() => {
                  const selectedSkill = localStorage.getItem('selectedSkill');
                  if (selectedSkill) {
                    const skill = JSON.parse(selectedSkill);
                    return (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-700">
                          <span className="font-medium">Selected Skill:</span> {skill.skill}
                        </p>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('selectedSkill');
                            window.location.reload();
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 mt-1"
                        >
                          Clear filter
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6">
                {(() => {
                  const selectedSkill = localStorage.getItem('selectedSkill');
                  let filteredSimulations = dynamicSimulations.length > 0 ? dynamicSimulations : [];
                  
                  if (selectedSkill && filteredSimulations.length > 0) {
                    const skill = JSON.parse(selectedSkill);
                    // Filter simulations based on the selected skill
                    filteredSimulations = filteredSimulations.filter(sim => 
                      sim.title.toLowerCase().includes(skill.skill.toLowerCase()) ||
                      sim.description.toLowerCase().includes(skill.skill.toLowerCase()) ||
                      sim.skills?.some((s: string) => s.toLowerCase().includes(skill.skill.toLowerCase()))
                    );
                  }
                  
                  if (isLoadingSimulations) {
                    return (
                      <div className="col-span-full flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Generating personalized simulations...</p>
                        </div>
                      </div>
                    );
                  }
                  
                  if (filteredSimulations.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-600 mb-4">No simulations available yet.</p>
                        <p className="text-sm text-gray-500">Complete a resume analysis to generate personalized simulations.</p>
                      </div>
                    );
                  }
                  
                  return filteredSimulations.map((sim, idx) => (
                    <div
                      key={sim.id}
                      className={
                        idx === 0 || idx === 1
                          ? 'lg:col-span-8'
                          : 'lg:col-span-8 lg:col-start-3'
                      }
                    >
                      <SimulationCard
                        simulation={sim}
                        onStartMode={(simulationId, modeId) => {
                          // Start the simulation with the selected skill context
                          const selectedSkill = localStorage.getItem('selectedSkill');
                          if (selectedSkill) {
                            const skill = JSON.parse(selectedSkill);
                            alert(`Starting ${modeId} for ${skill.skill} simulation ${simulationId}`);
                          } else {
                            alert(`Start ${modeId} for simulation ${simulationId}`);
                          }
                        }}
                      />
                    </div>
                  ));
                })()}
              </div>
              
              {(() => {
                const selectedSkill = localStorage.getItem('selectedSkill');
                if (selectedSkill && dynamicSimulations.length > 0) {
                  const skill = JSON.parse(selectedSkill);
                  const filteredSimulations = dynamicSimulations.filter(sim => 
                    sim.title.toLowerCase().includes(skill.skill.toLowerCase()) ||
                    sim.description.toLowerCase().includes(skill.skill.toLowerCase()) ||
                    sim.skills?.some((s: string) => s.toLowerCase().includes(skill.skill.toLowerCase()))
                  );
                  
                  if (filteredSimulations.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.573M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No simulations found</h3>
                        <p className="text-gray-500 mb-4">No simulations available for "{skill.skill}" skill.</p>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('selectedSkill');
                            window.location.reload();
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          View All Simulations
                        </button>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          </div>
        );

      case 'badges':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <Award className="h-6 w-6 mr-2 text-yellow-600" />
                Achievement Badges
              </h2>
              
              <div className="-m-6">
                <BadgeShowcase embedded />
              </div>
            </div>
          </div>
        );

      case 'mentor':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <Brain className="h-6 w-6 mr-2 text-purple-600" />
                AI Career Mentor
              </h2>
              <AIMentorChat />
            </div>
          </div>
        );

      case 'optimizer':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🎯 Hackathon Feature</h2>
                  <p className="text-purple-700">AI-Powered Resume Optimization Suite</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-gray-700">
                  <strong>New for Google Gen AI Hackathon:</strong> Advanced resume optimization with ATS scoring, 
                  keyword analysis, and AI-generated cover letters. This feature showcases cutting-edge RAG 
                  technology for personalized career enhancement.
                </p>
              </div>
            </div>
            
            <ResumeOptimizer 
              resumeText={resumeAnalysis?.skillsFound ? 
                `Skills: ${resumeAnalysis.skillsFound.join(', ')}\n\nExperience Level: ${resumeAnalysis.experienceLevel || 'Entry Level'}\n\nRecommendations: ${resumeAnalysis.recommendations?.join('. ') || 'None'}` 
                : undefined
              }
              targetRole={resumeAnalysis?.experienceLevel?.toLowerCase().replace(' ', '-') || 'software-engineer'}
              onOptimizationComplete={(result) => {
                console.log('Resume optimization completed:', result);
                // Could trigger badge earning or XP gain here
              }}
            />
          </div>
        );

      case 'intelligence':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">🧠 Hackathon Feature</h2>
                  <p className="text-blue-700">AI Career Trajectory & Market Intelligence</p>
                </div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <p className="text-gray-700">
                  <strong>Advanced AI Features:</strong> Predict your 5-year career trajectory, analyze real-time 
                  market trends, get salary insights, and receive personalized recommendations based on current 
                  industry data and AI-powered forecasting.
                </p>
              </div>
            </div>
            
            <CareerIntelligence 
              userProfile={{
                skills: resumeAnalysis?.skillsFound || ['JavaScript', 'React', 'Node.js'],
                targetRole: resumeAnalysis?.experienceLevel || 'Senior Software Engineer',
                experienceLevel: 'Mid',
                location: 'Remote'
              }}
            />
          </div>
        );

      default:
        return <div>Tab content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/50 relative overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-800 to-cyan-800 shadow-2xl border-b border-slate-700/50 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/runagen ai sv.svg" 
                alt="RunaGen AI Logo" 
                className="h-12 w-12"
              />
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg" style={{ fontFamily: 'League Spartan, sans-serif' }}>RunaGen AI</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-300 drop-shadow-sm" />
                <span className="text-sm font-medium text-white/90 tracking-wide">{userData.xp} XP</span>
              </div>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg ring-2 ring-white/20">
                  <User className="h-5 w-5 text-white drop-shadow-sm" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white tracking-wide">{userData.name}</p>
                  <p className="text-xs text-white/70 font-light">{userData.careerTrack}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6">
              {/* Profile Summary */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-gray-600">{userData.personalityType}</p>
                
                {/* Level Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Level {userData.level}</span>
                    <span className="text-sm text-gray-600">{userData.xp}/{userData.xp + userData.xpToNext}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(userData.xp / (userData.xp + userData.xpToNext)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'resume', label: 'Resume Analysis', icon: FileText },
                  { id: 'optimizer', label: '🎯 Resume Optimizer', icon: Zap },
                  { id: 'intelligence', label: '🧠 Career Intelligence', icon: TrendingUp },
                  { id: 'simulations', label: 'Simulations', icon: Play },
                  { id: 'badges', label: 'Badges', icon: Award },
                  { id: 'mentor', label: 'AI Mentor', icon: Brain }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-500 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-slate-800 to-teal-700 text-white shadow-2xl backdrop-blur-sm border border-white/20'
                          : 'text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-lg'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-900 font-medium">{activity.title}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600">{activity.time}</p>
                        <span className="text-green-600 font-medium">{activity.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Profile Settings Drawer */}
      {showSettings && (
        <ProfileSettings onClose={() => setShowSettings(false)} />
      )}

      {/* Skill Learning Modal */}
      {selectedSkill && (
        <SkillLearningModal
          skill={selectedSkill}
          isOpen={showSkillModal}
          onClose={() => {
            setShowSkillModal(false);
            setSelectedSkill(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;