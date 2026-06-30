import { callClaude } from './anthropic.js';
import { callGroq } from './groq.js';

export const routeToAI = async (messages, systemPrompt, provider = 'groq', model = 'llama-3.3-70b-versatile') => {
  switch (provider) {
    case 'anthropic':
      return await callClaude(messages, systemPrompt, model);
    case 'groq':
      return await callGroq(messages, systemPrompt, model);
    default:
      return await callGroq(messages, systemPrompt, model);
  }
};
