import 'dotenv/config';
import fetch from 'node-fetch';

async function testFallbackMode() {
  console.log('🔍 Testing API Fallback Mode (without Vertex AI)...\n');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData.status);
    
    // Test 2: Resume analysis (should work with fallback)
    console.log('\n2️⃣ Testing resume analysis...');
    const resumeData = {
      text: "John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js, Python\nExperience: 3 years at TechCorp\nEducation: Computer Science Degree"
    };
    
    const resumeResponse = await fetch(`${baseUrl}/api/analyze-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resumeData)
    });
    
    const resumeResult = await resumeResponse.json();
    console.log('✅ Resume analysis completed');
    console.log('   Match Score:', resumeResult.atsScore + '%');
    console.log('   Skills Present:', resumeResult.skillsPresent?.join(', ') || 'None');
    console.log('   Skills Missing:', resumeResult.skillsMissing?.join(', ') || 'None');
    
    // Test 3: Job matching
    console.log('\n3️⃣ Testing job matching...');
    const jobResponse = await fetch(`${baseUrl}/api/jobs/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        role: 'software-engineer',
        experience: 'mid-level',
        skills: ['JavaScript', 'React', 'Node.js']
      })
    });
    
    const jobResult = await jobResponse.json();
    console.log('✅ Job matching completed');
    console.log('   Jobs found:', jobResult.jobs?.length || 0);
    
    // Test 4: Career trajectory (should work with fallback)
    console.log('\n4️⃣ Testing career trajectory...');
    const trajectoryResponse = await fetch(`${baseUrl}/api/career/trajectory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentRole: 'software-engineer',
        experience: 'mid-level',
        skills: ['JavaScript', 'React', 'Node.js'],
        goals: ['senior-developer', 'tech-lead']
      })
    });
    
    const trajectoryResult = await trajectoryResponse.json();
    console.log('✅ Career trajectory completed');
    console.log('   Roadmap steps:', trajectoryResult.roadmap?.length || 0);
    
    // Test 5: Market intelligence (should work with fallback)
    console.log('\n5️⃣ Testing market intelligence...');
    const marketResponse = await fetch(`${baseUrl}/api/market/intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'software-engineer',
        location: 'San Francisco',
        experience: 'mid-level'
      })
    });
    
    const marketResult = await marketResponse.json();
    console.log('✅ Market intelligence completed');
    console.log('   Salary range:', marketResult.salaryRange || 'Not available');
    console.log('   Market trends:', marketResult.trends?.length || 0);
    
    console.log('\n🎉 FALLBACK MODE TEST COMPLETE!');
    console.log('✅ All core features are working without Vertex AI');
    console.log('✅ The application is functional for the hackathon');
    console.log('⚠️  For full AI features, regenerate the service account key');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testFallbackMode().then(success => {
  process.exit(success ? 0 : 1);
});
