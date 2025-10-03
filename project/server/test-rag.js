import 'dotenv/config';
import { ragAnalyzer } from './src/services/rag-service.js';
import { enhancedRAGAnalyzer } from './src/services/enhanced-rag-service.js';
import { getEmbedding } from './utils/embeddings.js';
import { VectorStore } from './utils/vectorStore.js';

async function testRAGPipeline() {
  console.log('🔍 Testing RAG Pipeline for Resume Analysis...\n');

  // Test sample resume text
  const sampleResumeText = `
    John Doe
    Software Engineer
    
    Experience:
    - 3 years of experience in JavaScript, React, and Node.js
    - Built REST APIs and worked with MongoDB
    - Experience with Git version control
    - Worked on e-commerce web applications
    
    Skills:
    - JavaScript, TypeScript, React, Node.js
    - HTML, CSS, Bootstrap
    - MongoDB, SQL
    - Git, GitHub
    - Problem solving and teamwork
    
    Education:
    - Bachelor's in Computer Science
  `;

  const sampleJobDescription = `
    We are looking for a Senior Software Engineer with:
    - 5+ years of JavaScript/TypeScript experience
    - Strong React and Node.js skills
    - Experience with cloud platforms (AWS, Azure)
    - Knowledge of Docker and Kubernetes
    - CI/CD pipeline experience
    - Strong problem-solving skills
  `;

  try {
    console.log('1️⃣ Testing Basic RAG Service...');
    const basicAnalysis = await ragAnalyzer.analyzeResumeWithRAG(
      sampleResumeText, 
      sampleJobDescription, 
      'software-engineer'
    );
    
    console.log('✅ Basic RAG Analysis Results:');
    console.log(`   Match Score: ${basicAnalysis.match_score}%`);
    console.log(`   Skills Present: ${basicAnalysis.skills_present?.join(', ') || 'None'}`);
    console.log(`   Skills Missing: ${basicAnalysis.skills_missing?.join(', ') || 'None'}`);
    console.log(`   RAG Enhanced: ${basicAnalysis.rag_enhanced}`);
    console.log(`   Model Used: ${basicAnalysis.model_used}\n`);

  } catch (error) {
    console.log('❌ Basic RAG Service failed:', error.message);
    console.log('   Trying fallback analysis...');
    
    try {
      const fallbackAnalysis = await ragAnalyzer.analyzeResumeWithFallback(
        sampleResumeText, 
        sampleJobDescription, 
        'software-engineer'
      );
      console.log('✅ Fallback Analysis Results:');
      console.log(`   Match Score: ${fallbackAnalysis.match_score}%`);
      console.log(`   Skills Present: ${fallbackAnalysis.skills_present?.join(', ') || 'None'}`);
      console.log(`   RAG Enhanced: ${fallbackAnalysis.rag_enhanced}\n`);
    } catch (fallbackError) {
      console.log('❌ Fallback analysis also failed:', fallbackError.message);
    }
  }

  try {
    console.log('2️⃣ Testing Enhanced RAG Service...');
    const enhancedAnalysis = await enhancedRAGAnalyzer.analyzeResumeWithEnhancedRAG(
      sampleResumeText, 
      sampleJobDescription, 
      'software-engineer'
    );
    
    console.log('✅ Enhanced RAG Analysis Results:');
    console.log(`   Match Score: ${enhancedAnalysis.match_score}%`);
    console.log(`   Skills Present: ${enhancedAnalysis.skills_present?.join(', ') || 'None'}`);
    console.log(`   Skills Missing: ${enhancedAnalysis.skills_missing?.join(', ') || 'None'}`);
    console.log(`   External Sources Used: ${enhancedAnalysis.external_sources_used || 0}`);
    console.log(`   RAG Enhanced: ${enhancedAnalysis.rag_enhanced}`);
    console.log(`   Roles Detected: ${enhancedAnalysis.roles?.length || 0}\n`);

  } catch (error) {
    console.log('❌ Enhanced RAG Service failed:', error.message);
  }

  try {
    console.log('3️⃣ Testing Vector Embeddings...');
    const embedding1 = await getEmbedding("JavaScript React Node.js");
    const embedding2 = await getEmbedding("Python Django Flask");
    
    console.log('✅ Embeddings Generated:');
    console.log(`   JavaScript/React embedding length: ${embedding1.length}`);
    console.log(`   Python/Django embedding length: ${embedding2.length}`);
    
    // Test vector store
    const vectorStore = new VectorStore(embedding1.length);
    await vectorStore.add("JavaScript skills", embedding1);
    await vectorStore.add("Python skills", embedding2);
    await vectorStore.build();
    
    const queryEmbedding = await getEmbedding("React JavaScript frontend");
    const results = await vectorStore.topK(queryEmbedding, 2);
    
    console.log('✅ Vector Search Results:');
    results.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.item} (score: ${result.score.toFixed(3)})`);
    });
    console.log();

  } catch (error) {
    console.log('❌ Vector embeddings test failed:', error.message);
  }

  console.log('🎯 RAG Pipeline Test Complete!');
}

// Run the test
testRAGPipeline().catch(console.error);