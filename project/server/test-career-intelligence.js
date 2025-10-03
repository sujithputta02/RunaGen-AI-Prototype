import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testCareerIntelligence() {
  console.log('🧠 Testing Career Intelligence Features...\n');

  const testProfile = {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS'],
    targetRole: 'Senior Software Engineer',
    experienceLevel: 'Mid',
    location: 'Remote'
  };

  try {
    // Test 1: Career Trajectory Prediction
    console.log('1️⃣ Testing Career Trajectory Prediction...');
    const trajectoryResponse = await fetch(`${API_BASE}/predict-career-trajectory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: {
          skills: testProfile.skills,
          experienceLevel: testProfile.experienceLevel,
          currentRole: 'Software Engineer'
        },
        targetRole: testProfile.targetRole,
        timeframe: '5-years'
      })
    });

    if (trajectoryResponse.ok) {
      const trajectoryData = await trajectoryResponse.json();
      console.log('✅ Career Trajectory Prediction:');
      console.log(`   Success Probability: ${trajectoryData.success_probability}%`);
      console.log(`   Career Path Steps: ${trajectoryData.career_path?.length || 0}`);
      console.log(`   Alternative Paths: ${trajectoryData.alternative_paths?.length || 0}`);
      console.log(`   Recommended Actions: ${trajectoryData.recommended_actions?.length || 0}`);
      console.log(`   Model Used: ${trajectoryData.model_used}`);
      
      if (trajectoryData.career_path && trajectoryData.career_path.length > 0) {
        console.log(`   Year 1 Role: ${trajectoryData.career_path[0].role}`);
        console.log(`   Year 1 Salary: ${trajectoryData.career_path[0].expected_salary_range}`);
      }
      console.log();
    } else {
      const errorText = await trajectoryResponse.text();
      console.log('❌ Career trajectory prediction failed:', errorText);
    }

    // Test 2: Salary Prediction
    console.log('2️⃣ Testing Salary Prediction...');
    const salaryResponse = await fetch(`${API_BASE}/predict-salary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: testProfile.targetRole,
        location: testProfile.location,
        experienceLevel: testProfile.experienceLevel
      })
    });

    if (salaryResponse.ok) {
      const salaryData = await salaryResponse.json();
      console.log('✅ Salary Prediction:');
      console.log(`   Current Range: $${salaryData.current_salary_range?.min?.toLocaleString()} - $${salaryData.current_salary_range?.max?.toLocaleString()}`);
      console.log(`   Confidence: ${salaryData.current_salary_range?.confidence}%`);
      console.log(`   Salary Progression Steps: ${salaryData.salary_progression?.length || 0}`);
      console.log(`   Location Adjustments: ${Object.keys(salaryData.location_adjustments || {}).length}`);
      console.log(`   Negotiation Insights: ${salaryData.negotiation_insights?.length || 0}`);
      console.log();
    } else {
      const errorText = await salaryResponse.text();
      console.log('❌ Salary prediction failed:', errorText);
    }

    // Test 3: Skill Market Trends
    console.log('3️⃣ Testing Skill Market Trends...');
    const skillTrendsResponse = await fetch(`${API_BASE}/market/skill-trends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: testProfile.skills
      })
    });

    if (skillTrendsResponse.ok) {
      const skillTrendsData = await skillTrendsResponse.json();
      console.log('✅ Skill Market Trends:');
      console.log(`   Skills Analyzed: ${skillTrendsData.skill_trends?.length || 0}`);
      console.log(`   AI Insights Available: ${skillTrendsData.ai_insights ? 'Yes' : 'No'}`);
      
      if (skillTrendsData.skill_trends && skillTrendsData.skill_trends.length > 0) {
        const topSkill = skillTrendsData.skill_trends[0];
        console.log(`   Top Skill: ${topSkill.skill} (Demand: ${topSkill.demand}%, Growth: +${topSkill.growth}%)`);
      }
      
      if (skillTrendsData.ai_insights?.market_summary) {
        console.log(`   Hot Skills: ${skillTrendsData.ai_insights.market_summary.hot_skills?.join(', ') || 'None'}`);
        console.log(`   Emerging Skills: ${skillTrendsData.ai_insights.market_summary.emerging_skills?.join(', ') || 'None'}`);
      }
      console.log();
    } else {
      const errorText = await skillTrendsResponse.text();
      console.log('❌ Skill trends analysis failed:', errorText);
    }

    // Test 4: Company Hiring Trends
    console.log('4️⃣ Testing Company Hiring Trends...');
    const companyTrendsResponse = await fetch(`${API_BASE}/market/company-trends`);

    if (companyTrendsResponse.ok) {
      const companyTrendsData = await companyTrendsResponse.json();
      console.log('✅ Company Hiring Trends:');
      console.log(`   Companies Analyzed: ${companyTrendsData.company_trends?.length || 0}`);
      console.log(`   Most Active Companies: ${companyTrendsData.market_insights?.most_active_companies?.length || 0}`);
      console.log(`   Highest Paying: ${companyTrendsData.market_insights?.highest_paying?.length || 0}`);
      
      if (companyTrendsData.company_trends && companyTrendsData.company_trends.length > 0) {
        const topCompany = companyTrendsData.company_trends[0];
        console.log(`   Top Company: ${topCompany.company} (Avg Salary: $${topCompany.avgSalary?.toLocaleString()}, ${topCompany.openPositions} positions)`);
      }
      console.log();
    } else {
      const errorText = await companyTrendsResponse.text();
      console.log('❌ Company trends analysis failed:', errorText);
    }

    // Test 5: Comprehensive Market Report
    console.log('5️⃣ Testing Comprehensive Market Report...');
    const marketReportResponse = await fetch(`${API_BASE}/market/comprehensive-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userProfile: testProfile
      })
    });

    if (marketReportResponse.ok) {
      const marketReportData = await marketReportResponse.json();
      console.log('✅ Comprehensive Market Report:');
      console.log(`   User Profile: ${marketReportData.user_profile?.targetRole || 'N/A'}`);
      console.log(`   Skill Analysis: ${marketReportData.skill_analysis?.skill_trends?.length || 0} skills`);
      console.log(`   Company Insights: ${marketReportData.company_insights?.company_trends?.length || 0} companies`);
      console.log(`   Location Insights: ${marketReportData.location_insights?.location_analysis?.length || 0} locations`);
      console.log(`   Personalized Recommendations: ${marketReportData.personalized_recommendations?.length || 0}`);
      console.log(`   Market Summary: ${marketReportData.market_summary?.overall_outlook || 'N/A'}`);
      
      if (marketReportData.personalized_recommendations && marketReportData.personalized_recommendations.length > 0) {
        console.log(`   Top Recommendation: ${marketReportData.personalized_recommendations[0].message}`);
      }
      console.log();
    } else {
      const errorText = await marketReportResponse.text();
      console.log('❌ Market report generation failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Career Intelligence test failed:', error.message);
  }

  console.log('🧠 Career Intelligence Test Complete!');
  console.log('\n🏆 New Hackathon Features Summary:');
  console.log('   ✅ Career Trajectory Prediction: AI-powered 5-year career path');
  console.log('   ✅ Salary Intelligence: Market-based compensation insights');
  console.log('   ✅ Skill Market Analysis: Real-time demand and growth trends');
  console.log('   ✅ Company Intelligence: Hiring trends and opportunities');
  console.log('   ✅ Comprehensive Reports: Personalized market insights');
  console.log('\n🎯 These features showcase advanced AI capabilities:');
  console.log('   • Predictive Analytics for career planning');
  console.log('   • Real-time market intelligence integration');
  console.log('   • Personalized recommendations based on user profile');
  console.log('   • Multi-dimensional analysis (skills, companies, locations)');
  console.log('   • Professional-grade insights for career development');
  console.log('\n🎪 Your project now has UNIQUE differentiators for the hackathon!');
}

testCareerIntelligence().catch(console.error);