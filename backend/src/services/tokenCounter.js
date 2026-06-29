export const countTokens = (messages) => {
  return messages.reduce((total, msg) => {
    return total + Math.ceil(msg.content.length / 4);
  }, 0);
};

export const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = {
    'claude-haiku-4-5': { input: 0.00025, output: 0.00125 },
    'claude-sonnet-4-6': { input: 0.003, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  };

  const rate = pricing[model] || { input: 0.003, output: 0.015 };
  return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
};
