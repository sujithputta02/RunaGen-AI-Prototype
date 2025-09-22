import React, { useState } from 'react';
import { BarChart3, Play, BookOpen, Target, Clock } from 'lucide-react';

interface SkillGap {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  priority: 'high' | 'medium' | 'low';
  gap: number;
}

interface SkillRoadmap {
  skill: string;
  current_level: number;
  target_level: number;
  gap_points: number;
  priority: string;
  roadmap: {
    beginner_phase: {
      duration: string;
      topics: string[];
      projects: Array<{
        name: string;
        description: string;
        skills_developed: string[];
        timeline: string;
      }>;
      youtube_videos: Array<{
        title: string;
        topic: string;
        search_query: string;
        duration: string;
      }>;
      courses: string[];
      certifications: string[];
      practice_exercises: string[];
      assessment: string;
    };
    intermediate_phase: {
      duration: string;
      topics: string[];
      projects: Array<{
        name: string;
        description: string;
        skills_developed: string[];
        timeline: string;
      }>;
      youtube_videos: Array<{
        title: string;
        topic: string;
        search_query: string;
        duration: string;
      }>;
      courses: string[];
      certifications: string[];
      practice_exercises: string[];
      assessment: string;
    };
    advanced_phase: {
      duration: string;
      topics: string[];
      projects: Array<{
        name: string;
        description: string;
        skills_developed: string[];
        timeline: string;
      }>;
      youtube_videos: Array<{
        title: string;
        topic: string;
        search_query: string;
        duration: string;
      }>;
      courses: string[];
      certifications: string[];
      practice_exercises: string[];
      assessment: string;
    };
  };
  total_timeline: string;
  success_metrics: string[];
  learning_resources: {
    platforms: string[];
    books: string[];
    communities: string[];
    tools: string[];
  };
}

interface SkillsGapAnalysisProps {
  skills: SkillGap[];
  role?: string;
}

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({ skills, role = 'Data Analyst' }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillGap | null>(null);
  const [skillRoadmap, setSkillRoadmap] = useState<SkillRoadmap | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  const generateSkillRoadmap = async (skill: SkillGap) => {
    setIsGeneratingRoadmap(true);
    try {
      const response = await fetch(`${API_BASE}/generate-skill-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: skill.skill,
          currentLevel: skill.currentLevel,
          targetLevel: skill.targetLevel,
          priority: skill.priority,
          role: role
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSkillRoadmap(data.roadmap);
        setShowRoadmapModal(true);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'high priority';
      case 'medium':
        return 'medium priority';
      case 'low':
        return 'low priority';
      default:
        return priority;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
      <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
        <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
        AI Generated Roadmap
      </h2>
      
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 p-4 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-gray-900 text-lg">{skill.skill}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(skill.priority)}`}>
                  {getPriorityLabel(skill.priority)}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">
                  {skill.currentLevel}% / {skill.targetLevel}% required
                </span>
                <span className="text-sm text-gray-500">
                  Gap: {skill.gap} points to reach target level
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 relative">
                {/* Current Level (Blue) */}
                <div 
                  className="bg-blue-500 h-3 rounded-l-full"
                  style={{ width: `${skill.currentLevel}%` }}
                ></div>
                {/* Gap (Orange) */}
                <div 
                  className="bg-orange-500 h-3 absolute top-0"
                  style={{ 
                    left: `${skill.currentLevel}%`, 
                    width: `${skill.targetLevel - skill.currentLevel}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Generate Roadmap Button */}
            <div className="flex justify-end">
              <button
                onClick={() => generateSkillRoadmap(skill)}
                disabled={isGeneratingRoadmap}
                className="px-4 py-2 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 backdrop-blur-sm border border-white/20"
              >
                {isGeneratingRoadmap ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    <span>Generate Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skill Roadmap Modal */}
      {showRoadmapModal && skillRoadmap && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {skillRoadmap.skill} Learning Roadmap
              </h2>
              <button 
                onClick={() => setShowRoadmapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Roadmap Overview */}
              <div className="bg-gradient-to-r from-slate-50 via-teal-50/50 to-cyan-50/50 rounded-xl p-4 mb-6 backdrop-blur-sm border border-white/30">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{skillRoadmap.current_level}%</div>
                    <div className="text-sm text-gray-600">Current Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{skillRoadmap.target_level}%</div>
                    <div className="text-sm text-gray-600">Target Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{skillRoadmap.gap_points}</div>
                    <div className="text-sm text-gray-600">Gap Points</div>
                  </div>
                </div>
              </div>

              {/* Learning Phases */}
              <div className="space-y-6">
                {/* Beginner Phase */}
                <div className="border border-white/40 rounded-xl p-4 bg-white/60 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      Beginner Phase
                    </h3>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {skillRoadmap.roadmap.beginner_phase.duration}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Topics to Cover:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {skillRoadmap.roadmap.beginner_phase.topics.map((topic, index) => (
                          <li key={index}>• {topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Projects:</h4>
                      {skillRoadmap.roadmap.beginner_phase.projects.map((project, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-2">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.timeline}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Learning Resources:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">YouTube Videos:</div>
                        {skillRoadmap.roadmap.beginner_phase.youtube_videos.map((video, index) => (
                          <div key={index} className="text-xs text-gray-500 mb-1">
                            • {video.title} ({video.duration})
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Courses:</div>
                        {skillRoadmap.roadmap.beginner_phase.courses.map((course, index) => (
                          <div key={index} className="text-xs text-gray-500 mb-1">
                            • {course}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intermediate Phase */}
                <div className="border border-white/40 rounded-xl p-4 bg-white/60 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      Intermediate Phase
                    </h3>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {skillRoadmap.roadmap.intermediate_phase.duration}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Topics to Cover:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {skillRoadmap.roadmap.intermediate_phase.topics.map((topic, index) => (
                          <li key={index}>• {topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Projects:</h4>
                      {skillRoadmap.roadmap.intermediate_phase.projects.map((project, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-2">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.timeline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Advanced Phase */}
                <div className="border border-white/40 rounded-xl p-4 bg-white/60 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      Advanced Phase
                    </h3>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {skillRoadmap.roadmap.advanced_phase.duration}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Topics to Cover:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {skillRoadmap.roadmap.advanced_phase.topics.map((topic, index) => (
                          <li key={index}>• {topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Projects:</h4>
                      {skillRoadmap.roadmap.advanced_phase.projects.map((project, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-2">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.timeline}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="mt-6 bg-slate-50/80 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <h4 className="font-medium text-gray-800 mb-3">Success Metrics:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {skillRoadmap.success_metrics.map((metric, index) => (
                    <li key={index} className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-500" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsGapAnalysis;
