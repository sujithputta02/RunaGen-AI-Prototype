// Test the career trajectory endpoint directly
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

async function testCareerEndpoint() {
  try {
    console.log('🧪 Testing Career Trajectory Endpoint...\n');
    
    const testData = {
      resumeData: {
        skills: ['JavaScript', 'React', 'TypeScript'],
        experienceLevel: 'Mid',
        currentRole: 'Frontend Developer'
      },
      targetRole: 'Senior Software Engineer',
      timeframe: '5-years'
    };
    
    console.log('Sending request to:', `${API_URL}/predict-career-trajectory`);
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_URL}/predict-career-trajectory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('\n✅ Response received successfully!');
    console.log('Success:', result.success);
    console.log('Career path length:', result.career_path?.length || 0);
    console.log('Success probability:', result.success_probability);
    console.log('Model used:', result.model_used);
    
    if (result.career_path && result.career_path.length > 0) {
      console.log('\nFirst career step:');
      console.log('- Year:', result.career_path[0].year);
      console.log('- Role:', result.career_path[0].role);
      console.log('- Probability:', result.career_path[0].probability + '%');
    }
    
    console.log('\n🎉 Career trajectory endpoint is working correctly!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Start the server first with: npm run dev');
    } else {
      console.error('❌ Test failed:', error.message);
    }
  }
}

testCareerEndpoint();