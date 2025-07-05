#!/usr/bin/env node

/**
 * Test Perplexity models with correct naming
 */

const testModels = async () => {
  const apiKey = "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";
  
  // Try the current Perplexity model names as of 2024
  const modelsToTest = [
    'mistral-7b-instruct',
    'mixtral-8x7b-instruct',
    'codellama-34b-instruct',
    'llama-2-13b-chat',
    'llama-2-70b-chat',
    'sonar-small-chat',
    'sonar-medium-chat',
    'sonar-small-online',
    'sonar-medium-online',
    'pplx-7b-chat',
    'pplx-70b-chat',
    'pplx-7b-online',
    'pplx-70b-online'
  ];
  
  for (const model of modelsToTest) {
    console.log(`Testing model: ${model}`);
    
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
            { role: 'user', content: 'Hello' }
          ],
          max_tokens: 5
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model} WORKS: ${data.choices[0].message.content}`);
        
        // If we found a working model, let's test a DIY query
        console.log(`\n🔨 Testing DIY query with ${model}...`);
        
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
                content: 'I want to renovate my bathroom. What are the main products I need and estimated costs?' 
              }
            ],
            max_tokens: 500
          })
        });
        
        if (diyResponse.ok) {
          const diyData = await diyResponse.json();
          console.log('🛒 DIY Response:');
          console.log(diyData.choices[0].message.content);
        }
        
        return model; // Return the working model
      } else {
        const error = await response.text();
        console.log(`❌ ${model}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${model}: ${error.message}`);
    }
  }
  
  console.log('❌ No working models found');
};

testModels();