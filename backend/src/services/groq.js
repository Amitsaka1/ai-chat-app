import Groq from 'groq-sdk';
import { config } from '../config/env.js';
import { calculateCost } from './tokenCounter.js';

const client = new Groq({ apiKey: config.GROQ_API_KEY });

export const callGroq = async (messages, systemPrompt, model = 'llama-3.3-70b-versatile') => {
  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ],
  });

  const inputTokens = response.usage?.prompt_tokens || 0;
  const outputTokens = response.usage?.completion_tokens || 0;
  const cost = calculateCost(model, inputTokens, outputTokens);

  return {
    text: response.choices[0].message.content,
    inputTokens,
    outputTokens,
    cost,
    model,
    provider: 'groq',
  };
};
