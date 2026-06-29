import { callClaude } from './anthropic.js';
import { callGroq } from './groq.js';

export const routeToAI = async (messages, provider = 'groq', model = 'llama-3.3-70b-versatile') => {
  switch (provider) {
    case 'anthropic':
      return await callClaude(messages, model);
    case 'groq':
      return await callGroq(messages, model);
    default:
      return await callGroq(messages, model);
  }
};
