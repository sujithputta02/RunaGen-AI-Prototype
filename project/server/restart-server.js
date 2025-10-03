// Simple script to test if server endpoints are working
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testServerEndpoints() {
  console.log('🔍 Testing Server Endpoints...\n');

  const endpoints = [
    { name: 'Health Check', url: '/health', method: 'GET' },
    { name: 'Supported Formats', url: '/optimizer/supported-formats', method: 'GET' },
    { name: 'Test Templates', url: '/test-templates', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${API_BASE}${endpoint.url}`);
      
      const response = await fetch(`${API_BASE}${endpoint.url}`, {
        method: endpoint.method
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: SUCCESS`);
        
        if (endpoint.url === '/optimizer/supported-formats') {
          console.log(`   Supported extensions: ${data.supported_extensions?.join(', ')}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
    console.log();
  }

  console.log('🎯 Server Endpoint Test Complete!');
  console.log('\nIf any endpoints failed:');
  console.log('1. Make sure server is running: node src/server.js');
  console.log('2. Check for any import errors in the console');
  console.log('3. Verify port 3001 is not blocked');
}

testServerEndpoints().catch(console.error);