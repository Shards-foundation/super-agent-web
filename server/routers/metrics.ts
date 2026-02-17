import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getLatestMetrics, getMetricsHistory, getModels } from "../db";
import { TRPCError } from "@trpc/server";

export const metricsRouter = router({
  // Get latest system metrics
  getLatest: publicProcedure
    .query(async () => {
      try {
        const metrics = await getLatestMetrics();
        if (!metrics) {
          return {
            totalTasksCompleted: 0,
            totalTasksFailed: 0,
            successRate: 100,
            averageResponseTimeMs: 0,
            totalTokensUsed: 0,
            totalCostUSD: 0,
            activeAgents: 0,
            idleAgents: 0,
            errorAgents: 0,
            systemHealth: 100,
          };
        }
        return metrics;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metrics",
        });
      }
    }),

  // Get metrics history
  getHistory: publicProcedure
    .input(z.object({
      hours: z.number().default(24),
    }))
    .query(async ({ input }) => {
      try {
        return await getMetricsHistory(input.hours);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch metrics history",
        });
      }
    }),

  // Get model performance metrics
  getModelMetrics: publicProcedure
    .query(async () => {
      try {
        const models = await getModels();
        return models.map(m => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          usageCount: m.totalUsageCount,
          totalTokensUsed: m.totalTokensUsed,
          totalCost: m.totalCost,
          averageLatencyMs: m.averageLatencyMs,
          contextLength: m.contextLength,
          supportsVision: m.supportsVision,
          supportsStreaming: m.supportsStreaming,
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch model metrics",
        });
      }
    }),

  // Get cost breakdown
  getCostBreakdown: publicProcedure
    .query(async () => {
      try {
        const models = await getModels();
        const breakdown = models.map(m => ({
          model: m.name,
          cost: parseFloat(m.totalCost?.toString() || "0"),
          usage: m.totalUsageCount,
        }));
        return breakdown;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch cost breakdown",
        });
      }
    }),
});
