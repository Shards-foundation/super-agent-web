import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAgents, getAgentById } from "../db";
import { TRPCError } from "@trpc/server";

export const agentsRouter = router({
  // Get all agents with their current status
  list: publicProcedure
    .query(async () => {
      try {
        return await getAgents();
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch agents",
        });
      }
    }),

  // Get specific agent details
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const agent = await getAgentById(input.id);
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found",
          });
        }
        return agent;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch agent",
        });
      }
    }),

  // Get agent statistics
  getStats: publicProcedure
    .query(async () => {
      try {
        const agents = await getAgents();
        const stats = {
          totalAgents: agents.length,
          activeAgents: agents.filter(a => a.status === "busy").length,
          idleAgents: agents.filter(a => a.status === "idle").length,
          errorAgents: agents.filter(a => a.status === "error").length,
          totalTasksCompleted: agents.reduce((sum, a) => sum + (a.tasksCompleted || 0), 0),
          averageSuccessRate: agents.length > 0 
            ? agents.reduce((sum, a) => sum + parseFloat(a.successRate?.toString() || "0"), 0) / agents.length
            : 0,
        };
        return stats;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch agent statistics",
        });
      }
    }),
});
