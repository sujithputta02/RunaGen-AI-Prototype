import React, { useState } from 'react';
import { 
  Play, CheckCircle, ChevronDown, Youtube, ExternalLink
} from 'lucide-react';

import type { Simulation } from '../types/simulation';
import SimulationResultsModal from './SimulationResultsModal';
import SimulationModeModal from './SimulationModeModal';

interface SimulationCardProps {
  simulation: Simulation;
  onStartMode: (simulationId: string, modeId: string) => void;
}

const SimulationCard: React.FC<SimulationCardProps> = ({ 
  simulation, 
  onStartMode
}) => {
  const [showModeModal, setShowModeModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Unlock logic: update modes' unlocked property based on completion
  const processedModes = (simulation.modes || []).map((mode, _, arr) => {
    if (mode.id === 'guided') {
      return { ...mode, unlocked: true };
    }
    if (mode.id === 'challenge') {
      const guided = arr.find(m => m.id === 'guided');
      return { ...mode, unlocked: guided?.completed || false };
    }
    if (mode.id === 'project') {
      const challenge = arr.find(m => m.id === 'challenge');
      return { ...mode, unlocked: challenge?.completed || false };
    }
    // Peer Compare: only unlocked if all previous are completed (optional for MVP)
    if (mode.id === 'peer') {
      const allPrev = arr.filter(m => m.id !== 'peer').every(m => m.completed);
      return { ...mode, unlocked: allPrev };
    }
    return { ...mode, unlocked: false };
  });


  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1.5">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">{simulation.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium ${getDifficultyColor(simulation.difficulty)}`}>
                {simulation.difficulty}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{simulation.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {simulation.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
            
            {/* YouTube Videos Section */}
            {simulation.youtube_videos && simulation.youtube_videos.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center mb-2">
                  <Youtube className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-700">Learning Videos</span>
                </div>
                <div className="space-y-2">
                  {simulation.youtube_videos.slice(0, 2).map((video, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{video.title}</h4>
                        <p className="text-xs text-gray-600 truncate">{video.topic}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {video.duration && (
                          <span className="text-xs text-gray-500">{video.duration}</span>
                        )}
                        {video.url ? (
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Watch</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No link</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-right ml-3">
            <div className="text-xs text-gray-500 mb-0.5">{simulation.category}</div>
            <div className="text-base md:text-lg font-bold text-gray-900 leading-tight">{simulation.overallProgress}%</div>
            <div className="text-[11px] text-gray-500">Complete</div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {simulation.completedModes.length > 0 && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{simulation.completedModes.length} completed</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowModeModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-slate-800 to-teal-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
          >
            <Play className="h-5 w-5" />
            <span>Choose Mode</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <SimulationModeModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        simulationId={simulation.id}
        simulationTitle={simulation.title}
        modes={processedModes}
        onStartMode={onStartMode}
      />

      {/* Results Modal */}
      <SimulationResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        simulationId={simulation.id}
        simulationTitle={simulation.title}
        results={[
          // Mock results data - in a real app, this would come from the backend
          {
            modeId: 'guided',
            modeName: 'Guided Mode',
            score: 87,
            timeSpent: '42 min',
            completedAt: new Date().toISOString(),
            xpEarned: 100,
            badgesEarned: ['Strategist'],
            feedback: 'Great job! You demonstrated strong analytical thinking and followed the guided steps effectively. Your approach to data cleaning was methodical and thorough.',
            improvements: [
              'Consider exploring more advanced pandas functions for data manipulation',
              'Try implementing custom validation functions for data quality checks',
              'Practice with larger datasets to improve performance optimization'
            ]
          },
          {
            modeId: 'challenge',
            modeName: 'Challenge Mode',
            score: 92,
            timeSpent: '28 min',
            completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            xpEarned: 300,
            badgesEarned: ['Speedster'],
            feedback: 'Excellent performance under time pressure! You completed the challenge ahead of schedule while maintaining high quality results.',
            improvements: [
              'Work on optimizing code execution time for better efficiency',
              'Practice quick debugging techniques for time-constrained scenarios'
            ]
          }
        ]}
      />
    </div>
  );
};

// NOTE: sample data moved to components/simulationsData.ts to avoid mixing with component export
/* const enhancedSimulations: Simulation[] = [
  {
    id: '1',
    title: 'Customer Churn Prediction',
    type: 'Machine Learning',
    difficulty: 'Advanced',
    description: 'Predict customer churn for a telecom dataset using machine learning techniques and business insights.',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics', 'Business Intelligence'],
    category: 'Machine Learning',
    completedModes: ['guided'],
    overallProgress: 25,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Step-by-step walkthrough with hints and explanations. Perfect for learning the fundamentals.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '45 min',
        difficulty: 'Easy',
        unlocked: true,
        completed: true,
        badge: 'Strategist'
      },
      {
        id: 'challenge',
        name: 'Challenge Mode',
        description: 'Timed task with no hints. Test your skills under pressure and compete for the best score.',
        icon: Timer,
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
        description: 'Open-ended problem solving. Submit your complete solution for AI mentor evaluation.',
        icon: BarChart3,
        xpReward: 500,
        estimatedTime: '2 hours',
        difficulty: 'Hard',
        unlocked: false,
        completed: false,
        badge: 'Innovator'
      },
      {
        id: 'peer',
        name: 'Peer Compare',
        description: 'Compare your results with anonymized peer averages and learn from the community.',
        icon: Users,
        xpReward: 150,
        estimatedTime: '15 min',
        difficulty: 'Medium',
        unlocked: false,
        completed: false,
        badge: 'Collaborator'
      }
    ]
  },
  {
    id: '2',
    title: 'Sales Dashboard Creation',
    type: 'Data Visualization',
    difficulty: 'Intermediate',
    description: 'Create an interactive sales dashboard using Tableau to visualize key business metrics.',
    skills: ['Tableau', 'Data Visualization', 'SQL', 'Business Analytics', 'Dashboard Design'],
    category: 'Visualization',
    completedModes: [],
    overallProgress: 0,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Learn dashboard creation with guided tutorials and best practices.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '60 min',
        difficulty: 'Easy',
        unlocked: true,
        completed: false,
        badge: 'Designer'
      },
      {
        id: 'challenge',
        name: 'Challenge Mode',
        description: 'Build a dashboard within time constraints and optimize for performance.',
        icon: Timer,
        xpReward: 300,
        estimatedTime: '45 min',
        difficulty: 'Medium',
        unlocked: false,
        completed: false,
        badge: 'Optimizer'
      },
      {
        id: 'project',
        name: 'Project Mode',
        description: 'Create a comprehensive dashboard solution with multiple views and interactions.',
        icon: BarChart3,
        xpReward: 500,
        estimatedTime: '3 hours',
        difficulty: 'Hard',
        unlocked: false,
        completed: false,
        badge: 'Architect'
      }
    ]
  },
  {
    id: '3',
    title: 'Data Cleaning Challenge',
    type: 'Data Analysis',
    difficulty: 'Beginner',
    description: 'Clean and prepare messy datasets for analysis using Python and pandas.',
    skills: ['Python', 'Pandas', 'Data Cleaning', 'Data Quality', 'ETL'],
    category: 'Data Analysis',
    completedModes: ['guided', 'challenge'],
    overallProgress: 67,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Learn data cleaning techniques with step-by-step instructions.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '30 min',
        difficulty: 'Easy',
        unlocked: true,
        completed: true,
        badge: 'Cleaner'
      },
      {
        id: 'challenge',
        name: 'Challenge Mode',
        description: 'Clean datasets efficiently under time pressure.',
        icon: Timer,
        xpReward: 300,
        estimatedTime: '25 min',
        difficulty: 'Medium',
        unlocked: true,
        completed: true,
        badge: 'Efficiency Expert'
      },
      {
        id: 'project',
        name: 'Project Mode',
        description: 'Handle complex data cleaning scenarios with multiple data sources.',
        icon: BarChart3,
        xpReward: 500,
        estimatedTime: '90 min',
        difficulty: 'Hard',
        unlocked: true,
        completed: false,
        badge: 'Data Master'
      }
    ]
  }
]; */

export { SimulationCard };
