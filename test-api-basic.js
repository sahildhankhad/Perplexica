#!/usr/bin/env node

/**
 * Test basic API access and get detailed error info
 */

const testAPI = async () => {
  const apiKey = "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";
  
  console.log('Testing Perplexity API basic access...\n');
  
  // First, let's try a minimal request to see what happens
  const minimalPayload = {
    model: "mistral-7b-instruct",
    messages: [{ role: "user", content: "Hi" }]
  };
  
  console.log('Payload:', JSON.stringify(minimalPayload, null, 2));
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log('\n📊 Response Details:');
    console.log('Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('Body:', responseText);
    
    if (responseText) {
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.error) {
          console.log('\n❌ Error Details:');
          console.log('Message:', jsonResponse.error.message);
          console.log('Type:', jsonResponse.error.type);
          console.log('Code:', jsonResponse.error.code);
          
          if (jsonResponse.error.message.includes('model')) {
            console.log('\n💡 This appears to be a model name issue.');
            console.log('Let me try to find the correct model names...');
            
            // Try to get models list if available
            const modelsResponse = await fetch('https://api.perplexity.ai/models', {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
              }
            });
            
            if (modelsResponse.ok) {
              const modelsData = await modelsResponse.text();
              console.log('Available models:', modelsData);
            } else {
              console.log('Could not fetch models list');
            }
          }
        }
      } catch (e) {
        console.log('Could not parse JSON response');
      }
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
  
  // Let's also try a different approach - check if this is actually a valid API key format
  console.log('\n🔍 API Key Analysis:');
  console.log('Length:', apiKey.length);
  console.log('Starts with pplx-:', apiKey.startsWith('pplx-'));
  console.log('Contains only valid chars:', /^[a-zA-Z0-9\-_]+$/.test(apiKey));
  
  // Try without model specification to see if that helps
  console.log('\n🔄 Trying without model...');
  try {
    const noModelResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hi" }]
      })
    });
    
    console.log('No-model response status:', noModelResponse.status);
    const noModelText = await noModelResponse.text();
    console.log('No-model response:', noModelText);
  } catch (error) {
    console.log('No-model request failed:', error.message);
  }
};

testAPI();