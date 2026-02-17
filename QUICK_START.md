# Super Agent Dashboard - Quick Start Reference

## 🚀 Start in 30 Seconds

```bash
cd /home/ubuntu/super-agent-web
pnpm dev
# Open: https://3000-i5gjla8wna70eult1sqnx-f9f33c2b.us2.manus.computer
```

---

## 📋 Essential Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm test             # Run tests
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm drizzle-kit generate    # Generate migrations
pnpm drizzle-kit migrate     # Apply migrations

# Code Quality
pnpm check            # TypeScript check
pnpm format           # Format code
```

---

## 🔌 API Quick Reference

### Chat
```typescript
// Create session
trpc.chat.createSession.useMutation({ modelUsed, title })

// Send message
trpc.chat.sendMessage.useMutation({ sessionId, message, model })

// Get messages
trpc.chat.getMessages.useQuery({ sessionId })

// List sessions
trpc.chat.getSessions.useQuery()

// Available models
trpc.chat.getAvailableModels.useQuery()
```

### Agents
```typescript
// List agents
trpc.agents.list.useQuery()

// Get agent
trpc.agents.getById.useQuery({ id })

// Statistics
trpc.agents.getStats.useQuery()
```

### Tasks
```typescript
// List tasks
trpc.tasks.list.useQuery({ limit, status })

// Statistics
trpc.tasks.getStats.useQuery()
```

### Metrics
```typescript
// Latest metrics
trpc.metrics.getLatest.useQuery()

// History
trpc.metrics.getHistory.useQuery({ hours })

// Model metrics
trpc.metrics.getModelMetrics.useQuery()

// Cost breakdown
trpc.metrics.getCostBreakdown.useQuery()
```

---

## 📁 Project Structure

```
super-agent-web/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   └── App.tsx           # Routes
│   └── index.html
├── server/                    # Express backend
│   ├── routers/              # tRPC routers
│   │   ├── chat.ts
│   │   ├── agents.ts
│   │   ├── tasks.ts
│   │   └── metrics.ts
│   ├── db.ts                 # Database helpers
│   ├── routers.ts            # Main router
│   └── _core/                # Framework code
├── drizzle/                  # Database schema
│   ├── schema.ts
│   └── migrations/
├── SKILLS.md                 # Detailed guide
├── USAGE.md                  # Usage examples
└── QUICK_START.md           # This file
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `agents` | Autonomous agent registry |
| `tasks` | Task queue and history |
| `chatSessions` | Conversation sessions |
| `chatMessages` | Individual messages |
| `models` | Available LLM models |
| `systemMetrics` | Performance metrics |
| `knowledgeBase` | Learned information |
| `generatedSkills` | Self-improved capabilities |

---

## 🤖 Available Models

| Model | Provider | Context | Cost/1K |
|-------|----------|---------|---------|
| Kimi K2 | Moonshot | 256K | $0.0008 |
| DeepSeek Coder | DeepSeek | 128K | $0.0005 |
| Qwen Turbo | Alibaba | 32K | $0.0003 |
| MiniMax M2 | MiniMax | 200K | $0.0006 |
| GPT-4 Turbo | OpenAI | 128K | $0.001 |

---

## 🔑 Environment Variables

```env
DATABASE_URL=mysql://user:pass@host/db
JWT_SECRET=your-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-key
```

---

## 💡 Common Patterns

### Create Chat & Send Message
```typescript
const session = await trpc.chat.createSession.mutate({
  modelUsed: "kimi-k2"
});

const response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "Your prompt",
  model: "kimi-k2"
});
```

### Monitor Agents
```typescript
const stats = await trpc.agents.getStats.query();
console.log(`Active: ${stats.activeAgents}/${stats.totalAgents}`);
```

### Track Costs
```typescript
const metrics = await trpc.metrics.getLatest.query();
console.log(`Spent: $${metrics.totalCostUSD}`);
```

### View Tasks
```typescript
const tasks = await trpc.tasks.list.query({ status: "running" });
console.log(`Running: ${tasks.length} tasks`);
```

---

## 🧪 Testing

```typescript
// server/routers/chat.test.ts
import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("chat", () => {
  it("sends message", async () => {
    const caller = appRouter.createCaller({ user: { id: 1, role: "user" } });
    const result = await caller.chat.sendMessage({
      sessionId: 1,
      message: "test",
      model: "kimi-k2"
    });
    expect(result.response).toBeDefined();
  });
});
```

Run: `pnpm test`

---

## 🐛 Debugging

```bash
# Check TypeScript errors
pnpm check

# View server logs
tail -f .manus-logs/devserver.log

# View browser console
# Press F12 in browser

# Test API in console
const result = await trpc.agents.list.query();
console.log(result);
```

---

## 📊 Database Queries

```sql
-- View agents
SELECT id, name, status, successRate FROM agents;

-- View recent tasks
SELECT * FROM tasks ORDER BY createdAt DESC LIMIT 10;

-- View chat sessions
SELECT * FROM chatSessions WHERE userId = 1;

-- View system health
SELECT * FROM systemMetrics ORDER BY timestamp DESC LIMIT 1;

-- Check costs
SELECT name, totalCost FROM models ORDER BY totalCost DESC;
```

---

## 🚢 Deployment

```bash
# Create checkpoint
# (Automatic in Management UI)

# Build
pnpm build

# Deploy
# Click "Publish" button in Management UI
```

---

## 📚 Resources

- **SKILLS.md** - Detailed documentation
- **USAGE.md** - Usage examples
- **Drizzle ORM** - https://orm.drizzle.team
- **tRPC** - https://trpc.io
- **shadcn/ui** - https://ui.shadcn.com
- **Recharts** - https://recharts.org

---

## ⚡ Performance Tips

1. Use `.limit()` on queries
2. Batch related operations
3. Monitor token usage
4. Cache results with React Query
5. Use optimistic updates

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Database error | Check `DATABASE_URL` in .env |
| Model not found | Verify in `models` table |
| High costs | Check `getCostBreakdown` |
| Slow queries | Add `.limit()` |
| Auth failed | Check `VITE_APP_ID` |

---

## 📝 File Locations

- **Chat Router**: `server/routers/chat.ts`
- **Agents Router**: `server/routers/agents.ts`
- **Tasks Router**: `server/routers/tasks.ts`
- **Metrics Router**: `server/routers/metrics.ts`
- **Database Schema**: `drizzle/schema.ts`
- **Database Helpers**: `server/db.ts`
- **Frontend Home**: `client/src/pages/Home.tsx`

---

## 🎯 Next Steps

1. ✅ Start dev server
2. ✅ Sign in with Manus OAuth
3. ✅ Create chat session
4. ✅ Send first message
5. ✅ Monitor agents
6. ✅ Check metrics
7. ✅ Deploy to production

---

**Last Updated**: Feb 2026
**Version**: 1.0.0
