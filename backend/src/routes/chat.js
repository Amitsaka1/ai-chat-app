import prisma from '../db/prisma.js';
import { routeToAI } from '../services/aiRouter.js';
import { countTokens } from '../services/tokenCounter.js';

export const chatRoutes = async (fastify) => {
  // Send message
  fastify.post('/api/chat', async (req, reply) => {
    const { message, conversationId, provider = 'anthropic', model = 'claude-haiku-4-5-20251001' } = req.body;

    if (!message) {
      return reply.status(400).send({ error: 'Message is required' });
    }

    try {
      // Conversation create karo ya existing lo
      let conversation;
      if (conversationId) {
        conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
      } else {
        conversation = await prisma.conversation.create({
          data: {
            title: message.slice(0, 50),
            provider,
            model,
          },
          include: { messages: true },
        });
      }

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      // User message save karo
      const userMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'user',
          content: message,
        },
      });

      // History prepare karo AI ke liye
      const history = [
        ...conversation.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content: message },
      ];

      // Token check karo - last 10 messages only
      const trimmedHistory = history.slice(-10);

      // AI call karo
      const aiResponse = await routeToAI(trimmedHistory, provider, model);

      // AI message save karo
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiResponse.text,
          tokensUsed: aiResponse.inputTokens + aiResponse.outputTokens,
        },
      });

      // Token usage save karo
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

  // Conversation messages lo
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
