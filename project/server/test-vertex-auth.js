import 'dotenv/config';
import { VertexAI } from '@google-cloud/vertexai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testVertexAIAuth() {
  console.log('🔍 Testing Google Cloud Vertex AI Authentication...\n');
  
  try {
    // Set up environment variables
    const project = process.env.VERTEX_PROJECT_ID || 'career-companion-472510';
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const envCred = process.env.GOOGLE_APPLICATION_CREDENTIALS || './career-companion-472510-7dd10b4d4dcb.json';
    const credentialsPath = path.isAbsolute(envCred) ? envCred : path.resolve(__dirname, envCred);
    
    console.log('📁 Project ID:', project);
    console.log('🌍 Location:', location);
    console.log('🔑 Credentials Path:', credentialsPath);
    
    // Check if credentials file exists
    const fs = await import('fs');
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ Credentials file not found at:', credentialsPath);
      return false;
    }
    console.log('✅ Credentials file exists');
    
    // Create VertexAI instance
    console.log('\n🚀 Creating VertexAI instance...');
    const vertexAI = new VertexAI({ 
      project, 
      location, 
      googleAuthOptions: { keyFile: credentialsPath } 
    });
    console.log('✅ VertexAI instance created successfully');
    
    // Get generative model
    console.log('\n🤖 Getting generative model...');
    const model = vertexAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 100,
        responseMimeType: 'text/plain'
      }
    });
    console.log('✅ Generative model created successfully');
    
    // Test with a simple prompt
    console.log('\n💬 Testing with simple prompt...');
    const testPrompt = "Say 'Hello, Vertex AI is working!' in exactly those words.";
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: testPrompt }] }]
    });
    
    const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Response received:', response);
    
    if (response && response.includes('Hello, Vertex AI is working!')) {
      console.log('\n🎉 SUCCESS: Vertex AI authentication and generation is working perfectly!');
      return true;
    } else {
      console.log('\n⚠️ WARNING: Response received but content may not be as expected');
      return true; // Still consider it working if we got a response
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('Invalid JWT Signature')) {
      console.log('\n🔧 TROUBLESHOOTING: Invalid JWT Signature');
      console.log('   - The service account key may be corrupted or expired');
      console.log('   - Try regenerating the service account key in Google Cloud Console');
      console.log('   - Ensure the key file is not corrupted');
    } else if (error.message.includes('Unable to authenticate')) {
      console.log('\n🔧 TROUBLESHOOTING: Authentication Failed');
      console.log('   - Check if the service account has proper permissions');
      console.log('   - Verify the project ID is correct');
      console.log('   - Ensure Vertex AI API is enabled for the project');
    }
    
    return false;
  }
}

// Run the test
testVertexAIAuth().then(success => {
  process.exit(success ? 0 : 1);
});
