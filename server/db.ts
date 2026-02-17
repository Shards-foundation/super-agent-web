import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, chatSessions, chatMessages, agents, tasks, systemMetrics, models, knowledgeBase, generatedSkills } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Chat Session Queries
export async function createChatSession(userId: number, modelUsed: string, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chatSessions).values({
    userId,
    modelUsed,
    title: title || `Chat ${new Date().toLocaleDateString()}`,
  });
  return result;
}

export async function getChatSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.createdAt));
}

export async function addChatMessage(sessionId: number, role: "user" | "assistant" | "system", content: string, model?: string, tokensUsed?: number, cost?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const values: any = {
    sessionId,
    role,
    content,
  };
  if (model) values.model = model;
  if (tokensUsed) values.tokensUsed = tokensUsed;
  if (cost) values.cost = cost;
  
  return db.insert(chatMessages).values(values);
}

export async function getChatMessages(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
}

// Agent Queries
export async function getAgents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(agents).orderBy(agents.name);
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Task Queries
export async function getTasks(limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(tasks)
    .orderBy(desc(tasks.createdAt))
    .limit(limit);
}

export async function getTasksByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(tasks)
    .where(eq(tasks.status, status as any))
    .orderBy(desc(tasks.createdAt));
}

// Model Queries
export async function getModels() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(models).where(eq(models.isAvailable, true));
}

// System Metrics Queries
export async function getLatestMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(systemMetrics)
    .orderBy(desc(systemMetrics.timestamp))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMetricsHistory(hours: number = 24) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(systemMetrics)
    .orderBy(desc(systemMetrics.timestamp))
    .limit(hours);
}

// Knowledge Base Queries
export async function searchKnowledgeBase(query: string, limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(knowledgeBase)
    .orderBy(desc(knowledgeBase.accessCount))
    .limit(limit);
}

// Generated Skills Queries
export async function getGeneratedSkills(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (activeOnly) {
    return db.select().from(generatedSkills).where(eq(generatedSkills.isActive, true));
  }
  return db.select().from(generatedSkills);
}
