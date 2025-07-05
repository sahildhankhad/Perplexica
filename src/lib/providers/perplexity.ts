import { ChatOpenAI } from '@langchain/openai';
import { getPerplexityApiKey } from '../config';

export const loadPerplexityChatModels = async () => {
  const apiKey = getPerplexityApiKey();

  if (!apiKey) return {};

  try {
    const chatModels = {
      'sonar': {
        displayName: 'Sonar (Recommended)',
        model: new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'sonar',
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.perplexity.ai',
          },
        }),
      },
      'pplx': {
        displayName: 'PPLX',
        model: new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'pplx',
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.perplexity.ai',
          },
        }),
      },
      'mixtral': {
        displayName: 'Mixtral',
        model: new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'mixtral',
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.perplexity.ai',
          },
        }),
      },
      'mistral': {
        displayName: 'Mistral',
        model: new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'mistral',
          temperature: 0.7,
          configuration: {
            baseURL: 'https://api.perplexity.ai',
          },
        }),
      },
    };

    return chatModels;
  } catch (err) {
    console.error(`Error loading Perplexity models: ${err}`);
    return {};
  }
};

export const PROVIDER_INFO = {
  displayName: 'Perplexity',
  icon: 'PerplexityIcon',
};

// Note: Perplexity doesn't provide embedding models, so we'll use OpenAI embeddings