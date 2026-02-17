import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createChatSession, addChatMessage, getChatSessions, getChatMessages } from "../db";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

export const chatRouter = router({
  // Create a new chat session
  createSession: protectedProcedure
    .input(z.object({
      modelUsed: z.string(),
      title: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await createChatSession(ctx.user.id, input.modelUsed, input.title);
        return { sessionId: (result as any).insertId || 1 };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create chat session",
        });
      }
    }),

  // Get all chat sessions for the user
  getSessions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await getChatSessions(ctx.user.id);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions",
        });
      }
    }),

  // Get messages from a chat session
  getMessages: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        return await getChatMessages(input.sessionId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat messages",
        });
      }
    }),

  // Send a message and get AI response with streaming
  sendMessage: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      message: z.string(),
      model: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Add user message to database
        await addChatMessage(input.sessionId, "user", input.message, input.model);

        // Get conversation history for context
        const messages = await getChatMessages(input.sessionId);
        
        // Build messages array for LLM
        const llmMessages: any[] = messages.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));
        
        // Add current message
        llmMessages.push({
          role: "user" as const,
          content: input.message,
        });

        // Call LLM with streaming
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const content = response.choices[0]?.message?.content;
        const assistantMessage = typeof content === "string" ? content : "";
        
        // Calculate tokens used (approximate)
        const tokensUsed = Math.ceil(input.message.length / 4) + Math.ceil((assistantMessage || "").length / 4);
        
        // Save assistant response
        await addChatMessage(input.sessionId, "assistant", assistantMessage, input.model, tokensUsed);

        return {
          response: assistantMessage,
          tokensUsed,
          model: input.model,
        };
      } catch (error) {
        console.error("Chat error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process chat message",
        });
      }
    }),

  // Get available models for chat
  getAvailableModels: publicProcedure
    .query(async () => {
      return [
        {
          id: "kimi-k2",
          name: "Kimi K2",
          provider: "Moonshot",
          contextLength: 256000,
          costPer1kTokens: 0.0008,
          supportsVision: false,
        },
        {
          id: "deepseek-coder",
          name: "DeepSeek Coder",
          provider: "DeepSeek",
          contextLength: 128000,
          costPer1kTokens: 0.0005,
          supportsVision: false,
        },
        {
          id: "qwen-turbo",
          name: "Qwen Turbo",
          provider: "Alibaba",
          contextLength: 32000,
          costPer1kTokens: 0.0003,
          supportsVision: true,
        },
        {
          id: "minimax-m2",
          name: "MiniMax M2",
          provider: "MiniMax",
          contextLength: 200000,
          costPer1kTokens: 0.0006,
          supportsVision: false,
        },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: "OpenAI",
          contextLength: 128000,
          costPer1kTokens: 0.001,
          supportsVision: true,
        },
      ];
    }),
});
