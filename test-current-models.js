#!/usr/bin/env node

/**
 * Test with current Perplexity model names (2024/2025)
 */

const testCurrentModels = async () => {
  const apiKey = "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";
  
  // Current model names based on Perplexity's latest documentation
  const currentModels = [
    // Sonar models (online)
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-sonar-huge-128k-online',
    // Chat models
    'llama-3.1-8b-instruct',
    'llama-3.1-70b-instruct',
    'llama-3.1-405b-instruct',
    // Alternative naming
    'sonar-small-online',
    'sonar-medium-online', 
    'sonar-large-online',
    // Codellama
    'codellama-70b-instruct',
    // Mixtral
    'mixtral-8x7b-instruct',
    'mixtral-8x22b-instruct'
  ];
  
  for (const model of currentModels) {
    console.log(`\n🔍 Testing: ${model}`);
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: 'Hello, respond with just "Hi"' }
          ],
          max_tokens: 5,
          temperature: 0.1
        })
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log(`✅ SUCCESS: ${model}`);
        console.log(`   Response: ${data.choices[0].message.content}`);
        console.log(`   Usage: ${JSON.stringify(data.usage || {})}`);
        
        // Found a working model! Now test with a DIY query
        console.log('\n🔨 Testing DIY query...');
        
        const diyResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { 
                role: 'user', 
                content: 'I want to renovate my bathroom. List the main categories of products I need (just the categories, not specific items).' 
              }
            ],
            max_tokens: 200,
            temperature: 0.7
          })
        });
        
        if (diyResponse.ok) {
          const diyData = await diyResponse.json();
          console.log('\n🛠️  DIY Categories Response:');
          console.log(diyData.choices[0].message.content);
          console.log('\n🎉 DIY Assistant is ready to work with model:', model);
          return model;
        }
        
        return model; // Return working model even if DIY test fails
        
      } else {
        try {
          const error = JSON.parse(responseText);
          console.log(`❌ ${model}: ${error.error?.message || 'Unknown error'}`);
        } catch (e) {
          console.log(`❌ ${model}: ${response.status} ${responseText}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${model}: Connection error - ${error.message}`);
    }
  }
  
  console.log('\n❌ No working models found. The API key might be invalid or expired.');
  console.log('\n💡 Please check:');
  console.log('1. API key is correct and active');
  console.log('2. Account has sufficient credits');
  console.log('3. Check Perplexity API documentation for current model names');
};

testCurrentModels();