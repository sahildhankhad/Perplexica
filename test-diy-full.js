#!/usr/bin/env node

/**
 * Full DIY Assistant Test with working model
 */

const testDIYAssistant = async () => {
  const apiKey = "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";
  const workingModel = "sonar";
  
  console.log('🔨 Testing DIY Assistant Full Workflow...\n');
  console.log(`Using model: ${workingModel}\n`);
  
  // Test 1: Project Analysis
  console.log('1️⃣  PROJECT ANALYSIS');
  console.log('Query: "I want to renovate my bathroom with a modern look"');
  console.log('─'.repeat(50));
  
  const projectAnalysisPrompt = `
Analyze this DIY project request and provide a breakdown:

1. Project Type & Scope
2. Main phases of work
3. Skill level needed
4. Key considerations

User Query: I want to renovate my bathroom with a modern look
  `;
  
  try {
    const analysisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: workingModel,
        messages: [{ role: 'user', content: projectAnalysisPrompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    if (analysisResponse.ok) {
      const analysisData = await analysisResponse.json();
      console.log('✅ Project Analysis Complete:');
      console.log(analysisData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Analysis failed: ${analysisResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Project analysis failed: ${error.message}`);
    return;
  }
  
  // Test 2: Product Identification
  console.log('2️⃣  PRODUCT IDENTIFICATION');
  console.log('─'.repeat(50));
  
  const productPrompt = `
List the main product categories needed for a modern bathroom renovation:

Categories should include:
- Fixtures (vanity, toilet, shower/tub)
- Surfaces (tiles, flooring, paint)
- Hardware and accessories
- Tools required
- Estimated quantities

Keep it concise but comprehensive.
  `;
  
  try {
    const productResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: workingModel,
        messages: [{ role: 'user', content: productPrompt }],
        max_tokens: 600,
        temperature: 0.7
      })
    });
    
    if (productResponse.ok) {
      const productData = await productResponse.json();
      console.log('✅ Product Categories:');
      console.log(productData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Product identification failed: ${productResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Product identification failed: ${error.message}`);
    return;
  }
  
  // Test 3: Shopping List Generation
  console.log('3️⃣  SHOPPING LIST GENERATION');
  console.log('─'.repeat(50));
  
  const shoppingPrompt = `
Create a shopping list for a modern bathroom renovation. Include:

1. Specific product examples with estimated prices
2. Where to buy them (Home Depot, Lowe's, Amazon, etc.)
3. Total budget estimate
4. Tips for saving money

Format as a practical shopping list.
  `;
  
  try {
    const shoppingResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: workingModel,
        messages: [{ role: 'user', content: shoppingPrompt }],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    
    if (shoppingResponse.ok) {
      const shoppingData = await shoppingResponse.json();
      console.log('✅ Shopping List:');
      console.log(shoppingData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Shopping list failed: ${shoppingResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Shopping list generation failed: ${error.message}`);
    return;
  }
  
  // Test 4: Search Query Generation
  console.log('4️⃣  SEARCH QUERY GENERATION');
  console.log('─'.repeat(50));
  
  const searchPrompt = `
Generate specific search queries to find current prices for these bathroom renovation items:

1. Modern bathroom vanity 36 inch
2. Subway tile white 3x6
3. Brushed nickel faucet
4. LED vanity light
5. Bathroom mirror 36 inch

Create 8-10 search queries optimized for finding prices at major retailers.
  `;
  
  try {
    const searchResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: workingModel,
        messages: [{ role: 'user', content: searchPrompt }],
        max_tokens: 400,
        temperature: 0.5
      })
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search Queries:');
      console.log(searchData.choices[0].message.content);
      console.log('\n' + '='.repeat(60) + '\n');
    } else {
      throw new Error(`Search queries failed: ${searchResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Search query generation failed: ${error.message}`);
    return;
  }
  
  console.log('🎉 DIY ASSISTANT TEST COMPLETE!');
  console.log('\n📊 Results Summary:');
  console.log('✅ API Connection: Working');
  console.log('✅ Model: sonar');
  console.log('✅ Project Analysis: Working');
  console.log('✅ Product Identification: Working');
  console.log('✅ Shopping List Generation: Working');
  console.log('✅ Search Query Generation: Working');
  
  console.log('\n🚀 Ready for Integration!');
  console.log('\n🔧 Next Steps:');
  console.log('1. Update Perplexity provider with "sonar" model');
  console.log('2. Start SearXNG: docker-compose up searxng');
  console.log('3. Start Perplexica: npm run dev');
  console.log('4. Select "DIY Assistant" and test with real UI');
  
  console.log('\n💡 Configuration for config.toml:');
  console.log('[MODELS.PERPLEXITY]');
  console.log('API_KEY = "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"');
  console.log('\nUse model: "sonar" in the UI');
};

testDIYAssistant();