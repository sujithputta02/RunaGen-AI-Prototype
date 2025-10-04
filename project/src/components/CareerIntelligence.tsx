import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, MapPin, Building2, 
  Brain, Target, Calendar, AlertTriangle,
  BarChart3, Activity,
  Sparkles, Award, RefreshCw
} from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

interface CareerTrajectory {
  career_path: Array<{
    year: number;
    role: string;
    skills_to_develop: string[];
    expected_salary_range: string;
    probability: number;
    key_milestones: string[];
    market_demand: string;
  }>;
  alternative_paths: Array<{
    path_name: string;
    roles: string[];
    timeline: string;
    success_probability: number;
  }>;
  success_probability: number;
  recommended_actions: string[];
}

interface MarketReport {
  skill_analysis: {
    skill_trends: Array<{
      skill: string;
      demand: number;
      growth: number;
      avgSalary: number;
      trend: string;
    }>;
  };
  company_insights: {
    company_trends: Array<{
      company: string;
      hiringRate: number;
      avgSalary: number;
      openPositions: number;
      trend: string;
    }>;
  };
  personalized_recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
  }>;
}

interface CareerIntelligenceProps {
  userProfile?: {
    skills?: string[];
    targetRole?: string;
    experienceLevel?: string;
    location?: string;
  };
}

