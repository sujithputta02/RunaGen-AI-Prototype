export interface SimulationMode {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  xpReward: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  unlocked: boolean;
  completed: boolean;
  badge?: string;
}

export interface Simulation {
  id: string;
  title: string;
  type: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  skills: string[];
  modes: SimulationMode[];
  completedModes: string[];
  overallProgress: number;
  category: 'Data Analysis' | 'Visualization' | 'Analytics' | 'Machine Learning';
  youtube_videos?: Array<{
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
}

