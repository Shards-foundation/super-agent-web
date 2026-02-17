# Super Agent Dashboard - Skills & Implementation Guide

## Overview

The Super Agent Dashboard is a comprehensive web-based control center for managing autonomous AI agents, orchestrating multi-model LLM interactions, and monitoring system performance in real-time. This guide provides step-by-step instructions for using and extending the system.

---

## Architecture Overview

### Technology Stack
- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui components
- **Backend**: Express 4 + tRPC 11 for type-safe API
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Real-time**: WebSocket support (ready to implement)
- **LLM Integration**: Multi-model support (Kimi K2, DeepSeek, Qwen, MiniMax, GPT-4)

### Database Schema

#### Core Tables

**agents** - Autonomous agent registry
```sql
- id: Primary key
- name: Agent identifier
- type: Agent category (orchestrator, executor, analyzer)
- status: Current state (idle, busy, error)
- capabilities: JSON array of supported operations
- tasksCompleted: Total completed tasks
- successRate: Percentage of successful tasks
- lastActiveAt: Last activity timestamp
- averageLatencyMs: Performance metric
- metadata: Additional configuration
```

**tasks** - Task queue and execution history
```sql
- id: Primary key
- agentId: Assigned agent
- title: Task description
- description: Detailed requirements
- status: pending, running, completed, failed, cancelled
- priority: Task urgency level
- estimatedCost: Predicted API costs
- actualCost: Actual incurred costs
- executionTimeMs: Duration in milliseconds
- result: Execution output
- errorMessage: Failure details
```

**chatSessions** - Conversation history
```sql
- id: Primary key
- userId: User who initiated chat
- modelUsed: LLM model identifier
- title: Session name
- messageCount: Total messages
- totalTokensUsed: Cumulative token usage
- totalCost: Session cost in USD
```

**chatMessages** - Individual messages
```sql
- id: Primary key
- sessionId: Parent session
- role: user, assistant, or system
- content: Message text
- model: Model used for response
- tokensUsed: Tokens consumed
- cost: Message cost
```

**models** - Available LLM models
```sql
- id: Model identifier
- name: Display name
- provider: Company (OpenAI, Anthropic, etc.)
- contextLength: Token limit
- costPer1kTokens: Pricing
- supportsVision: Boolean
- supportsStreaming: Boolean
- isAvailable: Active status
- totalUsageCount: Total invocations
- totalTokensUsed: Cumulative tokens
- totalCost: Total spending
- averageLatencyMs: Performance
```

**systemMetrics** - Performance tracking
```sql
- id: Primary key
- timestamp: Measurement time
- totalTasksCompleted: Cumulative count
- totalTasksFailed: Failure count
- successRate: Percentage
- averageResponseTimeMs: Latency
- totalTokensUsed: Token consumption
- totalCostUSD: Spending
- activeAgents: Currently busy
- idleAgents: Available
- errorAgents: Failed state
- systemHealth: Overall percentage
```

**knowledgeBase** - Learned information
```sql
- id: Primary key
- category: Topic classification
- content: Information text
- source: Origin reference
- accessCount: Usage frequency
- lastAccessedAt: Recent usage
- metadata: Additional data
```

**generatedSkills** - Self-improved capabilities
```sql
- id: Primary key
- name: Skill identifier
- description: What it does
- implementation: Code or logic
- performanceGain: Improvement percentage
- generatedAt: Creation time
- isActive: Enabled status
- usageCount: Times applied
- successRate: Effectiveness
```

---

## API Reference

### Chat Router (`trpc.chat.*`)

#### Create Chat Session
```typescript
trpc.chat.createSession.useMutation({
  modelUsed: "kimi-k2",
  title: "Analysis Session"
})
```

#### Send Message with AI Response
```typescript
trpc.chat.sendMessage.useMutation({
  sessionId: 1,
  message: "Analyze this data",
  model: "deepseek-coder"
})
// Returns: { response: string, tokensUsed: number, model: string }
```

#### Get Chat History
```typescript
trpc.chat.getMessages.useQuery({ sessionId: 1 })
// Returns: Message[] with full history
```

#### List Available Models
```typescript
trpc.chat.getAvailableModels.useQuery()
// Returns: Array of model configurations with pricing
```

### Agents Router (`trpc.agents.*`)

#### List All Agents
```typescript
trpc.agents.list.useQuery()
// Returns: Agent[] with current status
```

#### Get Agent Details
```typescript
trpc.agents.getById.useQuery({ id: 1 })
// Returns: Full agent configuration and metrics
```

#### Get Agent Statistics
```typescript
trpc.agents.getStats.useQuery()
// Returns: { totalAgents, activeAgents, idleAgents, errorAgents, totalTasksCompleted, averageSuccessRate }
```

