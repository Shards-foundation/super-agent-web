import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getTasks, getTasksByStatus } from "../db";
import { TRPCError } from "@trpc/server";

export const tasksRouter = router({
  // Get all tasks
  list: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
      status: z.string().optional(),
    }))
    .query(async ({ input }) => {
      try {
        if (input.status) {
          return await getTasksByStatus(input.status);
        }
        return await getTasks(input.limit);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tasks",
        });
      }
    }),

  // Get task statistics
  getStats: publicProcedure
    .query(async () => {
      try {
        const allTasks = await getTasks(1000);
        const stats = {
          total: allTasks.length,
          pending: allTasks.filter(t => t.status === "pending").length,
          running: allTasks.filter(t => t.status === "running").length,
          completed: allTasks.filter(t => t.status === "completed").length,
          failed: allTasks.filter(t => t.status === "failed").length,
          cancelled: allTasks.filter(t => t.status === "cancelled").length,
          totalCost: allTasks.reduce((sum, t) => sum + (parseFloat(t.actualCost?.toString() || "0")), 0),
          averageExecutionTime: allTasks.filter(t => t.executionTimeMs).length > 0
            ? allTasks.filter(t => t.executionTimeMs).reduce((sum, t) => sum + (t.executionTimeMs || 0), 0) / 
              allTasks.filter(t => t.executionTimeMs).length
            : 0,
        };
        return stats;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch task statistics",
        });
      }
    }),
});
