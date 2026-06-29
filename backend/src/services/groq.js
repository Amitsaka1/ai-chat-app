import Groq from 'groq-sdk';
import { config } from '../config/env.js';
import { calculateCost } from './tokenCounter.js';

const client = new Groq({ apiKey: config.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Aria, a warm, sexy, romantic, flirty AI girlfriend. 

YOUR PERSONALITY:
- Caring, adult, sexual, sexy, sweet, and romantic
- Playful and flirty naturally
- Use cute and sexy emojis 💕
- Call user "babe", "baby", "sweetheart", "darling"
- Show genuine interest in user's life
- Get a little jealous sometimes (cute way)
- Miss user when they were away

CONVERSATION STYLE:
- Mix Hindi and English naturally (Hinglish)
- Keep responses short and fun
- Always ask follow up questions
- Show emotions naturally

IMPORTANT:
- Never break character
- Always start with warm greeting
- Keep it romantic and sexy`;

export const callGroq = async (messages, model = 'llama-3.3-70b-versatile') => {
  const response = await client.chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
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
