import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 HACKATHON FEATURE: Real-Time Market Intelligence
export class MarketIntelligenceService {
  constructor() {
    this.project = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.VERTEX_LOCATION || 'us-central1';
    this.model = process.env.VERTEX_MODEL || 'gemini-2.5-flash';
    
    if (this.project) {
      const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
      const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, '../../', envCred);

      this.vertexAI = new VertexAI({ 
        project: this.project, 
        location: this.location,
        googleAuthOptions: { keyFile: credentialsPath }
      });
      this.generativeModel = this.vertexAI.getGenerativeModel({ model: this.model });
    }

    // Mock real-time market data (in production, integrate with job APIs)
    this.marketData = this.initializeMarketData();
  }

  initializeMarketData() {
    return {
      skillDemandTrends: {
        'JavaScript': { demand: 95, growth: 12, avgSalary: 85000, trend: 'rising' },
        'Python': { demand: 92, growth: 18, avgSalary: 90000, trend: 'rising' },
        'React': { demand: 88, growth: 15, avgSalary: 82000, trend: 'stable' },
        'Node.js': { demand: 85, growth: 10, avgSalary: 87000, trend: 'stable' },
        'TypeScript': { demand: 82, growth: 25, avgSalary: 88000, trend: 'rising' },
        'Docker': { demand: 78, growth: 20, avgSalary: 92000, trend: 'rising' },
        'Kubernetes': { demand: 75, growth: 30, avgSalary: 105000, trend: 'hot' },
        'AWS': { demand: 90, growth: 16, avgSalary: 95000, trend: 'rising' },
        'Machine Learning': { demand: 85, growth: 35, avgSalary: 110000, trend: 'hot' },
        'GraphQL': { demand: 65, growth: 22, avgSalary: 89000, trend: 'emerging' }
      },
      companyHiringTrends: {
        'Google': { hiringRate: 85, avgSalary: 150000, openPositions: 1200, trend: 'active' },
        'Microsoft': { hiringRate: 82, avgSalary: 145000, openPositions: 980, trend: 'active' },
        'Amazon': { hiringRate: 88, avgSalary: 140000, openPositions: 1500, trend: 'aggressive' },
        'Meta': { hiringRate: 70, avgSalary: 155000, openPositions: 600, trend: 'selective' },
        'Netflix': { hiringRate: 75, avgSalary: 160000, openPositions: 300, trend: 'stable' }
      },
      locationTrends: {
        'San Francisco': { demandIndex: 95, salaryMultiplier: 1.4, costOfLiving: 1.8, trend: 'expensive' },
        'Seattle': { demandIndex: 88, salaryMultiplier: 1.25, costOfLiving: 1.4, trend: 'growing' },
        'Austin': { demandIndex: 82, salaryMultiplier: 1.1, costOfLiving: 1.1, trend: 'hot' },
        'Remote': { demandIndex: 90, salaryMultiplier: 0.95, costOfLiving: 1.0, trend: 'rising' },
        'New York': { demandIndex: 92, salaryMultiplier: 1.3, costOfLiving: 1.7, trend: 'stable' }
      }
    };
  }

  // Get skill demand trends and predictions
  async getSkillDemandTrends(skills) {
    try {
      const skillAnalysis = skills.map(skill => {
        const data = this.marketData.skillDemandTrends[skill] || {
          demand: 50, growth: 5, avgSalary: 70000, trend: 'stable'
        };
        return { skill, ...data };
      });

      // Generate AI insights about skill trends
      const prompt = `Analyze these skill demand trends and provide market insights:

SKILLS DATA:
${skillAnalysis.map(s => `${s.skill}: Demand ${s.demand}%, Growth ${s.growth}%, Avg Salary $${s.avgSalary}, Trend: ${s.trend}`).join('\n')}

Provide analysis in JSON format:
{
  "skill_insights": [
    {
      "skill": "JavaScript",
      "market_position": "Essential foundation skill",
      "future_outlook": "Stable demand with framework evolution",
      "learning_priority": "High",
      "complementary_skills": ["TypeScript", "React", "Node.js"]
    }
  ],
  "market_summary": {
    "hot_skills": ["Kubernetes", "Machine Learning"],
    "declining_skills": ["jQuery", "Flash"],
    "emerging_skills": ["WebAssembly", "Edge Computing"],
    "skill_gaps": ["AI/ML integration", "Cloud architecture"]
  },
  "recommendations": [
    "Focus on cloud technologies for highest ROI",
    "Combine technical skills with domain expertise"
  ]
}

Return only valid JSON.`;

      let aiInsights = null;
      if (this.generativeModel) {
        try {
          const result = await this.generativeModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          });
          const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          aiInsights = this.safeParseJson(response);
        } catch (error) {
          console.warn('AI insights generation failed:', error);
        }
      }

      return {
        skill_trends: skillAnalysis,
        ai_insights: aiInsights || this.generateFallbackInsights(skills),
        market_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('Skill demand analysis failed:', error);
      return this.generateFallbackSkillTrends(skills);
    }
  } 
 // Get company hiring trends and insights
  async getCompanyHiringTrends(companies = []) {
    try {
      const companyData = companies.length > 0 
        ? companies.map(company => ({
            company,
            ...(this.marketData.companyHiringTrends[company] || {
              hiringRate: 60, avgSalary: 100000, openPositions: 100, trend: 'stable'
            })
          }))
        : Object.entries(this.marketData.companyHiringTrends).map(([company, data]) => ({
            company, ...data
          }));

      return {
        company_trends: companyData,
        market_insights: {
          most_active_companies: companyData.filter(c => c.trend === 'aggressive' || c.trend === 'active'),
          highest_paying: companyData.sort((a, b) => b.avgSalary - a.avgSalary).slice(0, 5),
          most_opportunities: companyData.sort((a, b) => b.openPositions - a.openPositions).slice(0, 5)
        },
        hiring_forecast: {
          q1_outlook: 'Strong hiring expected in tech sector',
          growth_areas: ['AI/ML', 'Cloud Infrastructure', 'Cybersecurity'],
          risk_areas: ['Legacy systems', 'Non-remote positions']
        },
        market_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('Company hiring trends analysis failed:', error);
      return this.generateFallbackCompanyTrends();
    }
  }

  // Get location-based market analysis
  async getLocationMarketAnalysis(locations = []) {
    try {
      const locationData = locations.length > 0
        ? locations.map(location => ({
            location,
            ...(this.marketData.locationTrends[location] || {
              demandIndex: 70, salaryMultiplier: 1.0, costOfLiving: 1.0, trend: 'stable'
            })
          }))
        : Object.entries(this.marketData.locationTrends).map(([location, data]) => ({
            location, ...data
          }));

      return {
        location_analysis: locationData,
        market_insights: {
          best_value_locations: locationData
            .map(l => ({ ...l, value_score: (l.salaryMultiplier / l.costOfLiving) * l.demandIndex }))
            .sort((a, b) => b.value_score - a.value_score),
          highest_demand: locationData.sort((a, b) => b.demandIndex - a.demandIndex),
          remote_trends: {
            adoption_rate: 85,
            salary_impact: -5,
            future_outlook: 'Continued growth expected'
          }
        },
        relocation_recommendations: [
          'Consider total compensation vs cost of living',
          'Remote work can provide best of both worlds',
          'Emerging tech hubs offer good opportunities'
        ],
        market_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('Location market analysis failed:', error);
      return this.generateFallbackLocationTrends();
    }
  }

  // Generate comprehensive market report
  async generateMarketReport(userProfile) {
    try {
      const skills = userProfile.skills || [];
      const location = userProfile.location || 'Remote';
      const role = userProfile.targetRole || 'software-engineer';

      const [skillTrends, companyTrends, locationAnalysis] = await Promise.all([
        this.getSkillDemandTrends(skills),
        this.getCompanyHiringTrends(),
        this.getLocationMarketAnalysis([location])
      ]);

      return {
        user_profile: userProfile,
        skill_analysis: skillTrends,
        company_insights: companyTrends,
        location_insights: locationAnalysis,
        personalized_recommendations: this.generatePersonalizedRecommendations(
          userProfile, skillTrends, companyTrends, locationAnalysis
        ),
        market_summary: {
          overall_outlook: 'Positive growth in tech sector',
          key_opportunities: ['AI/ML integration', 'Cloud migration', 'Remote work'],
          potential_challenges: ['Skill obsolescence', 'Increased competition', 'Economic uncertainty']
        },
        report_timestamp: new Date().toISOString(),
        success: true
      };

    } catch (error) {
      console.error('Market report generation failed:', error);
      return this.generateFallbackMarketReport(userProfile);
    }
  }

  // Utility methods
  generatePersonalizedRecommendations(userProfile, skillTrends, companyTrends, locationAnalysis) {
    const recommendations = [];
    
    // Skill-based recommendations
    if (skillTrends.skill_trends) {
      const lowDemandSkills = skillTrends.skill_trends.filter(s => s.demand < 70);
      if (lowDemandSkills.length > 0) {
        recommendations.push({
          type: 'skill_upgrade',
          priority: 'high',
          message: `Consider upgrading skills: ${lowDemandSkills.map(s => s.skill).join(', ')}`,
          action: 'Focus on high-demand alternatives'
        });
      }
    }

    // Location-based recommendations
    if (locationAnalysis.location_analysis && locationAnalysis.location_analysis.length > 0) {
      const location = locationAnalysis.location_analysis[0];
      if (location.costOfLiving > 1.5) {
        recommendations.push({
          type: 'location_optimization',
          priority: 'medium',
          message: 'Consider remote work to optimize cost of living',
          action: 'Explore remote-friendly companies'
        });
      }
    }

    return recommendations;
  }

  safeParseJson(text) {
    try {
      let cleaned = text.replace(/```(?:json)?/gi, '').trim();
      try { return JSON.parse(cleaned); } catch (_) {}
      return null;
    } catch (error) {
      return null;
    }
  }

  generateFallbackInsights(skills) {
    return {
      skill_insights: skills.map(skill => ({
        skill,
        market_position: 'In-demand skill',
        future_outlook: 'Stable growth expected',
        learning_priority: 'Medium',
        complementary_skills: ['Related technologies']
      })),
      market_summary: {
        hot_skills: ['AI/ML', 'Cloud', 'DevOps'],
        declining_skills: ['Legacy systems'],
        emerging_skills: ['Edge computing', 'Quantum'],
        skill_gaps: ['Leadership', 'Communication']
      },
      recommendations: ['Continuous learning', 'Stay updated with trends']
    };
  }

  generateFallbackSkillTrends(skills) {
    return {
      skill_trends: skills.map(skill => ({
        skill,
        demand: 75,
        growth: 10,
        avgSalary: 80000,
        trend: 'stable'
      })),
      ai_insights: this.generateFallbackInsights(skills),
      market_timestamp: new Date().toISOString(),
      success: false
    };
  }

  generateFallbackCompanyTrends() {
    return {
      company_trends: [
        { company: 'Tech Companies', hiringRate: 75, avgSalary: 120000, openPositions: 1000, trend: 'active' }
      ],
      market_insights: {
        most_active_companies: ['Major tech companies'],
        highest_paying: ['FAANG companies'],
        most_opportunities: ['Growing startups']
      },
      hiring_forecast: {
        q1_outlook: 'Moderate growth expected',
        growth_areas: ['Technology', 'Healthcare', 'Finance'],
        risk_areas: ['Traditional industries']
      },
      market_timestamp: new Date().toISOString(),
      success: false
    };
  }

  generateFallbackLocationTrends() {
    return {
      location_analysis: [
        { location: 'Remote', demandIndex: 85, salaryMultiplier: 0.95, costOfLiving: 1.0, trend: 'rising' }
      ],
      market_insights: {
        best_value_locations: ['Remote work', 'Emerging tech hubs'],
        highest_demand: ['Major tech cities'],
        remote_trends: { adoption_rate: 80, salary_impact: -5, future_outlook: 'Continued growth' }
      },
      relocation_recommendations: ['Consider remote work', 'Evaluate total compensation'],
      market_timestamp: new Date().toISOString(),
      success: false
    };
  }

  generateFallbackMarketReport(userProfile) {
    return {
      user_profile: userProfile,
      skill_analysis: this.generateFallbackSkillTrends(userProfile.skills || []),
      company_insights: this.generateFallbackCompanyTrends(),
      location_insights: this.generateFallbackLocationTrends(),
      personalized_recommendations: [
        { type: 'general', priority: 'medium', message: 'Continue skill development', action: 'Focus on learning' }
      ],
      market_summary: {
        overall_outlook: 'Stable growth expected',
        key_opportunities: ['Technology advancement', 'Remote work'],
        potential_challenges: ['Market competition', 'Skill requirements']
      },
      report_timestamp: new Date().toISOString(),
      success: false
    };
  }
}

export const marketIntelligenceService = new MarketIntelligenceService();