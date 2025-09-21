import React, { useState, useEffect } from 'react';
import { 
  X, Play, Clock, Target, Award, CheckCircle, Lock, 
  Star, Timer, BookOpen, BarChart3, Users, ChevronDown, ChevronUp
} from 'lucide-react';

interface SimulationMode {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  estimatedTime: string;
  difficulty: string;
  unlocked: boolean;
  completed: boolean;
  badge?: string;
}

interface SimulationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationId: string;
  simulationTitle: string;
  modes: SimulationMode[];
  onStartMode: (simulationId: string, modeId: string) => void;
}

const SimulationModeModal: React.FC<SimulationModeModalProps> = ({
  isOpen,
  onClose,
  simulationId,
  simulationTitle,
  modes,
  onStartMode
}) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'guided': return BookOpen;
      case 'challenge': return Timer;
      case 'project': return BarChart3;
      case 'peer': return Users;
      default: return Play;
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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the animation duration
  };

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    onStartMode(simulationId, modeId);
    handleClose(); // Use animated close
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Slide-in Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Learning Mode</h2>
                <p className="text-gray-600">{simulationTitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {modes.map((mode) => {
                const ModeIcon = getModeIcon(mode.id);
                const isSelected = selectedMode === mode.id;
                
                return (
                  <div
                    key={mode.id}
                    onClick={() => mode.unlocked && setSelectedMode(isSelected ? null : mode.id)}
                    className={`p-6 rounded-xl border-2 transition-all duration-500 cursor-pointer ${
                      mode.completed
                        ? 'border-green-300/60 bg-green-50/80 backdrop-blur-sm shadow-lg'
                        : mode.unlocked
                        ? isSelected
                          ? 'border-teal-400/60 bg-teal-50/80 backdrop-blur-sm ring-2 ring-teal-200/60 shadow-xl'
                          : 'border-white/40 hover:border-teal-300/60 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl'
                        : 'border-white/20 bg-gray-100/60 opacity-60 backdrop-blur-sm cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getModeColor(mode.id)}`}>
                        <ModeIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{mode.name}</h3>
                          <div className="flex items-center space-x-2">
                            {mode.completed ? (
                              <span title="Completed" className="text-green-600 text-xl">✔️</span>
                            ) : !mode.unlocked ? (
                              <span title="Locked" className="text-gray-400 text-xl">🔒</span>
                            ) : null}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{mode.description}</p>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <span className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 mr-1" />
                            {mode.xpReward} XP
                          </span>
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {mode.estimatedTime}
                          </span>
                          {mode.badge && (
                            <span className="flex items-center text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded">
                              <Award className="h-3 w-3 mr-1" />
                              {mode.badge}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mode.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            mode.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {mode.difficulty}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {mode.unlocked && !mode.completed && (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedMode(isSelected ? null : mode.id); 
                              }}
                              className={`px-4 py-2 rounded-xl transition-all duration-300 text-sm border ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-slate-800 to-teal-700 text-white border-slate-700 backdrop-blur-sm' 
                                  : 'bg-white/80 text-gray-700 border-white/40 hover:border-teal-400 backdrop-blur-sm'
                              }`}
                            >
                              {isSelected ? 'Unselect' : 'Select'}
                            </button>
                          )}
                          
                          {mode.unlocked && !mode.completed && (
                            <button
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleModeSelect(mode.id); 
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium"
                            >
                              Start Mode
                            </button>
                          )}
                          
                          {mode.completed && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-green-600 font-medium">Completed!</span>
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  // This would open the results modal
                                  console.log('View results for', mode.id);
                                }}
                                className="px-4 py-2 bg-green-100/80 text-green-700 rounded-xl hover:bg-green-200/80 transition-all duration-300 text-sm backdrop-blur-sm"
                              >
                                View Results
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection Summary */}
            {selectedMode && (
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Selected Mode:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {modes.find(m => m.id === selectedMode)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => selectedMode && handleModeSelect(selectedMode)}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                  >
                    Start Selected Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationModeModal;
