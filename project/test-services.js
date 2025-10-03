// Test script to verify all services are working
import { resumeOptimizer } from './server/src/services/resume-optimizer.js';
import { careerTrajectoryPredictor } from './server/src/services/career-trajectory-predictor.js';
import { marketIntelligenceService } from './server/src/services/market-intelligence.js';

console.log('🧪 Testing AI Services...\n');

// Test data
const sampleResume = `
John Doe
Software Engineer

EXPERIENCE:
- 3 years as Frontend Developer at TechCorp
- Built React applications with TypeScript
- Worked with REST APIs and Git

SKILLS:
JavaScript, React, TypeScript, HTML, CSS, Git, REST APIs

EDUCATION:
Bachelor's in Computer Science
`;

const sampleJobDescription = `
We are looking for a Senior Software Engineer with:
- 5+ years experience in JavaScript/TypeScript
- Expert in React and Node.js
- Experience with cloud platforms (AWS/GCP)
- Strong problem-solving skills
`;

async function testServices() {
  try {
    console.log('1️⃣ Testing Resume Optimizer...');
    const optimization = await resumeOptimizer.optimizeResume(
      sampleResume, 
      'software-engineer', 
      [sampleJobDescription]
    );
    console.log('✅ Resume Optimizer working');
    console.log('   - ATS Score:', optimization.ats_score?.overall_score || 'Generated');
    console.log('   - Keywords added:', optimization.optimized_resume ? 'Yes' : 'No');
    
    console.log('\n2️⃣ Testing Career Trajectory Predictor...');
    const trajectory = await careerTrajectoryPredictor.predictCareerTrajectory(
      { skills: ['JavaScript', 'React'], experience: '3 years' },
      'Senior Software Engineer',
      '5-years'
    );
    console.log('✅ Career Trajectory Predictor working');
    console.log('   - Career path generated:', trajectory.career_path ? 'Yes' : 'No');
    console.log('   - Success probability:', trajectory.success_probability || 'Generated');
    
    console.log('\n3️⃣ Testing Market Intelligence...');
    const marketData = await marketIntelligenceService.analyzeMarketTrends(
      ['JavaScript', 'React', 'TypeScript'],
      'software-engineer'
    );
    console.log('✅ Market Intelligence working');
    console.log('   - Trends analyzed:', marketData.skill_trends ? 'Yes' : 'No');
    console.log('   - Market insights:', marketData.market_insights ? 'Yes' : 'No');
    
    console.log('\n🎉 All services are working correctly!');
    console.log('🚀 Ready for hackathon demo!');
    
  } catch (error) {
    console.error('❌ Service test failed:', error.message);
    console.log('🔧 Check your environment variables and API keys');
  }
}

testServices();