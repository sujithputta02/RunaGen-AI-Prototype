#!/usr/bin/env node

/**
 * Test script to verify Google Cloud setup
 * Run this after setting up your service account
 */

import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGoogleCloudSetup() {
    console.log('🧪 Testing Google Cloud Setup...\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   PROJECT_ID: ${process.env.VERTEX_PROJECT_ID || 'NOT SET'}`);
    console.log(`   LOCATION: ${process.env.VERTEX_LOCATION || 'NOT SET'}`);
    console.log(`   CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NOT SET'}`);
    console.log('');

    if (!process.env.VERTEX_PROJECT_ID) {
        console.error('❌ VERTEX_PROJECT_ID not set in .env file');
        return false;
    }

    try {
        // Initialize Vertex AI
        const vertexAI = new VertexAI({
            project: process.env.VERTEX_PROJECT_ID,
            location: process.env.VERTEX_LOCATION || 'us-central1',
        });

        // Get the model
        const model = vertexAI.getGenerativeModel({
            model: process.env.VERTEX_MODEL || 'gemini-2.5-flash',
        });

        console.log('🔄 Testing Vertex AI connection...');

        // Test with a simple prompt
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: 'Say "Hello from RunaGen AI!" if you can read this.' }]
            }]
        });

        const response = result.response;
        const text = response.candidates[0].content.parts[0].text;

        console.log('✅ Google Cloud Vertex AI is working!');
        console.log(`📝 Response: ${text}`);
        console.log('\n🎉 Setup complete! You can now run the application.');

        return true;

    } catch (error) {
        console.error('❌ Google Cloud setup failed:');
        console.error(`   Error: ${error.message}`);
        
        if (error.message.includes('PERMISSION_DENIED')) {
            console.error('\n💡 Possible solutions:');
            console.error('   1. Check if Vertex AI API is enabled');
            console.error('   2. Verify service account has correct permissions');
            console.error('   3. Ensure project ID is correct');
        } else if (error.message.includes('UNAUTHENTICATED')) {
            console.error('\n💡 Possible solutions:');
            console.error('   1. Check if service account key file exists');
            console.error('   2. Verify GOOGLE_APPLICATION_CREDENTIALS path');
            console.error('   3. Try using: gcloud auth application-default login');
        }

        return false;
    }
}

// Run the test
testGoogleCloudSetup()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });