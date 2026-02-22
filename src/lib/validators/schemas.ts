import { z } from 'zod'

/** Schema para mensaje de chat (solo contenido). */
export const chatMessageSchema = z.object({
  content: z.string().min(1).max(50000),
})

/** Schema para título de conversación. */
export const conversationTitleSchema = z.string().min(1).max(200)

/** Schema para email (básico). */
export const emailSchema = z.string().email()

/** Schema para nombre de usuario (opcional, 2-50 caracteres). */
export const userNameSchema = z.string().min(2).max(50).optional()

export type ChatMessageInput = z.infer<typeof chatMessageSchema>
export type ConversationTitle = z.infer<typeof conversationTitleSchema>
