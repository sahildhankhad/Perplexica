#!/usr/bin/env node

/**
 * Test with very simple model names
 */

const testSimpleModels = async () => {
  const apiKey = "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";
  
  // Try the most basic model names
  const simpleModels = [
    'gpt-3.5-turbo',
    'gpt-4',
    'claude-3-haiku',
    'claude-3-sonnet',
    'llama-3',
    'llama-3.1',
    'mixtral',
    'mistral',
    'sonar',
    'pplx',
    // Try without version numbers
    'llama-3-8b-instruct',
    'llama-3-70b-instruct',
    'mixtral-8x7b',
    'mistral-7b',
    // Try legacy names
    'llama-2-7b-chat',
    'llama-2-13b-chat',
    'llama-2-70b-chat'
  ];
  
  for (const model of simpleModels) {
    console.log(`Testing: ${model}`);
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS with ${model}: ${data.choices[0].message.content}`);
        return model;
      } else {
        const error = await response.text();
        // Don't log all errors, just try next model
        if (response.status !== 400) {
          console.log(`❌ ${model}: ${response.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${model}: ${error.message}`);
    }
  }
  
  console.log('\n⚠️  All simple model names failed.');
  console.log('\n🔍 Let me check the API key validation...');
  
  // Test if it's an auth issue
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer invalid-key`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'any-model',
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    const errorText = await response.text();
    console.log('Test with invalid key:', response.status, errorText);
    
    if (response.status === 401) {
      console.log('✅ API endpoint is working (invalid key gives 401)');
      console.log('❌ But our key gives 400, suggesting model name issues');
    }
  } catch (e) {
    console.log('Auth test failed:', e.message);
  }
  
  console.log('\n💡 Recommendations:');
  console.log('1. Check Perplexity API dashboard for account status');
  console.log('2. Verify the API key has the right permissions');
  console.log('3. Check if there are credits in the account');
  console.log('4. Look at Perplexity docs for current model names');
  console.log('\n🔗 Try visiting: https://docs.perplexity.ai/docs/getting-started');
};

testSimpleModels();