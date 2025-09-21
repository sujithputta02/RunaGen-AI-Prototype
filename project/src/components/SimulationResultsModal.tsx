import React from 'react';
import { 
  X, Trophy, Clock, Target, Award, CheckCircle, 
  Star, TrendingUp, BarChart3, Users, BookOpen,
  Timer, Zap, Brain, FileText
} from 'lucide-react';

interface SimulationResult {
  modeId: string;
  modeName: string;
  score: number;
  timeSpent: string;
  completedAt: string;
  xpEarned: number;
  badgesEarned: string[];
  feedback: string;
  improvements: string[];
}

interface SimulationResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationId: string;
  simulationTitle: string;
  results: SimulationResult[];
}

const SimulationResultsModal: React.FC<SimulationResultsModalProps> = ({
  isOpen,
  onClose,
  simulationId,
  simulationTitle,
  results
}) => {
  if (!isOpen) return null;

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'guided': return BookOpen;
      case 'challenge': return Timer;
      case 'project': return BarChart3;
      case 'peer': return Users;
      default: return Target;
    }
  };

  const getModeColor = (modeId: string) => {
    switch (modeId) {
      case 'guided': return 'text-blue-600 bg-blue-100';
      case 'challenge': return 'text-orange-600 bg-orange-100';
      case 'project': return 'text-purple-600 bg-purple-100';
      case 'peer': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalXp = results.reduce((sum, result) => sum + result.xpEarned, 0);
  const averageScore = results.length > 0 ? results.reduce((sum, result) => sum + result.score, 0) / results.length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Simulation Results</h2>
              <p className="text-gray-600">{simulationTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-700">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Total XP Earned</p>
                  <p className="text-2xl font-bold text-green-600">{totalXp}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Modes Completed</p>
                  <p className="text-2xl font-bold text-purple-600">{results.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Results */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-gray-600" />
              Mode Results
            </h3>
            
            {results.map((result, index) => {
              const ModeIcon = getModeIcon(result.modeId);
              return (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getModeColor(result.modeId)}`}>
                        <ModeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{result.modeName}</h4>
                        <p className="text-sm text-gray-600">Completed on {new Date(result.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{result.timeSpent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">XP Earned</span>
                        <span className="font-semibold text-green-600">+{result.xpEarned}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Badges</span>
                        <div className="flex space-x-1">
                          {result.badgesEarned.map((badge, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {result.feedback && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <Brain className="h-4 w-4 mr-1" />
                        AI Feedback
                      </h5>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        {result.feedback}
                      </p>
                    </div>
                  )}

                  {result.improvements && result.improvements.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Areas for Improvement
                      </h5>
                      <ul className="space-y-1">
                        {result.improvements.map((improvement, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Could add functionality to retake simulation or share results
                console.log('Share results');
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Share Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationResultsModal;