### Tasks Router (`trpc.tasks.*`)

#### List Tasks
```typescript
trpc.tasks.list.useQuery({ limit: 50, status: "running" })
// Returns: Task[] filtered by status
```

#### Get Task Statistics
```typescript
trpc.tasks.getStats.useQuery()
// Returns: { total, pending, running, completed, failed, cancelled, totalCost, averageExecutionTime }
```

### Metrics Router (`trpc.metrics.*`)

#### Get Latest System Metrics
```typescript
trpc.metrics.getLatest.useQuery()
// Returns: Current system health snapshot
```

#### Get Historical Metrics
```typescript
trpc.metrics.getHistory.useQuery({ hours: 24 })
// Returns: Metrics[] for time period
```

#### Get Model Performance
```typescript
trpc.metrics.getModelMetrics.useQuery()
// Returns: Array with usage, cost, and latency per model
```

#### Get Cost Breakdown
```typescript
trpc.metrics.getCostBreakdown.useQuery()
// Returns: Cost analysis by model
```

---

## Frontend Components

### Available UI Components (shadcn/ui)
- `Card` - Container for content sections
- `Button` - Interactive actions
- `Input` - Text input fields
- `Select` - Dropdown menus
- `Dialog` - Modal windows
- `Tabs` - Tabbed interfaces
- `Badge` - Status indicators
- `Progress` - Progress bars
- `Skeleton` - Loading states

### Icons (lucide-react)
```typescript
import { Activity, Zap, TrendingUp, AlertCircle, MessageSquare, BarChart3, Cpu } from "lucide-react";
```

### Charts (recharts)
```typescript
import { BarChart, LineChart, PieChart, AreaChart } from "recharts";
```

---

## Implementation Workflows

### Adding a New Chat Feature

1. **Update Database Schema** (if needed)
   ```typescript
   // In drizzle/schema.ts
   export const featureTable = mysqlTable("feature", {
     id: int("id").autoincrement().primaryKey(),
     // ... columns
   });
   ```

2. **Generate Migration**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Apply Migration**
   ```bash
   # Read the SQL file and use webdev_execute_sql
   ```

4. **Add Database Helper** (server/db.ts)
   ```typescript
   export async function getFeatureData(id: number) {
     const db = await getDb();
     return db.select().from(featureTable).where(eq(featureTable.id, id));
   }
   ```

5. **Create tRPC Router** (server/routers/feature.ts)
   ```typescript
   export const featureRouter = router({
     get: publicProcedure
       .input(z.object({ id: z.number() }))
       .query(async ({ input }) => getFeatureData(input.id)),
   });
   ```

6. **Register Router** (server/routers.ts)
   ```typescript
   import { featureRouter } from "./routers/feature";
   export const appRouter = router({
     feature: featureRouter,
   });
   ```

7. **Create Frontend Component** (client/src/pages/Feature.tsx)
   ```typescript
   export default function Feature() {
     const { data } = trpc.feature.get.useQuery({ id: 1 });
     return <div>{/* Render data */}</div>;
   }
   ```

8. **Add Route** (client/src/App.tsx)
   ```typescript
   <Route path="/feature" component={Feature} />
   ```

### Integrating a New LLM Model

1. **Add Model to Database**
   ```typescript
   // Use webdev_execute_sql to insert
   INSERT INTO models (name, provider, contextLength, costPer1kTokens, supportsVision, supportsStreaming, isAvailable)
   VALUES ('Claude 3', 'Anthropic', 200000, 0.003, true, true, true);
   ```

2. **Update Chat Router** (server/routers/chat.ts)
   ```typescript
   // Add to getAvailableModels response
   {
     id: "claude-3",
     name: "Claude 3",
     provider: "Anthropic",
     contextLength: 200000,
     costPer1kTokens: 0.003,
     supportsVision: true,
   }
   ```

3. **Update LLM Invocation** (server/routers/chat.ts)
   ```typescript
   // The invokeLLM helper automatically routes based on model selection
   const response = await invokeLLM({
     messages: llmMessages,
     model: input.model, // Automatically routes to correct provider
   });
   ```

### Real-Time Updates with WebSocket

1. **Create WebSocket Handler** (server/_core/index.ts)
   ```typescript
   import { WebSocketServer } from 'ws';
   
   const wss = new WebSocketServer({ noServer: true });
   
   wss.on('connection', (ws) => {
     ws.on('message', (data) => {
       // Broadcast updates to all connected clients
       wss.clients.forEach(client => {
         if (client.readyState === WebSocket.OPEN) {
           client.send(JSON.stringify(update));
         }
       });
     });
   });
   ```

