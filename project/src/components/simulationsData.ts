import { BookOpen, Timer, BarChart3, Users } from 'lucide-react';
import type { Simulation } from '../types/simulation';

// NOTE: This file contains mock simulation data that is no longer used.
// Simulations are now generated dynamically based on resume analysis via the /generate-simulations endpoint.
// This file is kept for reference and fallback purposes only.

const enhancedSimulations: Simulation[] = [
  {
    id: '1',
    title: 'Customer Churn Prediction',
    type: 'Machine Learning',
    difficulty: 'Advanced',
    description: 'Predict customer churn for a telecom dataset using machine learning techniques and business insights.',
    skills: ['Python', 'Machine Learning', 'Data Analysis', 'Statistics', 'Business Intelligence', 'SQL', 'Data Visualization'],
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
    skills: ['Tableau', 'Data Visualization', 'SQL', 'Business Analytics', 'Dashboard Design', 'Excel', 'Power BI'],
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
    skills: ['Python', 'Pandas', 'Data Cleaning', 'Data Quality', 'ETL', 'SQL', 'Excel'],
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
  },
  {
    id: '4',
    title: 'SQL Fundamentals Practice',
    type: 'Database',
    difficulty: 'Beginner',
    description: 'Master SQL fundamentals with hands-on practice on real datasets.',
    skills: ['SQL', 'Database', 'MySQL', 'PostgreSQL', 'Data Querying'],
    category: 'Database',
    completedModes: [],
    overallProgress: 0,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Learn SQL basics with step-by-step tutorials and examples.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '45 min',
        difficulty: 'Easy',
        unlocked: true,
        completed: false,
        badge: 'SQL Beginner'
      },
      {
        id: 'challenge',
        name: 'Challenge Mode',
        description: 'Solve complex SQL queries under time pressure.',
        icon: Timer,
        xpReward: 300,
        estimatedTime: '30 min',
        difficulty: 'Medium',
        unlocked: false,
        completed: false,
        badge: 'Query Master'
      }
    ]
  },
  {
    id: '5',
    title: 'Excel Advanced Analytics',
    type: 'Spreadsheet',
    difficulty: 'Intermediate',
    description: 'Master advanced Excel functions for data analysis and business intelligence.',
    skills: ['Excel', 'VBA', 'Pivot Tables', 'Data Analysis', 'Business Intelligence'],
    category: 'Spreadsheet',
    completedModes: [],
    overallProgress: 0,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Learn advanced Excel techniques with guided tutorials.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '60 min',
        difficulty: 'Easy',
        unlocked: true,
        completed: false,
        badge: 'Excel Expert'
      },
      {
        id: 'project',
        name: 'Project Mode',
        description: 'Create comprehensive Excel solutions for business scenarios.',
        icon: BarChart3,
        xpReward: 500,
        estimatedTime: '2 hours',
        difficulty: 'Hard',
        unlocked: false,
        completed: false,
        badge: 'Excel Architect'
      }
    ]
  },
  {
    id: '6',
    title: 'Statistical Analysis Workshop',
    type: 'Statistics',
    difficulty: 'Intermediate',
    description: 'Apply statistical methods to real-world data analysis problems.',
    skills: ['Statistics', 'R', 'Python', 'Hypothesis Testing', 'Regression Analysis'],
    category: 'Statistics',
    completedModes: [],
    overallProgress: 0,
    modes: [
      {
        id: 'guided',
        name: 'Guided Mode',
        description: 'Learn statistical concepts with practical examples.',
        icon: BookOpen,
        xpReward: 100,
        estimatedTime: '90 min',
        difficulty: 'Medium',
        unlocked: true,
        completed: false,
        badge: 'Statistician'
      },
      {
        id: 'challenge',
        name: 'Challenge Mode',
        description: 'Solve statistical problems under time constraints.',
        icon: Timer,
        xpReward: 300,
        estimatedTime: '45 min',
        difficulty: 'Hard',
        unlocked: false,
        completed: false,
        badge: 'Stats Master'
      }
    ]
  }
];

export { enhancedSimulations };

