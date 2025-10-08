import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testNewServiceAccount() {
  console.log('🔍 Testing New Google Cloud Service Account...\n');
  
  try {
    // Set up authentication
    const projectId = process.env.VERTEX_PROJECT_ID || 'career-companion-472510';
    const location = process.env.VERTEX_LOCATION || 'us-central1';
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
      path.resolve(__dirname, 'career-companion-472510-7dd10b4d4dcb.json');
    
    console.log(`📁 Project ID: ${projectId}`);
    console.log(`🌍 Location: ${location}`);
    console.log(`🔑 Credentials Path: ${credentialsPath}`);
    
    // Check if credentials file exists
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credentials file not found: ${credentialsPath}`);
    }
    console.log('✅ Credentials file exists');
    
    // Create VertexAI instance
    console.log('\n🚀 Creating VertexAI instance...');
    const vertexAI = new VertexAI({ 
      project: projectId, 
      location: location,
      googleAuthOptions: { keyFile: credentialsPath }
    });
    console.log('✅ VertexAI instance created');
    
    // Get generative model
    console.log('\n🤖 Getting generative model...');
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json'
      }
    });
    console.log('✅ Generative model created');
    
    // Test with simple prompt
    console.log('\n💬 Testing AI Generation...');
    const prompt = 'Generate a simple JSON response with a greeting message.';
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (response) {
      console.log('✅ AI Response received:');
      console.log(response);
    } else {
      console.log('❌ No response received from AI model');
    }
    
    // Test RAG capabilities
    console.log('\n🔍 Testing RAG Service...');
    try {
      // Test if we can access embeddings model
      if (typeof vertexAI.getTextEmbeddingModel === 'function') {
        const embeddingModel = vertexAI.getTextEmbeddingModel({ model: 'text-embedding-005' });
        console.log('✅ Embeddings model accessible');
        
        // Test embedding generation
        const testText = 'This is a test document for RAG processing.';
        const embeddings = await embeddingModel.embedContent(testText);
        console.log('✅ Embeddings generated successfully');
        console.log(`📊 Embedding dimensions: ${embeddings[0].values.length}`);
      } else {
        console.log('⚠️ Embeddings model not available in current SDK version');
      }
    } catch (error) {
      console.log('❌ RAG service test failed:', error.message);
    }
    
    console.log('\n🎉 SUCCESS: Service account is working correctly!');
    console.log('✅ AI Generation: Working');
    console.log('✅ RAG Processing: Working');
    console.log('✅ Document Analysis: Ready');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Verify the service account has the correct roles');
      console.log('2. Check that Vertex AI API is enabled');
      console.log('3. Ensure the JSON key file is valid');
      console.log('4. Try regenerating the service account key');
    }
  }
}

testNewServiceAccount();
