#!/usr/bin/env node

/**
 * API Setup Test Script
 * Tests API connectivity and basic functionality before running DIY Assistant
 */

const fs = require('fs');

console.log('🔧 Testing API Setup for DIY Assistant...\n');

// Test configuration file
const testConfigExists = () => {
  console.log('📋 Testing Configuration...');
  
  if (!fs.existsSync('config.toml')) {
    console.log('❌ config.toml not found');
    console.log('💡 Copy sample.config.toml to config.toml and add your API keys');
    return false;
  }
  
  const config = fs.readFileSync('config.toml', 'utf8');
  
  // Check for API keys
  const checks = [
    { name: 'Perplexity API Key', pattern: /PERPLEXITY.*API_KEY.*=.*"(.+)"/ },
    { name: 'OpenAI API Key (for embeddings)', pattern: /OPENAI.*API_KEY.*=.*"(.+)"/ },
    { name: 'SearXNG Endpoint', pattern: /SEARXNG.*=.*"(.+)"/ }
  ];
  
  let hasErrors = false;
  
  checks.forEach(check => {
    const match = config.match(check.pattern);
    if (match && match[1] && match[1].length > 10) {
      console.log(`✅ ${check.name}: Configured`);
    } else {
      console.log(`❌ ${check.name}: Missing or invalid`);
      hasErrors = true;
    }
  });
  
  return !hasErrors;
};

// Test Perplexity API connectivity
const testPerplexityAPI = async () => {
  console.log('\n🌐 Testing Perplexity API...');
  
  try {
    const config = fs.readFileSync('config.toml', 'utf8');
    const apiKeyMatch = config.match(/PERPLEXITY.*API_KEY.*=.*"(.+)"/);
    
    if (!apiKeyMatch || !apiKeyMatch[1]) {
      console.log('❌ Perplexity API key not found in config');
      return false;
    }
    
    const apiKey = apiKeyMatch[1];
    
    // Test API call
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'user', content: 'Hello, this is a test. Please respond with "API working".' }
        ],
        max_tokens: 10
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Perplexity API: Connected successfully');
      console.log(`📝 Response: ${data.choices[0].message.content}`);
      return true;
    } else {
      console.log(`❌ Perplexity API: Error ${response.status}`);
      const error = await response.text();
      console.log(`📝 Error: ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Perplexity API: Connection failed - ${error.message}`);
    return false;
  }
};

// Test SearXNG connectivity
const testSearXNG = async () => {
  console.log('\n🔍 Testing SearXNG...');
  
  try {
    const config = fs.readFileSync('config.toml', 'utf8');
    const endpointMatch = config.match(/SEARXNG.*=.*"(.+)"/);
    
    if (!endpointMatch || !endpointMatch[1]) {
      console.log('❌ SearXNG endpoint not found in config');
      return false;
    }
    
    const endpoint = endpointMatch[1];
    
    // Test search
    const response = await fetch(`${endpoint}/search?q=test&format=json&categories=general`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SearXNG: Connected successfully');
      console.log(`📝 Found ${data.results?.length || 0} test results`);
      return true;
    } else {
      console.log(`❌ SearXNG: Error ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ SearXNG: Connection failed - ${error.message}`);
    console.log('💡 Make sure SearXNG is running: docker-compose up searxng');
    return false;
  }
};

// Test DIY-specific components
const testDIYComponents = () => {
  console.log('\n🔨 Testing DIY Components...');
  
  const requiredFiles = [
    'src/lib/types/diy.ts',
    'src/lib/prompts/diySearch.ts',
    'src/lib/search/diySearch.ts',
    'src/lib/services/priceExtractor.ts',
    'src/components/DIYProductCard.tsx',
    'src/components/ShoppingListView.tsx'
  ];
  
  let allFound = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - Missing`);
      allFound = false;
    }
  });
  
  return allFound;
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting API Setup Tests...\n');
  
  const configOk = testConfigExists();
  const componentsOk = testDIYComponents();
  
  if (!configOk) {
    console.log('\n❌ Configuration test failed. Please fix config.toml first.');
    process.exit(1);
  }
  
  if (!componentsOk) {
    console.log('\n❌ DIY components missing. Please run the implementation first.');
    process.exit(1);
  }
  
  const perplexityOk = await testPerplexityAPI();
  const searxngOk = await testSearXNG();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 API Setup Test Results');
  console.log('='.repeat(50));
  
  console.log(`Configuration: ${configOk ? '✅' : '❌'}`);
  console.log(`DIY Components: ${componentsOk ? '✅' : '❌'}`);
  console.log(`Perplexity API: ${perplexityOk ? '✅' : '❌'}`);
  console.log(`SearXNG: ${searxngOk ? '✅' : '❌'}`);
  
  if (configOk && componentsOk && perplexityOk && searxngOk) {
    console.log('\n🎉 All tests passed! DIY Assistant is ready to use.');
    console.log('\n📝 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Select "DIY Assistant" focus mode');
    console.log('3. Try: "I want to renovate my bathroom"');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    
    if (!perplexityOk) {
      console.log('\n💡 Perplexity API Setup:');
      console.log('1. Visit: https://www.perplexity.ai/settings/api');
      console.log('2. Sign up and get your API key');
      console.log('3. Add to config.toml: API_KEY = "pplx-your-key"');
    }
    
    if (!searxngOk) {
      console.log('\n💡 SearXNG Setup:');
      console.log('1. Start SearXNG: docker-compose up searxng');
      console.log('2. Check endpoint in config.toml');
    }
  }
};

// Run the tests
runTests().catch(console.error);