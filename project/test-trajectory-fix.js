// Test script to verify the career trajectory parsing fix
import { CareerTrajectoryPredictor } from './server/src/services/career-trajectory-predictor.js';

console.log('🧪 Testing Career Trajectory Parsing Fix...\n');

// Create a test instance without Vertex AI
class TestCareerTrajectoryPredictor extends CareerTrajectoryPredictor {
  constructor() {
    super(); // Call parent constructor which will handle missing config gracefully
  }

  // Test the safeParseJson method directly
  testJsonParsing() {
    const testCases = [
      // Valid JSON
      '{"career_path": [{"year": 1, "role": "Junior Developer"}]}',
      
      // JSON with markdown
      '```json\n{"career_path": [{"year": 1, "role": "Junior Developer"}]}\n```',
      
      // JSON with extra text
      'Here is the career trajectory:\n{"career_path": [{"year": 1, "role": "Junior Developer"}]}\nEnd of response',
      
      // Malformed JSON
      '{"career_path": [{"year": 1, "role": "Junior Developer"',
      
      // Empty response
      '',
      
      // Non-JSON response
      'This is not JSON at all'
    ];

    console.log('Testing JSON parsing with various inputs:\n');
    
    testCases.forEach((testCase, index) => {
      console.log(`Test ${index + 1}:`);
      console.log(`Input: ${testCase.substring(0, 50)}${testCase.length > 50 ? '...' : ''}`);
      
      const result = this.safeParseJson(testCase);
      console.log(`Result: ${result ? 'Parsed successfully' : 'Failed to parse'}`);
      
      if (result) {
        console.log(`Parsed data: ${JSON.stringify(result).substring(0, 100)}...`);
      }
      console.log('---');
    });
  }

  // Test the fallback trajectory generation
  testFallbackGeneration() {
    console.log('\nTesting fallback trajectory generation:\n');
    
    const resumeData = {
      skills: ['JavaScript', 'React'],
      experienceLevel: 'Mid',
      currentRole: 'Frontend Developer'
    };
    
    const fallback = this.generateFallbackTrajectory(resumeData, 'Senior Software Engineer', '5-years');
    
    console.log('✅ Fallback trajectory generated successfully');
    console.log(`Career path length: ${fallback.career_path.length} years`);
    console.log(`Success probability: ${fallback.success_probability}%`);
    console.log(`Alternative paths: ${fallback.alternative_paths.length}`);
    console.log(`Recommended actions: ${fallback.recommended_actions.length}`);
  }
}

async function runTests() {
  try {
    const tester = new TestCareerTrajectoryPredictor();
    
    // Test JSON parsing
    tester.testJsonParsing();
    
    // Test fallback generation
    tester.testFallbackGeneration();
    
    console.log('\n🎉 All parsing tests completed!');
    console.log('✅ The career trajectory parsing fix should resolve the error.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

runTests();