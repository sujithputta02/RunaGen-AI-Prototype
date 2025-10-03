import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:3001';

async function testRAGAPI() {
  console.log('🔍 Testing RAG Pipeline via API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData);

    // Test 2: Test templates
    console.log('\n2️⃣ Testing job templates...');
    const templatesResponse = await fetch(`${API_BASE}/test-templates`);
    const templatesData = await templatesResponse.json();
    console.log('✅ Available roles:', templatesData.available_roles);
    console.log('✅ Auto-detect exists:', templatesData.auto_detect_exists);

    // Test 3: Test job matching
    console.log('\n3️⃣ Testing job matching...');
    const jobMatchResponse = await fetch(`${API_BASE}/test-job-matching`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'software-engineer',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
      })
    });
    const jobMatchData = await jobMatchResponse.json();
    console.log('✅ Job matches found:', jobMatchData.total_matches);
    console.log('✅ Sample job:', jobMatchData.job_matches?.[0]?.title || 'None');

    // Test 4: Create a sample resume file for testing
    console.log('\n4️⃣ Testing resume analysis...');
    const sampleResumeContent = `
John Doe
Software Engineer

Experience:
- 3 years of JavaScript, React, and Node.js development
- Built REST APIs with Express.js and MongoDB
- Experience with Git version control and Agile methodologies
- Developed e-commerce web applications

Skills:
- JavaScript, TypeScript, React, Node.js
- HTML5, CSS3, Bootstrap, Tailwind CSS
- MongoDB, PostgreSQL, SQL
- Git, GitHub, VS Code
- Problem solving, teamwork, communication

Education:
- Bachelor's Degree in Computer Science
- Relevant coursework in algorithms and data structures

Projects:
- E-commerce Platform: Built with React and Node.js
- Task Management App: Full-stack application with authentication
- Weather Dashboard: API integration and responsive design
    `;

    // Create temporary file
    const tempFilePath = './temp-resume.txt';
    fs.writeFileSync(tempFilePath, sampleResumeContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempFilePath));
    formData.append('target_role', 'software-engineer');

    const analysisResponse = await fetch(`${API_BASE}/upload_resume`, {
      method: 'POST',
      headers: {
        'x-user-id': 'test-user'
      },
      body: formData
    });

    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('✅ Resume analysis completed!');
      console.log('   Match Score:', analysisData.match_score + '%');
      console.log('   Skills Present:', analysisData.skills_present?.join(', ') || 'None');
      console.log('   Skills Missing:', analysisData.skills_missing?.join(', ') || 'None');
      console.log('   Job Matches:', analysisData.job_matches?.length || 0);
      console.log('   RAG Enhanced:', analysisData.rag_enhanced || false);
    } else {
      const errorText = await analysisResponse.text();
      console.log('❌ Resume analysis failed:', errorText);
    }

    // Clean up
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }

  console.log('\n🎯 RAG API Test Complete!');
}

testRAGAPI().catch(console.error);