2. **Frontend WebSocket Hook** (client/src/hooks/useWebSocket.ts)
   ```typescript
   export function useWebSocket(url: string) {
     const [data, setData] = useState(null);
     
     useEffect(() => {
       const ws = new WebSocket(url);
       ws.onmessage = (event) => setData(JSON.parse(event.data));
       return () => ws.close();
     }, [url]);
     
     return data;
   }
   ```

3. **Use in Component**
   ```typescript
   const metrics = useWebSocket('ws://localhost:3000/metrics');
   ```

---

## Testing

### Unit Tests (Vitest)

```typescript
// server/routers/chat.test.ts
import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";

describe("chat router", () => {
  it("should send message and get response", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "user" },
    });
    
    const result = await caller.chat.sendMessage({
      sessionId: 1,
      message: "Hello",
      model: "kimi-k2",
    });
    
    expect(result.response).toBeDefined();
    expect(result.tokensUsed).toBeGreaterThan(0);
  });
});
```

Run tests:
```bash
pnpm test
```

---

## Deployment

### Environment Variables Required

```env
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
```

### Build & Deploy

```bash
# Build
pnpm build

# Start production server
pnpm start

# Or deploy to Manus
# Click "Publish" button in Management UI after creating checkpoint
```

---

## Performance Optimization

### Database Queries
- Use `.limit()` for large result sets
- Add `.orderBy()` for consistent pagination
- Index frequently queried columns

### Frontend Rendering
- Use `useMemo` for expensive computations
- Implement optimistic updates for mutations
- Lazy load components with `React.lazy()`

### API Calls
- Batch related queries when possible
- Use `invalidate` only when necessary
- Implement request debouncing for search

### Token Usage
- Monitor token consumption per model
- Set cost alerts in metrics
- Use shorter prompts for frequent queries

---

## Troubleshooting

### Common Issues

**Chat messages not saving**
- Check database connection: `DATABASE_URL` is set
- Verify `chatMessages` table exists: `SELECT * FROM chatMessages LIMIT 1;`
- Check server logs for errors

**Models not appearing**
- Ensure `isAvailable = true` in models table
- Verify model provider credentials are configured
- Check `BUILT_IN_FORGE_API_KEY` is valid

**High costs**
- Review `getCostBreakdown` to identify expensive models
- Implement token limits per session
- Use cheaper models for non-critical tasks

**Real-time updates lagging**
- Check WebSocket connection: `ws://localhost:3000/ws`
- Verify message frequency isn't overwhelming
- Implement client-side debouncing

---

## Extension Points

### Add Custom Agents
1. Create agent in database
2. Implement agent logic in separate service
3. Register with agent registry
4. Expose via `trpc.agents.execute` mutation

### Add Analytics Dashboard
1. Create new page component
2. Query metrics history
3. Render with recharts
4. Add real-time updates via WebSocket

### Add Agent-to-Agent Communication
1. Create message queue table
2. Implement routing logic
3. Add broadcast mechanism
4. Monitor via metrics dashboard

### Add Skill Learning System
1. Capture task execution patterns
2. Analyze success/failure rates
3. Generate new skills
4. Store in `generatedSkills` table
5. Apply in agent execution

---

## Quick Start

### 1. Start Development
```bash
cd /home/ubuntu/super-agent-web
pnpm dev
```

### 2. Access Dashboard
- Open: `https://3000-i5gjla8wna70eult1sqnx-f9f33c2b.us2.manus.computer`
- Sign in with Manus OAuth

### 3. Create First Chat Session
```typescript
// In browser console
const session = await trpc.chat.createSession.mutate({
  modelUsed: "kimi-k2",
  title: "My First Chat"
});
```

### 4. Send Message
```typescript
const response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "What can you help me with?",
  model: "kimi-k2"
});
```

### 5. Monitor Agents
```typescript
const stats = await trpc.agents.getStats.query();
console.log(`Active agents: ${stats.activeAgents}`);
```

---

## Support & Resources

- **Database**: Drizzle ORM docs at https://orm.drizzle.team
- **Frontend**: shadcn/ui at https://ui.shadcn.com
- **Backend**: tRPC docs at https://trpc.io
- **Charts**: Recharts at https://recharts.org
- **Icons**: Lucide React at https://lucide.dev

---

## Version History

- **v1.0.0** (Feb 2026): Initial release with core dashboard, chat, agents, tasks, and metrics routers
- Database schema with 8 tables for complete agent management
- Multi-model LLM support (Kimi K2, DeepSeek, Qwen, MiniMax, GPT-4)
- Real-time metrics and cost tracking
- OAuth authentication and user management
