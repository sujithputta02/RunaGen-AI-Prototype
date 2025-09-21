import React, { useState, useEffect, useRef } from 'react';
import { Star, Target, Zap, Trophy, Compass, Brain, Users, Code, Database, Shield, TrendingUp } from 'lucide-react';

const Badge3D: React.FC<{ 
  badge: any, 
  isEarned: boolean, 
  isAnimating?: boolean, 
  onClick?: () => void, 
  size?: 'sm'|'md'|'lg'|'xl',
  progress?: number 
}> = ({
  badge,
  isEarned,
  isAnimating,
  onClick,
  size = 'md',
  progress = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const sizeClasses: Record<string, string> = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    xl: 'w-44 h-44'
  };

  const iconSizes: Record<string, number> = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48
  };

  useEffect(() => {
    if (isAnimating && badgeRef.current) {
      badgeRef.current.style.animation = 'earnBadge 2s ease-out';
    }
  }, [isAnimating]);

  const handleClick = () => {
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 1000);
    onClick && onClick();
  };

  const getBadgeGradient = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-400 via-blue-500 to-blue-600',
      purple: 'from-purple-400 via-purple-500 to-purple-600',
      green: 'from-green-400 via-green-500 to-green-600',
      orange: 'from-orange-400 via-orange-500 to-orange-600',
      pink: 'from-pink-400 via-pink-500 to-pink-600',
      indigo: 'from-indigo-400 via-indigo-500 to-indigo-600',
      red: 'from-red-400 via-red-500 to-red-600',
      yellow: 'from-yellow-400 via-yellow-500 to-yellow-600',
      teal: 'from-teal-400 via-teal-500 to-teal-600',
      cyan: 'from-cyan-400 via-cyan-500 to-cyan-600'
    };
    return gradients[color] || gradients.blue;
  };

  const getShadowColor = (color: string) => {
    const shadows: Record<string, string> = {
      blue: 'shadow-blue-500/50',
      purple: 'shadow-purple-500/50',
      green: 'shadow-green-500/50',
      orange: 'shadow-orange-500/50',
      pink: 'shadow-pink-500/50',
      indigo: 'shadow-indigo-500/50',
      red: 'shadow-red-500/50',
      yellow: 'shadow-yellow-500/50',
      teal: 'shadow-teal-500/50',
      cyan: 'shadow-cyan-500/50'
    };
    return shadows[color] || shadows.blue;
  };

  const radius = size === 'xl' ? 85 : size === 'lg' ? 70 : size === 'md' ? 55 : 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const Icon = badge.icon;

  return (
    <div className="relative group">
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className={`${sizeClasses[size]} transform -rotate-90`}
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={isEarned ? `url(#gradient-${badge.color})` : 'rgba(255,255,255,0.2)'}
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id={`gradient-${badge.color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={badge.color === 'blue' ? '#60a5fa' : 
                badge.color === 'purple' ? '#a78bfa' :
                badge.color === 'green' ? '#4ade80' :
                badge.color === 'orange' ? '#fb923c' :
                badge.color === 'pink' ? '#f472b6' :
                badge.color === 'indigo' ? '#818cf8' :
                badge.color === 'red' ? '#f87171' :
                badge.color === 'yellow' ? '#facc15' :
                badge.color === 'teal' ? '#2dd4bf' : '#22d3ee'} />
              <stop offset="100%" stopColor={badge.color === 'blue' ? '#3b82f6' : 
                badge.color === 'purple' ? '#8b5cf6' :
                badge.color === 'green' ? '#22c55e' :
                badge.color === 'orange' ? '#f97316' :
                badge.color === 'pink' ? '#ec4899' :
                badge.color === 'indigo' ? '#6366f1' :
                badge.color === 'red' ? '#ef4444' :
                badge.color === 'yellow' ? '#eab308' :
                badge.color === 'teal' ? '#14b8a6' : '#06b6d4'} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div
        ref={badgeRef}
        className={`
          ${sizeClasses[size]} 
          relative cursor-pointer transition-all duration-500 ease-out
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isAnimating ? 'animate-bounce' : ''}
          ${isFlipping ? 'animate-flip' : ''}
          transform-style-preserve-3d
        `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          absolute inset-2 rounded-full 
          ${isEarned 
            ? `bg-gradient-to-br ${getBadgeGradient(badge.color)} ${getShadowColor(badge.color)} shadow-2xl` 
            : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 shadow-xl shadow-gray-500/30'
          }
          ${isHovered ? 'shadow-3xl' : ''}
          transform transition-all duration-300
          backface-hidden
        `}>
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-black/20">
            <div className="absolute inset-1 rounded-full bg-gradient-to-t from-black/30 via-transparent to-white/20">
              <div className="flex items-center justify-center h-full relative z-10">
                <Icon 
                  size={iconSizes[size]} 
                  className={`${
                    isEarned ? 'text-white drop-shadow-lg' : 'text-gray-400'
                  } transition-all duration-300 ${isHovered ? 'scale-110 drop-shadow-2xl' : 'scale-100'}`}
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
            <div className="absolute inset-0.5 rounded-full border border-black/20"></div>
          </div>
          {!isEarned && (
            <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white">Locked</div>
            </div>
          )}
          {isEarned && (
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className={`
                absolute -inset-10 opacity-0 group-hover:opacity-100
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                transform -skew-x-12 transition-all duration-700
                ${isHovered ? 'translate-x-full' : '-translate-x-full'}
              `} />
            </div>
          )}
        </div>
        <div className={`
          absolute inset-2 rounded-full 
          bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-2xl
          transform rotateY-180 backface-hidden
          flex items-center justify-center
        `}>
          <div className="text-center text-white">
            <div className="text-lg font-bold">{Math.round(progress)}%</div>
            <div className="text-xs opacity-70">Complete</div>
          </div>
        </div>
        {isEarned && (
          <div className={`
            absolute inset-0 rounded-full 
            bg-gradient-to-br ${getBadgeGradient(badge.color)}
            opacity-0 group-hover:opacity-60
            scale-125 blur-xl transition-all duration-500
            ${isHovered ? 'animate-pulse' : ''}
          `} />
        )}
        {isEarned && (isAnimating || isHovered) && (
          <>
            <div className="absolute -top-3 -right-3 w-4 h-4 bg-yellow-300 rounded-full animate-ping opacity-75" />
            <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-yellow-200 rounded-full animate-ping animation-delay-300 opacity-75" />
            <div className="absolute -top-2 left-1/2 w-2 h-2 bg-white rounded-full animate-ping animation-delay-500 opacity-75" />
            <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-yellow-100 rounded-full animate-ping animation-delay-700 opacity-75" />
          </>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-gray-400 text-center font-medium">
            {badge.topMetric || 'Level'}
          </div>
        </div>
        <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 -rotate-90">
          <div className="text-xs text-gray-400 text-center">
            {badge.leftMetric || 'XP'}
          </div>
        </div>
        <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 rotate-90">
          <div className="text-xs text-gray-400 text-center">
            {badge.rightMetric || 'Rank'}
          </div>
        </div>
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="text-xs text-gray-300 text-center">
            {badge.bottomMetric || 'Progress'}
          </div>
        </div>
      </div>

      <div className={`
        absolute -bottom-20 left-1/2 transform -translate-x-1/2
        bg-black/90 text-white text-sm px-3 py-1.5 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        whitespace-nowrap z-20 border border-white/10
      `}>
        <div className="font-medium">{badge.name}</div>
        <div className="text-xs text-gray-300">{isEarned ? 'Unlocked' : 'Locked'}</div>
      </div>

      <style>{`
        @keyframes earnBadge { 0% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.3) rotate(-10deg); } 50% { transform: scale(1.5) rotate(10deg); } 75% { transform: scale(1.2) rotate(-5deg); } 100% { transform: scale(1) rotate(0deg); } }
        @keyframes flip { 0% { transform: rotateY(0deg) scale(1); } 50% { transform: rotateY(90deg) scale(1.1); } 100% { transform: rotateY(180deg) scale(1); } }
        .animate-flip { animation: flip 1s ease-in-out; }
        .backface-hidden { backface-visibility: hidden; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotateY-180 { transform: rotateY(180deg); }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
};

const BadgeShowcase: React.FC<{ embedded?: boolean }> = ({ embedded = true }) => {
  const [earnedBadges] = useState<Set<string>>(new Set(['pathfinder', 'skill-explorer']));
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [badgeProgress] = useState<Record<string, number>>({
    'pathfinder': 100,
    'skill-explorer': 100,
    'consistency-champ': 60,
    'career-simulator-pro': 33,
    'mentor-master': 80,
    'peer-supporter': 45,
    'code-warrior': 25,
    'data-wizard': 15,
    'security-guardian': 0,
    'career-champion': 10
  });

  const badges = [
    { id: 'pathfinder', name: 'Pathfinder', description: 'Completed personality test and discovered your career direction', requirement: 'Complete career assessment', icon: Compass, color: 'blue', rarity: 'common', topMetric: 'Explorer', leftMetric: '100 XP', rightMetric: 'Tier 1', bottomMetric: 'Unlocked' },
    { id: 'skill-explorer', name: 'Skill Explorer', description: 'Completed your first skill in the roadmap', requirement: 'Complete first skill', icon: Star, color: 'purple', rarity: 'common', topMetric: 'Learner', leftMetric: '150 XP', rightMetric: 'Tier 1', bottomMetric: 'Active' },
    { id: 'consistency-champ', name: 'Consistency Champion', description: 'Logged in and made progress for 7 days straight', requirement: '7 day streak', icon: Target, color: 'green', rarity: 'rare', topMetric: 'Streak', leftMetric: '4/7 days', rightMetric: 'Tier 2', bottomMetric: '60%' },
    { id: 'career-simulator-pro', name: 'Career Simulator Pro', description: 'Completed 3 different career simulations', requirement: '3 simulations', icon: Zap, color: 'orange', rarity: 'rare', topMetric: 'Simulator', leftMetric: '1/3 done', rightMetric: 'Tier 2', bottomMetric: '33%' },
    { id: 'mentor-master', name: 'Mentor Master', description: 'Received 5 AI mentor sessions and implemented feedback', requirement: '5 mentor sessions', icon: Brain, color: 'pink', rarity: 'epic', topMetric: 'Mentee', leftMetric: '4/5 done', rightMetric: 'Tier 3', bottomMetric: '80%' },
    { id: 'peer-supporter', name: 'Peer Supporter', description: 'Helped 10 peers by reviewing their resumes', requirement: 'Help 10 peers', icon: Users, color: 'indigo', rarity: 'epic', topMetric: 'Helper', leftMetric: '4/10 helped', rightMetric: 'Tier 3', bottomMetric: '45%' },
    { id: 'code-warrior', name: 'Code Warrior', description: 'Successfully completed all coding challenges', requirement: '10 code challenges', icon: Code, color: 'red', rarity: 'legendary', topMetric: 'Coder', leftMetric: '2/10 done', rightMetric: 'Tier 4', bottomMetric: '25%' },
    { id: 'data-wizard', name: 'Data Wizard', description: 'Mastered data analysis simulations and tools', requirement: 'Master data skills', icon: Database, color: 'yellow', rarity: 'legendary', topMetric: 'Analyst', leftMetric: '1/8 skills', rightMetric: 'Tier 4', bottomMetric: '15%' },
    { id: 'security-guardian', name: 'Security Guardian', description: 'Completed advanced cybersecurity challenges', requirement: 'Security mastery', icon: Shield, color: 'teal', rarity: 'legendary', topMetric: 'Guardian', leftMetric: '0/12 done', rightMetric: 'Tier 4', bottomMetric: 'Locked' },
    { id: 'career-champion', name: 'Career Champion', description: 'Ultimate achievement - completed entire career roadmap', requirement: 'Complete all goals', icon: Trophy, color: 'cyan', rarity: 'mythic', topMetric: 'Champion', leftMetric: '1/15 goals', rightMetric: 'Tier 5', bottomMetric: '10%' }
  ];

  const getBadgeGradientForColor = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'from-blue-400 via-blue-500 to-blue-600',
      purple: 'from-purple-400 via-purple-500 to-purple-600',
      green: 'from-green-400 via-green-500 to-green-600',
      orange: 'from-orange-400 via-orange-500 to-orange-600',
      pink: 'from-pink-400 via-pink-500 to-pink-600',
      indigo: 'from-indigo-400 via-indigo-500 to-indigo-600',
      red: 'from-red-400 via-red-500 to-red-600',
      yellow: 'from-yellow-400 via-yellow-500 to-yellow-600',
      teal: 'from-teal-400 via-teal-500 to-teal-600',
      cyan: 'from-cyan-400 via-cyan-500 to-cyan-600'
    };
    return gradients[color] || gradients.blue;
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
      rare: 'text-blue-400 border-blue-500/50 bg-blue-500/10',
      epic: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
      legendary: 'text-orange-400 border-orange-500/50 bg-orange-500/10',
      mythic: 'text-pink-400 border-pink-500/50 bg-pink-500/10'
    };
    return colors[rarity] || colors.common;
  };

  const today = new Date();
  const daysBack = 365;

  type DayCell = { date: Date; count: number };

  const contributionData: DayCell[] = Array.from({ length: daysBack }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (daysBack - 1 - i));
    const seed = (d.getMonth() + 1) * (d.getDate() + 3);
    const count = (seed % 7 === 0 ? 0 : (seed % 5));
    return { date: d, count };
  });

  const getColorClassForCount = (count: number): string => {
    if (count <= 0) return 'bg-gray-800 border-gray-700';
    if (count === 1) return 'bg-green-900/60 border-green-900';
    if (count === 2) return 'bg-green-800 border-green-900';
    if (count === 3) return 'bg-green-700 border-green-800';
    return 'bg-green-600 border-green-700';
  };

  const computeStreaks = () => {
    let current = 0;
    let best = 0;
    let running = 0;
    let daysActiveThisYear = 0;
    for (let i = contributionData.length - 1; i >= 0; i--) {
      const c = contributionData[i].count > 0;
      if (c) {
        running += 1;
        daysActiveThisYear += 1;
      } else {
        if (running > best) best = running;
        running = 0;
      }
      if (current === 0 && !c) {
        // still zero
      } else if (current === 0 && c) {
        current = 1;
      } else if (current > 0 && c) {
        current += 1;
      } else if (current > 0 && !c) {
        current = current;
      }
    }
    if (running > best) best = running;
    return { current, best, daysActiveThisYear };
  };

  const { current, best, daysActiveThisYear } = computeStreaks();
  
  const weekStart = new Date(today);
  weekStart.setHours(0,0,0,0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
  const contributionMap = new Map(contributionData.map(dc => [dc.date.toDateString(), dc.count]));
  const weekCounts = weekDays.map(d => contributionMap.get(d.toDateString()) || 0);

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} px-4 py-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid - Better spacing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{earnedBadges.size}</div>
            <div className="text-gray-500 text-sm">Badges Earned</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{badges.length}</div>
            <div className="text-gray-500 text-sm">Total Available</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round((earnedBadges.size / badges.length) * 100)}%</div>
            <div className="text-gray-500 text-sm">Achievement Rate</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-gray-500 text-sm">Trend</div>
          </div>
        </div>

        {/* Badges Grid - Fixed spacing and centering */}
        <div className="space-y-16 mb-12">
          {/* First row - 4 badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {badges.slice(0, 4).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center space-y-6 px-4 py-6">
                <Badge3D
                  badge={badge}
                  isEarned={earnedBadges.has(badge.id)}
                  isAnimating={false}
                  onClick={() => setSelectedBadge(badge)}
                  size="lg"
                  progress={badgeProgress[badge.id] || 0}
                />
                <div className="text-center space-y-2 max-w-[180px]">
                  <div className="text-white text-sm font-medium leading-tight">{badge.name}</div>
                  <div className={`inline-block text-xs px-3 py-1 rounded-full border ${getRarityColor(badge.rarity)} capitalize`}>
                    {badge.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row - 4 badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {badges.slice(4, 8).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center space-y-6 px-4 py-6">
                <Badge3D
                  badge={badge}
                  isEarned={earnedBadges.has(badge.id)}
                  isAnimating={false}
                  onClick={() => setSelectedBadge(badge)}
                  size="lg"
                  progress={badgeProgress[badge.id] || 0}
                />
                <div className="text-center space-y-2 max-w-[180px]">
                  <div className="text-white text-sm font-medium leading-tight">{badge.name}</div>
                  <div className={`inline-block text-xs px-3 py-1 rounded-full border ${getRarityColor(badge.rarity)} capitalize`}>
                    {badge.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Third row - 2 badges centered */}
          <div className="flex justify-center gap-16">
            {badges.slice(8).map((badge) => (
              <div key={badge.id} className="flex flex-col items-center space-y-6 px-4 py-6">
                <Badge3D
                  badge={badge}
                  isEarned={earnedBadges.has(badge.id)}
                  isAnimating={false}
                  onClick={() => setSelectedBadge(badge)}
                  size="lg"
                  progress={badgeProgress[badge.id] || 0}
                />
                <div className="text-center space-y-2 max-w-[180px]">
                  <div className="text-white text-sm font-medium leading-tight">{badge.name}</div>
                  <div className={`inline-block text-xs px-3 py-1 rounded-full border ${getRarityColor(badge.rarity)} capitalize`}>
                    {badge.rarity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Streak + Contribution Grid */}
        <div className="mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Streak summary */}
            <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Current Streak</div>
                  <div className="text-3xl font-bold text-gray-900">{current} days</div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <div className="font-medium text-gray-700 mb-1">Best</div>
                  <div className="text-lg font-semibold text-green-700">{best} days</div>
                </div>
              </div>
              
              {/* Weekly row */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                    <div key={d} className="w-8 text-center">{d}</div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {weekCounts.map((c, i) => (
                    <div key={i} className={`w-8 h-6 rounded-md border ${getColorClassForCount(c)}`} title={`${weekDays[i].toDateString()} • ${c} activities`} />
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">This week</div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Active days</div>
                  <div className="text-lg font-semibold text-gray-900">{daysActiveThisYear}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Badges</div>
                  <div className="text-lg font-semibold text-gray-900">{earnedBadges.size}</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Rate</div>
                  <div className="text-lg font-semibold text-gray-900">{Math.round((earnedBadges.size / badges.length) * 100)}%</div>
                </div>
              </div>
            </div>

            {/* Contribution grid */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-200 font-medium">Last 12 months</div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>Less</span>
                    <span className="w-3 h-3 rounded-sm border border-slate-700 bg-slate-800" />
                    <span className="w-3 h-3 rounded-sm border border-green-900 bg-green-900/60" />
                    <span className="w-3 h-3 rounded-sm border border-green-900 bg-green-800" />
                    <span className="w-3 h-3 rounded-sm border border-green-800 bg-green-700" />
                    <span className="w-3 h-3 rounded-sm border border-green-700 bg-green-600" />
                    <span>More</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {/* Month labels row */}
                  <div className="pl-6 flex text-[10px] text-slate-300 mb-1 select-none">
                    {(() => {
                      const end = new Date(today);
                      end.setHours(0,0,0,0);
                      const start = new Date(end);
                      start.setDate(end.getDate() - (52 * 7 + end.getDay()));
                      const monthLabels: React.ReactNode[] = [];
                      for (let c = 0; c < 53; c++) {
                        const colDate = new Date(start);
                        colDate.setDate(start.getDate() + c * 7);
                        const prevColDate = new Date(start);
                        prevColDate.setDate(start.getDate() + (c - 1) * 7);
                        const show = c === 0 || colDate.getMonth() !== prevColDate.getMonth();
                        monthLabels.push(
                          <div key={c} className="w-[14px] mr-[2px] text-center">
                            {show ? colDate.toLocaleString(undefined, { month: 'short' }) : ''}
                          </div>
                        );
                      }
                      return monthLabels;
                    })()}
                  </div>
                  
                  <div className="flex">
                    {/* Weekday labels */}
                    <div className="flex flex-col mr-2 text-[10px] text-slate-300 select-none">
                      {['Sun','Tue','Thu','Sat'].map((d, i) => (
                        <div key={i} className={`h-[14px] leading-[14px] ${i===3 ? '' : 'mb-0.5'}`}>{d}</div>
                      ))}
                    </div>
                    
                    {/* Grid */}
                    <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(53, 14px)` }}>
                      {(() => {
                        const end = new Date(today); end.setHours(0,0,0,0);
                        const start = new Date(end); start.setDate(end.getDate() - (52 * 7 + end.getDay()));
                        const cells: React.ReactNode[] = [];
                        for (let col = 0; col < 53; col++) {
                          const colCells: React.ReactNode[] = [];
                          for (let row = 0; row < 7; row++) {
                            const cellDate = new Date(start);
                            cellDate.setDate(start.getDate() + col * 7 + row);
                            const cnt = contributionMap.get(cellDate.toDateString()) || 0;
                            const color = getColorClassForCount(cnt);
                            colCells.push(
                              <div key={row} title={`${cellDate.toDateString()} • ${cnt} activities`} className={`w-3.5 h-3.5 rounded-[3px] border ${color} ${row===6 ? '' : 'mb-0.5'}`} />
                            );
                          }
                          cells.push(<div key={col} className="grid gap-0.5" style={{ gridTemplateRows: `repeat(7, 14px)` }}>{colCells}</div>);
                        }
                        return cells;
                      })()}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-400">Activity heatmap based on your recent actions.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Detail Modal */}
        {selectedBadge && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full relative border border-gray-200 shadow-2xl">
              <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">✕</button>
              
              <div className="text-center">
                <div className="mb-8 flex justify-center">
                  <Badge3D badge={selectedBadge} isEarned={earnedBadges.has(selectedBadge.id)} size="xl" progress={badgeProgress[selectedBadge.id] || 0} />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{selectedBadge.name}</h3>
                
                <div className={`inline-block px-4 py-2 rounded-full border ${getRarityColor(selectedBadge.rarity)} capitalize mb-6 text-sm font-medium`}> 
                  {selectedBadge.rarity} Badge
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">{selectedBadge.description}</p>
                
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{badgeProgress[selectedBadge.id] || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`bg-gradient-to-r ${getBadgeGradientForColor(selectedBadge.color)} h-3 rounded-full transition-all duration-1000`} style={{ width: `${badgeProgress[selectedBadge.id] || 0}%` }} />
                  </div>
                </div>
                
                {earnedBadges.has(selectedBadge.id) ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-green-700 font-medium text-lg">🏆 Achievement Unlocked!</div>
                    <div className="text-green-600 text-sm mt-2">Badge earned and ready to showcase</div>
                  </div>
                ) : (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-blue-800 font-medium mb-2">📋 Requirement:</div>
                    <div className="text-blue-700 text-sm">{selectedBadge.requirement}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeShowcase;