import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { calculateCost } from './tokenCounter.js';

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

export const callClaude = async (messages, model = 'claude-haiku-4-5-20251001') => {
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: 'You are a helpful AI assistant.',
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost = calculateCost(model, inputTokens, outputTokens);

  return {
    text: response.content[0].text,
    inputTokens,
    outputTokens,
    cost,
    model,
    provider: 'anthropic',
  };
};
