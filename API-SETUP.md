# DIY Assistant - API Setup Guide

## Required APIs

### 1. Language Model API (Required)
**Recommended: Perplexity API** ✅
- **Why:** Best for DIY/shopping queries with real-time web access
- **Cost:** $0.20-5.00 per million tokens
- **Setup:** Get API key from https://www.perplexity.ai/settings/api

**Alternatives:**
- OpenAI API (GPT-4, GPT-3.5-turbo)
- Anthropic API (Claude)
- Google Gemini API
- Local Ollama models (free but requires powerful hardware)

### 2. Embedding Model API (Required)
**Recommended: OpenAI Embeddings**
- **Why:** Best quality and speed for search
- **Cost:** $0.02 per million tokens
- **Setup:** Get API key from https://platform.openai.com/api-keys

**Alternatives:**
- Google Gemini Embeddings
- Local transformers (free but slower)

### 3. Search Engine (Required)
**SearXNG** ✅ (Already configured)
- **Why:** Aggregates multiple search engines including shopping
- **Cost:** Free (self-hosted)
- **Setup:** Included in docker-compose

## Quick Setup (5 minutes)

### Step 1: Get API Keys

1. **Perplexity API Key**
   ```bash
   # Visit: https://www.perplexity.ai/settings/api
   # Sign up (if needed) and create API key
   # Copy the key starting with "pplx-"
   ```

2. **OpenAI API Key**
   ```bash
   # Visit: https://platform.openai.com/api-keys
   # Create new secret key
   # Copy the key starting with "sk-"
   ```

### Step 2: Configure Perplexica

1. **Copy Configuration**
   ```bash
   cp sample.config.toml config.toml
   ```

2. **Update config.toml**
   ```toml
   [MODELS.PERPLEXITY]
   API_KEY = "pplx-your-actual-api-key-here"
   
   [MODELS.OPENAI]
   API_KEY = "sk-your-openai-key-here"
   
   [API_ENDPOINTS]
   SEARXNG = "http://localhost:32768"
   ```

### Step 3: Test Setup

```bash
# Test your API configuration
node test-api-setup.js
```

### Step 4: Start Services

```bash
# Start SearXNG (search engine)
docker-compose up searxng -d

# Start Perplexica
npm run dev
```

## Model Recommendations

### For Testing & Development
- **Chat Model:** `llama-3.1-sonar-small-128k-online` (Fast, $0.20/M tokens)
- **Embedding:** `text-embedding-3-small` (Cheap, $0.02/M tokens)

### For Production
- **Chat Model:** `llama-3.1-sonar-large-128k-online` (Better quality, $1.00/M tokens)
- **Embedding:** `text-embedding-3-large` (Best quality, $0.13/M tokens)

## Cost Analysis

### Per DIY Query (Estimated)
- **Small Model:** ~$0.01-0.02 per query
- **Large Model:** ~$0.03-0.05 per query
- **Embeddings:** ~$0.001 per query

### Monthly Usage (100 queries)
- **Development:** ~$2-5/month
- **Production:** ~$5-10/month

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Double-check key in config.toml
   - Ensure no extra spaces
   - Verify key hasn't expired

2. **"SearXNG Connection Failed"**
   ```bash
   # Start SearXNG
   docker-compose up searxng
   
   # Check if running
   curl http://localhost:32768/search?q=test&format=json
   ```

3. **"Rate Limit Exceeded"**
   - Perplexity: Wait a minute, then retry
   - OpenAI: Check usage limits in dashboard

4. **No Shopping Results**
   - Verify SearXNG shopping engines are enabled
   - Check searxng/settings.yml configuration

### Test Commands

```bash
# Test Perplexity API
curl -X POST "https://api.perplexity.ai/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama-3.1-sonar-small-128k-online", "messages": [{"role": "user", "content": "Hello"}]}'

# Test SearXNG
curl "http://localhost:32768/search?q=hammer&format=json&categories=shopping"
```

## Security Notes

- **Never commit API keys** to version control
- Store keys in config.toml (already in .gitignore)
- Use environment variables in production
- Rotate keys regularly

## Ready to Test!

Once setup is complete, test the DIY Assistant with:

1. **Select "DIY Assistant" focus mode**
2. **Try these queries:**
   - "I want to renovate my bathroom"
   - "Help me build a deck"
   - "I need to fix my kitchen sink"
   - "Planning a bedroom makeover"

You should see:
- ✅ Project analysis
- ✅ Product lists with real prices
- ✅ Budget breakdown
- ✅ Shopping list export
- ✅ Multiple retailer options