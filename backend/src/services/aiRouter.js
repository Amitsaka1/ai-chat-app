import { callClaude } from './anthropic.js';

export const routeToAI = async (messages, provider = 'anthropic', model = 'claude-haiku-4-5-20251001') => {
  switch (provider) {
    case 'anthropic':
      return await callClaude(messages, model);
    default:
      return await callClaude(messages, model);
  }
};
