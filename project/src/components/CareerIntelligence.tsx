import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, MapPin, Building2, 
  Brain, Target, Calendar, AlertTriangle,
  BarChart3, LineChart, PieChart, Activity,
  Sparkles, Zap, Award, RefreshCw
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

  const defaultProfile = {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    targetRole: 'Senior Software Engineer',
    experienceLevel: 'Mid',
    location: 'Remote'
  };

  const profile = userProfile || defaultProfile;

  useEffect(() => {
    if (activeTab === 'trajectory' && !trajectory) {
      generateCareerTrajectory();
    } else if (activeTab === 'market' && !marketReport) {
      generateMarketReport();
    } else if (activeTab === 'salary' && !salaryData) {
      generateSalaryPrediction();
    }
  }, [activeTab]);

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

      const data = await response.json();
      if (data.success) {
        setTrajectory(data);
      } else {
        console.error('Trajectory prediction failed:', data.error);
      }
    } catch (error) {
      console.error('Trajectory prediction failed:', error);
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

      const data = await response.json();
      if (data.success) {
        setSalaryData(data);
      } else {
        console.error('Salary prediction failed:', data.error);
      }
    } catch (error) {
      console.error('Salary prediction failed:', error);
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

      {/* Profile Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Target Role</p>
            <p className="font-semibold text-gray-900">{profile.targetRole}</p>
          </div>
          <div className="text-center">
            <Activity className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Experience</p>
            <p className="font-semibold text-gray-900">{profile.experienceLevel}</p>
          </div>
          <div className="text-center">
            <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-semibold text-gray-900">{profile.location}</p>
          </div>
          <div className="text-center">
            <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Skills</p>
            <p className="font-semibold text-gray-900">{profile.skills?.length || 0} skills</p>
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
          {isLoadingTrajectory ? (
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
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-300"
              >
                Generate Career Trajectory
              </button>
            </div>
          )}
        </div>
      )}

      {/* Market Intelligence Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {isLoadingMarket ? (
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all duration-300"
              >
                Generate Market Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Salary Insights Tab */}
      {activeTab === 'salary' && (
        <div className="space-y-6">
          {isLoadingSalary ? (
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
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-xl transition-all duration-300"
              >
                Generate Salary Insights
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerIntelligence;