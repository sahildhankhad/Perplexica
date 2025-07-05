#!/usr/bin/env node

/**
 * Test available Perplexity models
 */

const testModels = async () => {
  const apiKey = "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";
  
  // According to Perplexity docs, let's try the correct model names
  const modelsToTest = [
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-sonar-large-128k-online', 
    'llama-3.1-sonar-huge-128k-online',
    'sonar-small-online',
    'sonar-medium-online',
    'sonar-large-online',
    'llama-3.1-8b-instruct',
    'llama-3.1-70b-instruct'
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
        console.log(`✅ ${model}: ${data.choices[0].message.content}`);
        break; // Found a working model, stop testing
      } else {
        const error = await response.text();
        console.log(`❌ ${model}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${model}: ${error.message}`);
    }
  }
};

testModels();