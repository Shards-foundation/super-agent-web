import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Agent Management Tables
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  role: varchar("role", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["idle", "busy", "error", "paused"]).default("idle").notNull(),
  currentTaskId: int("currentTaskId"),
  capabilities: json("capabilities"),
  maxContextLength: int("maxContextLength").default(16000),
  tasksCompleted: int("tasksCompleted").default(0),
  totalTokensUsed: int("totalTokensUsed").default(0),
  averageResponseTime: decimal("averageResponseTime", { precision: 10, scale: 2 }).default("0"),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("100"),
  lastActivityAt: timestamp("lastActivityAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Task Management Tables
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  agentId: int("agentId"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "cancelled"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  input: json("input"),
  output: json("output"),
  error: text("error"),
  tokensUsed: int("tokensUsed").default(0),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 4 }).default("0"),
  actualCost: decimal("actualCost", { precision: 10, scale: 4 }).default("0"),
  executionTimeMs: int("executionTimeMs"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Chat History Tables
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  modelUsed: varchar("modelUsed", { length: 64 }).notNull(),
  totalTokensUsed: int("totalTokensUsed").default(0),
  totalCost: decimal("totalCost", { precision: 10, scale: 4 }).default("0"),
  messageCount: int("messageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  model: varchar("model", { length: 64 }),
  tokensUsed: int("tokensUsed"),
  cost: decimal("cost", { precision: 10, scale: 4 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Model Information Tables
export const models = mysqlTable("models", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  provider: varchar("provider", { length: 64 }).notNull(),
  contextLength: int("contextLength"),
  costPer1kInputTokens: decimal("costPer1kInputTokens", { precision: 10, scale: 6 }),
  costPer1kOutputTokens: decimal("costPer1kOutputTokens", { precision: 10, scale: 6 }),
  supportsVision: boolean("supportsVision").default(false),
  supportsStreaming: boolean("supportsStreaming").default(true),
  capabilities: json("capabilities"),
  isAvailable: boolean("isAvailable").default(true),
  totalUsageCount: int("totalUsageCount").default(0),
  totalTokensUsed: int("totalTokensUsed").default(0),
  totalCost: decimal("totalCost", { precision: 10, scale: 4 }).default("0"),
  averageLatencyMs: decimal("averageLatencyMs", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;

// System Metrics Tables
export const systemMetrics = mysqlTable("systemMetrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  totalTasksFailed: int("totalTasksFailed").default(0),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("100"),
  averageResponseTimeMs: decimal("averageResponseTimeMs", { precision: 10, scale: 2 }).default("0"),
  totalTokensUsed: int("totalTokensUsed").default(0),
  totalCostUSD: decimal("totalCostUSD", { precision: 12, scale: 4 }).default("0"),
  activeAgents: int("activeAgents").default(0),
  idleAgents: int("idleAgents").default(0),
  errorAgents: int("errorAgents").default(0),
  systemHealth: decimal("systemHealth", { precision: 5, scale: 2 }).default("100"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = typeof systemMetrics.$inferInsert;

// Knowledge Base Tables
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 64 }),
  embedding: json("embedding"),
  source: varchar("source", { length: 255 }),
  relevanceScore: decimal("relevanceScore", { precision: 5, scale: 2 }),
  accessCount: int("accessCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

// Generated Skills Tables
export const generatedSkills = mysqlTable("generatedSkills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  skillCode: text("skillCode"),
  generatedFrom: varchar("generatedFrom", { length: 255 }),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("0"),
  usageCount: int("usageCount").default(0),
  isActive: boolean("isActive").default(true),
  performanceMetrics: json("performanceMetrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedSkill = typeof generatedSkills.$inferSelect;
export type InsertGeneratedSkill = typeof generatedSkills.$inferInsert;