import prisma from '../db/prisma.js';
import { routeToAI } from '../services/aiRouter.js';

export const chatRoutes = async (fastify) => {
  fastify.post('/api/chat', async (req, reply) => {
    const {
      message,
      conversationId,
      provider = 'groq',
      model = 'llama-3.3-70b-versatile',
      isStart = false,
      cardId,
      systemPrompt,
    } = req.body;

    try {
      let conversation;

      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
      } else {
        conversation = await prisma.conversation.create({
          data: {
            title: cardId || 'New Chat',
            provider,
            model,
          },
          include: { messages: true },
        });
      }

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      if (!isStart) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: 'user',
            content: message,
          },
        });
      }

      const history = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiInput = isStart
        ? [{ role: 'user', content: 'start the conversation naturally' }]
        : [...history, { role: 'user', content: message }];

      const trimmed = aiInput.slice(-10);

      const aiResponse = await routeToAI(trimmed, systemPrompt, provider, model);

      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.text,
          tokensUsed: aiResponse.inputTokens + aiResponse.outputTokens,
        },
      });

      await prisma.tokenUsage.create({
        data: {
          provider: aiResponse.provider,
          model: aiResponse.model,
          inputTokens: aiResponse.inputTokens,
          outputTokens: aiResponse.outputTokens,
          costUsd: aiResponse.cost,
        },
      });

      return reply.send({
        conversationId: conversation.id,
        message: {
          id: assistantMessage.id,
          role: 'assistant',
          content: aiResponse.text,
          tokensUsed: aiResponse.inputTokens + aiResponse.outputTokens,
        },
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  });

  fastify.get('/api/chat/:conversationId', async (req, reply) => {
    const { conversationId } = req.params;
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }
      return reply.send({ conversation });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Something went wrong' });
    }
  });
};
