import React, { useState } from 'react';
import { X, Play, BookOpen, Award, ExternalLink, Youtube } from 'lucide-react';

interface SkillLearningModalProps {
  skill: {
    skill: string;
    gap_level: string;
    timeline: string;
    priority: string;
    youtube_videos: Array<{
      title: string;
      topic: string;
      search_query: string;
      url?: string;
      videoId?: string;
      thumbnail?: string;
      duration?: string;
      viewCount?: number;
      channelTitle?: string;
      publishedAt?: string;
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
  };
  isOpen: boolean;
  onClose: () => void;
}

const SkillLearningModal: React.FC<SkillLearningModalProps> = ({ skill, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('videos');

  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getGapLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'important': return 'bg-yellow-500';
      case 'nice_to_have': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getGapLevelColor(skill.gap_level)}`}></div>
            <h2 className="text-2xl font-bold text-gray-900">{skill.skill}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(skill.priority)}`}>
              {skill.priority} priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Timeline Info */}
        <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Timeline:</span>
              <span className="font-semibold text-gray-900">{skill.timeline}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Gap Level:</span>
              <span className="font-semibold text-gray-900 capitalize">{skill.gap_level.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'videos', label: 'Learning Videos', icon: Play },
            { id: 'exams', label: 'Exam Preparation', icon: BookOpen },
            { id: 'projects', label: 'Practice Projects', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-slate-800 border-b-2 border-teal-500 bg-teal-50/80 backdrop-blur-sm'
                    : 'text-gray-600 hover:text-slate-800 hover:bg-slate-50/80 hover:backdrop-blur-sm'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Youtube className="h-5 w-5 mr-2 text-red-600" />
                YouTube Learning Videos
              </h3>
              
              {skill.youtube_videos && skill.youtube_videos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {skill.youtube_videos.map((video, index) => {
                    console.log('Rendering video:', video);
                    return (
                    <div key={index} className="space-y-3">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/40">
                        <h4 className="font-semibold text-gray-900 mb-2">{video.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{video.topic}</p>
                        
                        {/* YouTube Video Display */}
                        {video.url ? (
                          <div className="space-y-3">
                            {/* Video Thumbnail with Play Button */}
                            <div className="relative w-full h-48 bg-slate-200 rounded-xl overflow-hidden group cursor-pointer shadow-lg"
                                 onClick={() => {
                                   console.log('Opening YouTube video:', video.url);
                                   window.open(video.url, '_blank');
                                 }}>
                              {video.thumbnail ? (
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('Thumbnail failed to load, using fallback');
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : null}
                              {/* Fallback YouTube icon if no thumbnail */}
                              {!video.thumbnail && (
                                <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                  <Youtube className="h-16 w-16 text-white" />
                                </div>
                              )}
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all">
                                <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
                                  <Play className="h-6 w-6 text-white ml-1" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Video Details */}
                            <div className="space-y-2">
                              {video.duration && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <span className="bg-gray-200 px-2 py-1 rounded">Duration: {video.duration}</span>
                                </div>
                              )}
                              {video.channelTitle && (
                                <div className="text-xs text-gray-600">
                                  Channel: <span className="font-medium">{video.channelTitle}</span>
                                </div>
                              )}
                              {video.viewCount && (
                                <div className="text-xs text-gray-500">
                                  Views: {video.viewCount.toLocaleString()}
                                </div>
                              )}
                        </div>
                        
                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-xs text-gray-500">Search: {video.search_query}</span>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>Watch on YouTube</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          /* Fallback for videos without URLs */
                          <div className="space-y-3">
                            <div className="relative w-full h-48 bg-slate-200 rounded-xl overflow-hidden shadow-lg">
                              <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                                <Youtube className="h-16 w-16 text-white" />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Search: {video.search_query}</span>
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.search_query)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                                <span>Search on YouTube</span>
                          </a>
                        </div>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No videos available for this skill</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Exam Preparation
              </h3>
              
              {/* Certifications */}
              {skill.exam_preparation.certifications && skill.exam_preparation.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">📜 Certifications to Pursue</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skill.exam_preparation.certifications.map((cert, index) => (
                      <div key={index} className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/60 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-900">{cert}</span>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                            Study
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice Tests */}
              {skill.exam_preparation.practice_tests && skill.exam_preparation.practice_tests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">📝 Practice Tests</h4>
                  <div className="space-y-2">
                    {skill.exam_preparation.practice_tests.map((test, index) => (
                      <div key={index} className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200/60 rounded-xl flex items-center justify-between shadow-lg">
                        <span className="text-green-900">{test}</span>
                        <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors">
                          Take Test
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Materials */}
              {skill.exam_preparation.study_materials && skill.exam_preparation.study_materials.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">📚 Study Materials</h4>
                  <div className="space-y-2">
                    {skill.exam_preparation.study_materials.map((material, index) => (
                      <div key={index} className="p-3 bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 rounded-xl flex items-center justify-between shadow-lg">
                        <span className="text-purple-900">{material}</span>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                          Access
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Award className="h-5 w-5 mr-2 text-green-600" />
                Practice Projects
              </h3>
              
              {skill.projects && skill.projects.length > 0 ? (
                <div className="space-y-4">
                  {skill.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-green-50/80 backdrop-blur-sm border border-green-200/60 rounded-xl shadow-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-green-900 text-lg">{project.name}</h4>
                          <p className="text-sm text-green-700 mt-1">{project.description}</p>
                        </div>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {project.timeline}
                        </span>
                      </div>
                      
                      {project.skills_developed && project.skills_developed.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-green-800 mb-2">Skills Developed:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.skills_developed.map((skillName, i) => (
                              <span key={i} className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                {skillName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Start Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects available for this skill</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 backdrop-blur-sm border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Complete this skill to unlock the next stage
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button className="px-6 py-2 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/20">
              Mark as Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillLearningModal;