const CareerIntelligence: React.FC<CareerIntelligenceProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<'trajectory' | 'market' | 'salary'>('trajectory');
  const [trajectory, setTrajectory] = useState<CareerTrajectory | null>(null);
  const [marketReport, setMarketReport] = useState<MarketReport | null>(null);
  const [salaryData, setSalaryData] = useState<any>(null);
  
  const [isLoadingTrajectory, setIsLoadingTrajectory] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isLoadingSalary, setIsLoadingSalary] = useState(false);
  
  // Profile state management
  const [currentProfile, setCurrentProfile] = useState({
    skills: [],
    targetRole: '',
    experienceLevel: 'Mid',
    location: 'Remote'
  });
  
  // Skills search state
  const [skillSearchTerm, setSkillSearchTerm] = useState('');

  const roleOptions = [
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'data-analyst', label: 'Data Analyst' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'ux-designer', label: 'UX Designer' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'devops-engineer', label: 'DevOps Engineer' },
    { value: 'machine-learning-engineer', label: 'ML Engineer' },
    { value: 'full-stack-developer', label: 'Full Stack Developer' },
    { value: 'backend-developer', label: 'Backend Developer' },
    { value: 'frontend-developer', label: 'Frontend Developer' },
    { value: 'cloud-architect', label: 'Cloud Architect' },
    { value: 'cybersecurity-analyst', label: 'Cybersecurity Analyst' }
  ];

  const experienceOptions = [
    { value: 'Entry', label: 'Entry Level (0-2 years)' },
    { value: 'Mid', label: 'Mid Level (3-5 years)' },
    { value: 'Senior', label: 'Senior Level (6-10 years)' },
    { value: 'Lead', label: 'Lead/Principal (10+ years)' },
    { value: 'Executive', label: 'Executive Level (15+ years)' }
  ];

  const locationOptions = [
    { value: 'Remote', label: 'Remote' },
    { value: 'San Francisco, CA', label: 'San Francisco, CA' },
    { value: 'New York, NY', label: 'New York, NY' },
    { value: 'Seattle, WA', label: 'Seattle, WA' },
    { value: 'Austin, TX', label: 'Austin, TX' },
    { value: 'Boston, MA', label: 'Boston, MA' },
    { value: 'Chicago, IL', label: 'Chicago, IL' },
    { value: 'Denver, CO', label: 'Denver, CO' },
    { value: 'Los Angeles, CA', label: 'Los Angeles, CA' },
    { value: 'Miami, FL', label: 'Miami, FL' },
    { value: 'Toronto, ON', label: 'Toronto, ON' },
    { value: 'London, UK', label: 'London, UK' },
    { value: 'Berlin, Germany', label: 'Berlin, Germany' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Other', label: 'Other' }
  ];

  // Role-based skill recommendations
  const roleSkillsMap = {
    'software-engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
    'data-analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Data Analysis', 'Statistics', 'Pandas'],
    'product-manager': ['Product Strategy', 'Agile', 'Scrum', 'Analytics', 'User Research', 'Roadmapping', 'Leadership'],
    'ux-designer': ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'],
    'data-scientist': ['Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Statistics', 'SQL', 'Jupyter'],
    'devops-engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Python', 'Monitoring'],
    'machine-learning-engineer': ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'Kubernetes', 'AWS', 'Git'],
    'full-stack-developer': ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'Git', 'AWS'],
    'backend-developer': ['Python', 'Java', 'Node.js', 'SQL', 'MongoDB', 'Redis', 'Docker', 'AWS'],
    'frontend-developer': ['JavaScript', 'React', 'Vue.js', 'HTML/CSS', 'TypeScript', 'SASS/SCSS', 'Git'],
    'cloud-architect': ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Docker', 'Security', 'Networking'],
    'cybersecurity-analyst': ['Security Frameworks', 'Penetration Testing', 'Risk Assessment', 'Compliance', 'Incident Response', 'Python']
  };

  const skillOptions = [
    // Programming Languages
    { value: 'JavaScript', label: 'JavaScript', category: 'Programming' },
    { value: 'Python', label: 'Python', category: 'Programming' },
    { value: 'Java', label: 'Java', category: 'Programming' },
    { value: 'TypeScript', label: 'TypeScript', category: 'Programming' },
    { value: 'C++', label: 'C++', category: 'Programming' },
    { value: 'C#', label: 'C#', category: 'Programming' },
    { value: 'Go', label: 'Go', category: 'Programming' },
    { value: 'Rust', label: 'Rust', category: 'Programming' },
    { value: 'Swift', label: 'Swift', category: 'Programming' },
    { value: 'Kotlin', label: 'Kotlin', category: 'Programming' },
    { value: 'R', label: 'R', category: 'Programming' },
    
    // Frontend
    { value: 'React', label: 'React', category: 'Frontend' },
    { value: 'Vue.js', label: 'Vue.js', category: 'Frontend' },
    { value: 'Angular', label: 'Angular', category: 'Frontend' },
    { value: 'HTML/CSS', label: 'HTML/CSS', category: 'Frontend' },
    { value: 'SASS/SCSS', label: 'SASS/SCSS', category: 'Frontend' },
    
    // Backend
    { value: 'Node.js', label: 'Node.js', category: 'Backend' },
    { value: 'Express.js', label: 'Express.js', category: 'Backend' },
    { value: 'Django', label: 'Django', category: 'Backend' },
    { value: 'Flask', label: 'Flask', category: 'Backend' },
    { value: 'Spring Boot', label: 'Spring Boot', category: 'Backend' },
    { value: 'FastAPI', label: 'FastAPI', category: 'Backend' },
    
    // Databases
    { value: 'SQL', label: 'SQL', category: 'Database' },
    { value: 'PostgreSQL', label: 'PostgreSQL', category: 'Database' },
    { value: 'MySQL', label: 'MySQL', category: 'Database' },
    { value: 'MongoDB', label: 'MongoDB', category: 'Database' },
    { value: 'Redis', label: 'Redis', category: 'Database' },
    { value: 'Elasticsearch', label: 'Elasticsearch', category: 'Database' },
    
    // Cloud & DevOps
    { value: 'AWS', label: 'AWS', category: 'Cloud' },
    { value: 'Azure', label: 'Azure', category: 'Cloud' },
    { value: 'GCP', label: 'Google Cloud', category: 'Cloud' },
    { value: 'Docker', label: 'Docker', category: 'DevOps' },
    { value: 'Kubernetes', label: 'Kubernetes', category: 'DevOps' },
    { value: 'Terraform', label: 'Terraform', category: 'DevOps' },
    { value: 'Jenkins', label: 'Jenkins', category: 'DevOps' },
    { value: 'Linux', label: 'Linux', category: 'DevOps' },
    
    // Data & Analytics
    { value: 'Data Analysis', label: 'Data Analysis', category: 'Data' },
    { value: 'Machine Learning', label: 'Machine Learning', category: 'Data' },
    { value: 'Power BI', label: 'Power BI', category: 'Data' },
    { value: 'Tableau', label: 'Tableau', category: 'Data' },
    { value: 'Pandas', label: 'Pandas', category: 'Data' },
    { value: 'NumPy', label: 'NumPy', category: 'Data' },
    { value: 'TensorFlow', label: 'TensorFlow', category: 'Data' },
    { value: 'PyTorch', label: 'PyTorch', category: 'Data' },
    { value: 'Statistics', label: 'Statistics', category: 'Data' },
    { value: 'Excel', label: 'Excel', category: 'Data' },
    { value: 'Jupyter', label: 'Jupyter', category: 'Data' },
    
    // Design & UX
    { value: 'Figma', label: 'Figma', category: 'Design' },
    { value: 'Sketch', label: 'Sketch', category: 'Design' },
    { value: 'Adobe Creative Suite', label: 'Adobe Creative Suite', category: 'Design' },
    { value: 'User Research', label: 'User Research', category: 'Design' },
    { value: 'Prototyping', label: 'Prototyping', category: 'Design' },
    { value: 'Wireframing', label: 'Wireframing', category: 'Design' },
    { value: 'Design Systems', label: 'Design Systems', category: 'Design' },
    
    // Security
    { value: 'Security Frameworks', label: 'Security Frameworks', category: 'Security' },
    { value: 'Penetration Testing', label: 'Penetration Testing', category: 'Security' },
    { value: 'Risk Assessment', label: 'Risk Assessment', category: 'Security' },
    { value: 'Compliance', label: 'Compliance', category: 'Security' },
    { value: 'Incident Response', label: 'Incident Response', category: 'Security' },
    
    // Management & Soft Skills
    { value: 'Git', label: 'Git', category: 'Tools' },
    { value: 'Agile', label: 'Agile', category: 'Management' },
    { value: 'Scrum', label: 'Scrum', category: 'Management' },
    { value: 'Leadership', label: 'Leadership', category: 'Management' },
    { value: 'Project Management', label: 'Project Management', category: 'Management' },
    { value: 'Product Strategy', label: 'Product Strategy', category: 'Management' },
    { value: 'Analytics', label: 'Analytics', category: 'Management' },
    { value: 'Roadmapping', label: 'Roadmapping', category: 'Management' },
    { value: 'MLOps', label: 'MLOps', category: 'Tools' },
    { value: 'Monitoring', label: 'Monitoring', category: 'Tools' },
    { value: 'Networking', label: 'Networking', category: 'Tools' }
  ];

  // Get filtered skills based on selected role
  const getFilteredSkills = () => {
    if (!profile.targetRole) return skillOptions;
    
    const roleSkills = roleSkillsMap[profile.targetRole] || [];
    const recommendedSkills = skillOptions.filter(skill => roleSkills.includes(skill.value));
    const otherSkills = skillOptions.filter(skill => !roleSkills.includes(skill.value));
    
    return [...recommendedSkills, ...otherSkills];
  };

  const profile = userProfile || currentProfile;

  useEffect(() => {
    // Only auto-generate if we have a target role selected
    if (!profile.targetRole) return;
    
    if (activeTab === 'trajectory' && !trajectory) {
      generateCareerTrajectory();
    } else if (activeTab === 'market' && !marketReport) {
      generateMarketReport();
    } else if (activeTab === 'salary' && !salaryData) {
      generateSalaryPrediction();
    }
  }, [activeTab, profile.targetRole]);

  const generateCareerTrajectory = async () => {
    setIsLoadingTrajectory(true);
    try {
      const response = await fetch(`${API_BASE}/predict-career-trajectory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: {
            skills: profile.skills,
            experienceLevel: profile.experienceLevel,
            currentRole: 'Software Engineer'
          },
          targetRole: profile.targetRole,
          timeframe: '5-years'
        }),
      });

      // Read raw body first to improve diagnostics
      const raw = await response.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

      if (!response.ok) {
        console.error('Trajectory prediction failed (HTTP):', response.status, data?.error || data?.details || raw || 'No body');
        return;
      }

      if (data && (data.success || data.career_path)) {
        // Accept fallback payloads that include trajectory fields even if success is false
        setTrajectory(data as any);
      } else {
        console.error('Trajectory prediction failed:', (data && (data.error || data.details)) || raw || 'Unknown error');
      }
    } catch (error) {
      console.error('Trajectory prediction failed (network):', (error as Error)?.message || error);
    } finally {
      setIsLoadingTrajectory(false);
    }
  };

  const generateMarketReport = async () => {
    setIsLoadingMarket(true);
    try {
      const response = await fetch(`${API_BASE}/market/comprehensive-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: profile
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMarketReport(data);
      } else {
        console.error('Market report failed:', data.error);
      }
    } catch (error) {
      console.error('Market report failed:', error);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const generateSalaryPrediction = async () => {
    setIsLoadingSalary(true);
    try {
      const response = await fetch(`${API_BASE}/predict-salary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: profile.targetRole,
          location: profile.location,
          experienceLevel: profile.experienceLevel
        }),
      });

      const raw = await response.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

      if (!response.ok) {
        console.error('Salary prediction failed (HTTP):', response.status, data?.error || data?.details || raw || 'No body');
        return;
      }

      if (data && (data.success || data.current_salary_range || data.salary_progression)) {
        setSalaryData(data);
      } else {
        console.error('Salary prediction failed:', (data && (data.error || data.details)) || raw || 'Unknown error');
      }
    } catch (error) {
      console.error('Salary prediction failed (network):', (error as Error)?.message || error);
    } finally {
      setIsLoadingSalary(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-100';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'hot': case 'rising': return 'text-green-600 bg-green-100';
      case 'stable': return 'text-blue-600 bg-blue-100';
      case 'declining': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
          <Brain className="h-8 w-8 mr-3 text-purple-600" />
          Career Intelligence Dashboard
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          🎯 <strong>Hackathon Feature:</strong> AI-powered career trajectory prediction and real-time market intelligence
        </p>
      </div>

      {/* Quick Start for New Users */}
      {!profile.targetRole && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">🚀 Quick Start</h3>
          <p className="text-gray-600 text-center mb-4">Get started quickly by selecting a popular role:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { role: 'software-engineer', label: '👨‍💻 Software Engineer', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
              { role: 'data-analyst', label: '📊 Data Analyst', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
              { role: 'product-manager', label: '🎯 Product Manager', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
              { role: 'ux-designer', label: '🎨 UX Designer', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' }
            ].map(({ role, label, color }) => (
              <button
                key={role}
                onClick={() => {
                  const newProfile = { 
                    ...currentProfile, 
                    targetRole: role,
                    skills: roleSkillsMap[role] || []
                  };
                  setCurrentProfile(newProfile);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Target Role</p>
            <select 
              value={profile.targetRole}
              onChange={(e) => {
                const selectedRole = e.target.value;
                const newProfile = { 
                  ...currentProfile, 
                  targetRole: selectedRole,
                  // Auto-suggest skills for the selected role
                  skills: selectedRole && roleSkillsMap[selectedRole] ? 
                    [...new Set([...currentProfile.skills, ...roleSkillsMap[selectedRole]])] : 
                    currentProfile.skills
                };
                setCurrentProfile(newProfile);
                // Clear cached data to force regeneration
                setTrajectory(null);
                setMarketReport(null);
                setSalaryData(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <option value="">Select a role...</option>
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center">
            <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Experience</p>
            <select 
              value={profile.experienceLevel}
              onChange={(e) => {
                const newProfile = { ...currentProfile, experienceLevel: e.target.value };
                setCurrentProfile(newProfile);
                setTrajectory(null);
                setMarketReport(null);
                setSalaryData(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {experienceOptions.map(exp => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center">
            <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Location</p>
            <select 
              value={profile.location}
              onChange={(e) => {
                const newProfile = { ...currentProfile, location: e.target.value };
                setCurrentProfile(newProfile);
                setTrajectory(null);
                setMarketReport(null);
                setSalaryData(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {locationOptions.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center col-span-1 md:col-span-4">
            <Brain className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Skills</p>
            
            {/* Skill search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search skills..."
                value={skillSearchTerm}
                onChange={(e) => setSkillSearchTerm(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Skill selection controls */}
            <div className="flex justify-center space-x-2 mb-3">
              <button
                onClick={() => {
                  const allSkills = skillOptions.map(skill => skill.value);
                  const newProfile = { ...currentProfile, skills: allSkills };
                  setCurrentProfile(newProfile);
                  setTrajectory(null);
                  setMarketReport(null);
                  setSalaryData(null);
                }}
                className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => {
                  const newProfile = { ...currentProfile, skills: [] };
                  setCurrentProfile(newProfile);
                  setTrajectory(null);
                  setMarketReport(null);
                  setSalaryData(null);
                }}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            {/* Role-based skill suggestions */}
            {profile.targetRole && roleSkillsMap[profile.targetRole] && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  💡 Recommended skills for {roleOptions.find(r => r.value === profile.targetRole)?.label}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleSkillsMap[profile.targetRole].map(skill => (
                    <button
                      key={skill}
                      onClick={() => {
                        const currentSkills = profile.skills || [];
                        if (!currentSkills.includes(skill)) {
                          const newProfile = { ...currentProfile, skills: [...currentSkills, skill] };
                          setCurrentProfile(newProfile);
                          setTrajectory(null);
                          setMarketReport(null);
                          setSalaryData(null);
                        }
                      }}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        profile.skills?.includes(skill)
                          ? 'bg-green-100 text-green-800 cursor-default'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                      }`}
                      disabled={profile.skills?.includes(skill)}
                    >
                      {skill} {profile.skills?.includes(skill) ? '✓' : '+'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {getFilteredSkills()
                  .filter(skill => 
                    skill.label.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
                    skill.value.toLowerCase().includes(skillSearchTerm.toLowerCase())
                  )
                  .map(skill => {
                    const isRecommended = profile.targetRole && roleSkillsMap[profile.targetRole]?.includes(skill.value);
                    return (
                      <label key={skill.value} className={`flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded ${
                        isRecommended ? 'bg-blue-50 border border-blue-200' : ''
                      }`}>
                        <input
                          type="checkbox"
                          checked={profile.skills?.includes(skill.value) || false}
                          onChange={(e) => {
                            const currentSkills = profile.skills || [];
                            const newSkills = e.target.checked
                              ? [...currentSkills, skill.value]
                              : currentSkills.filter(s => s !== skill.value);
                            const newProfile = { ...currentProfile, skills: newSkills };
                            setCurrentProfile(newProfile);
                            setTrajectory(null);
                            setMarketReport(null);
                            setSalaryData(null);
                          }}
                          className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className={`truncate ${isRecommended ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                          {skill.label} {isRecommended ? '⭐' : ''}
                        </span>
                      </label>
                    );
                  })}
              </div>
              {skillSearchTerm && getFilteredSkills().filter(skill => 
                skill.label.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
                skill.value.toLowerCase().includes(skillSearchTerm.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No skills found matching "{skillSearchTerm}"</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Selected: {profile.skills?.length || 0} skills
            </p>
          </div>
        </div>
      </div>      {/*
 Tab Navigation */}
      <div className="flex justify-center space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: 'trajectory', label: 'Career Trajectory', icon: TrendingUp },
          { id: 'market', label: 'Market Intelligence', icon: BarChart3 },
          { id: 'salary', label: 'Salary Insights', icon: DollarSign }
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

      {/* Career Trajectory Tab */}
      {activeTab === 'trajectory' && (
        <div className="space-y-6">
          {!profile.targetRole ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Target Role</h3>
              <p className="text-gray-600 mb-6">Choose a target role above to get AI-powered career trajectory predictions and personalized recommendations.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Selecting a role will automatically suggest relevant skills and provide tailored career insights using our RAG-powered intelligence system.
                </p>
              </div>
            </div>
          ) : isLoadingTrajectory ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mr-3" />
              <span className="text-lg text-gray-600">Predicting your career trajectory...</span>
            </div>
          ) : trajectory ? (
            <>
              {/* Success Probability */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Career Success Probability</h3>
                  <div className={`px-4 py-2 rounded-xl font-bold text-lg ${getProbabilityColor(trajectory.success_probability)}`}>
                    {trajectory.success_probability}%
                  </div>
                </div>
                <p className="text-gray-600">
                  Based on your current skills, market trends, and career goals, you have a strong probability of success.
                </p>
              </div>

              {/* Career Path Timeline */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">5-Year Career Path</h3>
                <div className="space-y-6">
                  {trajectory.career_path.map((step, index) => (
                    <div key={index} className="relative">
                      {index < trajectory.career_path.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-purple-200"></div>
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">Year {step.year}: {step.role}</h4>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProbabilityColor(step.probability)}`}>
                              {step.probability}% likely
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{step.expected_salary_range}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Skills to Develop:</p>
                              <div className="flex flex-wrap gap-2">
                                {step.skills_to_develop.map((skill, skillIndex) => (
                                  <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Key Milestones:</p>
                              <ul className="text-sm text-gray-600">
                                {step.key_milestones.map((milestone, milestoneIndex) => (
                                  <li key={milestoneIndex} className="flex items-center">
                                    <Award className="h-3 w-3 text-green-600 mr-1" />
                                    {milestone}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Paths */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Alternative Career Paths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trajectory.alternative_paths.map((path, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{path.path_name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getProbabilityColor(path.success_probability)}`}>
                          {path.success_probability}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Timeline: {path.timeline}</p>
                      <div className="flex flex-wrap gap-1">
                        {path.roles.map((role, roleIndex) => (
                          <span key={roleIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  {trajectory.recommended_actions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={generateCareerTrajectory}
                disabled={!profile.targetRole || !profile.skills?.length}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  profile.targetRole && profile.skills?.length
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Career Trajectory
              </button>
              {(!profile.targetRole || !profile.skills?.length) && (
                <p className="text-sm text-gray-500 mt-2">
                  {!profile.targetRole ? 'Please select a target role first' : 'Please select at least one skill'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Market Intelligence Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {!profile.targetRole ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Target Role</h3>
              <p className="text-gray-600 mb-6">Choose a target role to get real-time market intelligence and skill demand analysis.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  📊 <strong>Market Intelligence:</strong> Get insights on skill trends, company hiring patterns, and personalized recommendations based on current market data.
                </p>
              </div>
            </div>
          ) : isLoadingMarket ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg text-gray-600">Analyzing market trends...</span>
            </div>
          ) : marketReport ? (
            <>
              {/* Skill Demand Trends */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Skills Market Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketReport.skill_analysis.skill_trends.map((skill, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTrendColor(skill.trend)}`}>
                          {skill.trend}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Demand:</span>
                          <span className="font-medium">{skill.demand}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Growth:</span>
                          <span className="font-medium text-green-600">+{skill.growth}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Salary:</span>
                          <span className="font-medium">${skill.avgSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Hiring Trends */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Companies Hiring</h3>
                <div className="space-y-4">
                  {marketReport.company_insights.company_trends.slice(0, 5).map((company, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{company.company}</h4>
                          <p className="text-sm text-gray-600">{company.openPositions} open positions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${company.avgSalary.toLocaleString()}</p>
                        <p className={`text-sm font-medium ${getTrendColor(company.trend)}`}>
                          {company.trend} hiring
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Market Insights</h3>
                <div className="space-y-4">
                  {marketReport.personalized_recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{rec.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={generateMarketReport}
                disabled={!profile.targetRole}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  profile.targetRole
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Market Report
              </button>
              {!profile.targetRole && (
                <p className="text-sm text-gray-500 mt-2">Please select a target role first</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Salary Insights Tab */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          {!profile.targetRole ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Your Target Role</h3>
              <p className="text-gray-600 mb-6">Choose a target role to get salary predictions and compensation insights.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  💰 <strong>Salary Intelligence:</strong> Get location-adjusted salary ranges, growth projections, and negotiation insights based on your role and experience.
                </p>
              </div>
            </div>
          ) : isLoadingSalary ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-green-600 mr-3" />
              <span className="text-lg text-gray-600">Calculating salary predictions...</span>
            </div>
          ) : salaryData ? (
            <>
              {/* Current Salary Range */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Market Salary Range</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${salaryData.current_salary_range?.min?.toLocaleString()} - ${salaryData.current_salary_range?.max?.toLocaleString()}
                  </div>
                  <p className="text-gray-600">
                    {salaryData.current_salary_range?.confidence}% confidence based on market data
                  </p>
                </div>
              </div>

              {/* Salary Progression */}
              {salaryData.salary_progression && (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Salary Growth Projection</h3>
                  <div className="space-y-4">
                    {salaryData.salary_progression.map((projection: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-semibold text-gray-900">Year {projection.year}: {projection.role_level}</h4>
                          <p className="text-sm text-gray-600">Growth: +{projection.growth_percentage}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${projection.salary_range.min.toLocaleString()} - ${projection.salary_range.max.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Adjustments */}
              {salaryData.location_adjustments && (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Location-Based Salary Adjustments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(salaryData.location_adjustments).map(([location, data]: [string, any]) => (
                      <div key={location} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold text-gray-900 capitalize">{location.replace('_', ' ')}</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Salary Multiplier: <span className="font-medium">{data.multiplier}x</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Cost of Living: <span className="font-medium">{data.cost_of_living}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation Insights */}
              {salaryData.negotiation_insights && (
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Salary Negotiation Insights</h3>
                  <div className="space-y-3">
                    {salaryData.negotiation_insights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <button
                onClick={generateSalaryPrediction}
                disabled={!profile.targetRole}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  profile.targetRole
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Salary Insights
              </button>
              {!profile.targetRole && (
                <p className="text-sm text-gray-500 mt-2">Please select a target role first</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerIntelligence;