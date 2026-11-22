import { z } from 'zod';

const attachmentSchema = z.object({
  type: z.string().max(100),
  data: z.string().max(5_000_000),
});

const chatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'assistant']),
  content: z.string().max(10000),
  attachments: z.array(attachmentSchema).optional(),
}).refine((message) => message.content.length > 0 || (message.attachments?.length ?? 0) > 0, {
  message: 'Message content or an attachment is required',
  path: ['content'],
});

export const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100),
  systemPrompt: z.string().max(20000).optional(),
  jurisdiction: z.string().max(20).optional(),
  sourcesEnabled: z.boolean().optional(),
  task: z.enum(['title', 'chat']).optional(),
});
