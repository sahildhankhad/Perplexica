#!/usr/bin/env node

/**
 * DIY Assistant Test Script
 * Tests a real DIY query with Perplexity API
 */

const fs = require('fs');

const testPerplexityAPI = async () => {
  console.log('🔨 Testing DIY Assistant with Perplexity API...\n');
  
  const apiKey = "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";
  
  // Test basic API connectivity first
  console.log('1. Testing API connection...');
  try {
    const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'user', content: 'Hello, please respond with "API working".' }
        ],
        max_tokens: 10
      })
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Perplexity API connected successfully');
      console.log(`📝 Test response: ${data.choices[0].message.content}\n`);
    } else {
      throw new Error(`API Error: ${testResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ API connection failed: ${error.message}`);
    return;
  }
  
  // Test DIY project analysis
  console.log('2. Testing DIY project analysis...');
  
  const diyQuery = "I want to renovate my bathroom with a modern look";
  
  const projectAnalysisPrompt = `
You are a DIY/renovation project analyst. Analyze this project request and provide a detailed breakdown:

1. Project Type & Scope:
   - Main project type (bathroom renovation, kitchen remodel, deck building, etc.)
   - Scope: Is this a full renovation, partial update, repair, or upgrade?
   - Specific areas or rooms involved

2. Requirements Analysis:
   - Any budget constraints mentioned (extract specific numbers if provided)
   - Timeline requirements or deadlines
   - Special requirements or constraints (rental property, HOA rules, etc.)
   - Existing conditions that need addressing

3. Skill Assessment:
   - Implied skill level based on the request
   - Whether professional help might be needed for certain aspects

4. Project Phases:
   Break down into logical phases such as:
   - Planning & Permits
   - Demolition/Prep
   - Rough work (plumbing, electrical, framing)
   - Installation
   - Finishing
   - Cleanup

User Query: ${diyQuery}
`;

  try {
    const analysisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'user', content: projectAnalysisPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('✅ Project analysis completed');
      console.log('📋 Analysis Result:');
      console.log(analysisData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Analysis Error: ${analysisResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Project analysis failed: ${error.message}`);
    return;
  }
  
  // Test product identification
  console.log('3. Testing product identification...');
  
  const productIdentificationPrompt = `
You are a DIY/renovation materials expert. Based on this bathroom renovation project with a modern look, create a comprehensive list of all products, materials, and tools needed.

For each item, provide:
1. Product name and description
2. Category (tools, materials, fixtures, consumables, appliances, hardware)
3. Quantity needed with appropriate unit of measure
4. Key specifications that affect purchasing decisions
5. Quality tier recommendations (budget/standard/premium)
6. Whether it's essential or optional

Project: Modern bathroom renovation

Focus on modern style elements like:
- Clean lines and minimalist design
- Contemporary fixtures and finishes
- Modern tile patterns
- Updated lighting and mirrors
- Efficient storage solutions

Include:
- All materials (tiles, paint, grout, etc.)
- Required tools (both purchase and rental options)
- Fixtures and appliances
- Consumables (screws, adhesives, etc.)
- Safety equipment
`;

  try {
    const productResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'user', content: productIdentificationPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (productResponse.ok) {
      const productData = await productResponse.json();
      console.log('✅ Product identification completed');
      console.log('🛒 Product List:');
      console.log(productData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Product identification Error: ${productResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Product identification failed: ${error.message}`);
    return;
  }
  
  // Test shopping search queries
  console.log('4. Testing shopping search query generation...');
  
  const searchQueryPrompt = `
Generate specific search queries to find prices and availability for these bathroom renovation products across multiple retailers.

For each product category, create search queries optimized for:
- Home improvement stores (Home Depot, Lowe's, Menards)
- Online retailers (Amazon, Wayfair, Build.com)

Products for modern bathroom renovation:
- Modern bathroom vanity 36 inch
- Subway tile white 3x6 inch
- Modern bathroom faucet brushed nickel
- LED vanity light fixture
- Modern mirror for bathroom
- Tile grout white
- Bathroom exhaust fan

Include brand names when possible and focus on finding current prices and availability.

Generate 10-15 specific search queries that would find these products with prices.
`;

  try {
    const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'user', content: searchQueryPrompt }
        ],
        max_tokens: 500,
        temperature: 0.5
      })
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search query generation completed');
      console.log('🔍 Search Queries:');
      console.log(searchData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Search query Error: ${searchResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Search query generation failed: ${error.message}`);
    return;
  }
  
  console.log('🎉 DIY Assistant Test Complete!');
  console.log('\n📊 Test Results:');
  console.log('✅ API Connection: Working');
  console.log('✅ Project Analysis: Working');
  console.log('✅ Product Identification: Working');
  console.log('✅ Search Query Generation: Working');
  
  console.log('\n🚀 Ready to integrate with Perplexica!');
  console.log('💡 Next steps:');
  console.log('1. Start SearXNG: docker-compose up searxng');
  console.log('2. Start Perplexica: npm run dev');
  console.log('3. Select "DIY Assistant" focus mode');
  console.log('4. Try: "I want to renovate my bathroom"');
};

// Run the test
testPerplexityAPI().catch(console.error);