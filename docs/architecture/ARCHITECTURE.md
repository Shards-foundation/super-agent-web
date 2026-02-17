# Super Agent Dashboard - System Architecture

**Version**: 1.0.0  
**Date**: February 2026  
**Author**: Manus AI

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Chat UI      │  │ Dashboard    │  │ Analytics    │           │
│  │ Components   │  │ Components   │  │ Components   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (tRPC)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Chat Router  │  │ Agents       │  │ Tasks        │           │
│  │              │  │ Router       │  │ Router       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ Metrics      │  │ System       │                             │
│  │ Router       │  │ Router       │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ LLM Router   │  │ Agent        │  │ Task         │           │
│  │              │  │ Orchestrator │  │ Manager      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ Metrics      │  │ Knowledge    │                             │
│  │ Aggregator   │  │ Manager      │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Agent DAO    │  │ Task DAO     │  │ Chat DAO     │           │
│  │              │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ Model DAO    │  │ Metrics DAO  │                             │
│  │              │  │              │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MySQL Database (Drizzle ORM)               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ agents   │ │ tasks    │ │ chat*    │ │ models   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│  │  │ metrics  │ │ knowledge│ │ skills   │               │   │
│  │  └──────────┘ └──────────┘ └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ LLM APIs     │  │ Manus Auth   │  │ Forge API    │           │
│  │ (OpenAI,     │  │              │  │              │           │
│  │  Anthropic,  │  │              │  │              │           │
│  │  etc.)       │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Interaction Flow

```
User Request
    ↓
React Component
    ↓
tRPC Hook (useQuery/useMutation)
    ↓
tRPC Router Procedure
    ↓
Business Logic Layer
    ↓
Data Access Layer (DAO)
    ↓
Drizzle ORM Query
    ↓
MySQL Database
    ↓
Response → User Interface Update
```

---

## 2. Frontend Architecture

### 2.1 Directory Structure

```
client/
├── src/
│   ├── pages/              # Page-level components
│   │   ├── Home.tsx       # Dashboard
│   │   ├── Chat.tsx       # Chat interface
│   │   ├── Agents.tsx     # Agent monitoring
│   │   ├── Tasks.tsx      # Task queue
│   │   ├── Analytics.tsx  # Performance analytics
│   │   └── NotFound.tsx   # 404 page
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── ChatBox.tsx    # Chat component
│   │   ├── AgentCard.tsx  # Agent display
│   │   ├── MetricsCard.tsx# Metrics display
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Authentication
│   │   ├── useWebSocket.ts# WebSocket
│   │   ├── useMetrics.ts  # Metrics fetching
│   │   └── ...
│   ├── state/             # State management
│   │   ├── atoms.ts       # Jotai atoms
│   │   ├── selectors.ts   # Derived state
│   │   └── ...
│   ├── types/             # TypeScript types
│   │   ├── agent.ts       # Agent types
│   │   ├── task.ts        # Task types
│   │   ├── chat.ts        # Chat types
│   │   └── ...
│   ├── lib/               # Utilities
│   │   ├── trpc.ts        # tRPC client
│   │   ├── utils.ts       # Helper functions
│   │   └── ...
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
└── vite.config.ts         # Vite configuration
```

### 2.2 Component Architecture

**Page Components** (Route-level):
- Fetch data from tRPC
- Manage page-level state
- Compose feature components
- Handle navigation

**Feature Components** (Feature-level):
- Implement specific features
- Use custom hooks
- Manage feature state
- Compose UI components

**UI Components** (Reusable):
- shadcn/ui components
- Custom styled components
- Accessibility-focused
- No business logic

**Hooks** (Logic reuse):
- Data fetching (useQuery, useMutation)
- State management
- Side effects
- Custom logic

### 2.3 State Management

**Jotai Atoms** for global state:
```typescript
// atoms.ts
export const userAtom = atom<User | null>(null);
export const selectedModelAtom = atom<string>("kimi-k2");
export const chatSessionsAtom = atom<ChatSession[]>([]);
export const agentStatsAtom = atom<AgentStats | null>(null);
```

**React Query** for server state:
```typescript
// Automatic caching and synchronization
const { data: agents } = trpc.agents.list.useQuery();
const { data: metrics } = trpc.metrics.getLatest.useQuery();
```

---

## 3. Backend Architecture

### 3.1 Directory Structure

```
server/
├── routers/               # tRPC routers
│   ├── chat.ts           # Chat procedures
│   ├── agents.ts         # Agent procedures
│   ├── tasks.ts          # Task procedures
│   ├── metrics.ts        # Metrics procedures
│   └── index.ts          # Router composition
├── db.ts                 # Database helpers
├── schemas/              # Data schemas
│   ├── agent.ts          # Agent schema
│   ├── task.ts           # Task schema
│   ├── chat.ts           # Chat schema
│   └── ...
├── types/                # TypeScript types
│   ├── agent.ts          # Agent types
│   ├── task.ts           # Task types
│   └── ...
├── modules/              # Business logic
│   ├── llm/              # LLM integration
│   │   ├── router.ts     # Model routing
│   │   ├── providers.ts  # Provider configs
│   │   └── ...
│   ├── agents/           # Agent management
│   │   ├── orchestrator.ts
│   │   ├── registry.ts
│   │   └── ...
│   ├── tasks/            # Task management
│   │   ├── queue.ts
│   │   ├── executor.ts
│   │   └── ...
│   ├── metrics/          # Metrics aggregation
│   │   ├── aggregator.ts
│   │   ├── tracker.ts
│   │   └── ...
│   └── knowledge/        # Knowledge management
│       ├── manager.ts
│       ├── search.ts
│       └── ...
├── workflows/            # Business workflows
│   ├── chat-workflow.ts  # Chat processing
│   ├── task-workflow.ts  # Task execution
│   └── ...
├── _core/                # Framework code
│   ├── index.ts          # Server setup
│   ├── context.ts        # tRPC context
│   ├── llm.ts            # LLM helper
│   ├── trpc.ts           # tRPC setup
│   └── ...
└── routers.ts            # Main router
```

### 3.2 Data Flow

**Chat Message Processing**:
```
User sends message
    ↓
chat.sendMessage procedure
    ↓
Save user message to DB
    ↓
Build message history
    ↓
Call LLM via router
    ↓
Stream response
    ↓
Save assistant message to DB
    ↓
Return response to client
```

**Agent Task Execution**:
```
Task created
    ↓
Added to task queue
    ↓
Agent selected
    ↓
Task assigned to agent
    ↓
Agent executes task
    ↓
Results saved to DB
    ↓
Metrics updated
    ↓
WebSocket notification sent
```

---

## 4. Database Architecture

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ openId (UK)     │
│ name            │
│ email           │
│ role            │
│ createdAt       │
└─────────────────┘
        │
        ├─→ ┌──────────────────┐
        │   │ chatSessions     │
        │   ├──────────────────┤
        │   │ id (PK)          │
        │   │ userId (FK)      │
        │   │ modelUsed        │
        │   │ title            │
        │   │ messageCount     │
        │   │ totalTokensUsed  │
        │   │ totalCost        │
        │   │ createdAt        │
        │   └──────────────────┘
        │           │
        │           └─→ ┌──────────────────┐
        │               │ chatMessages     │
        │               ├──────────────────┤
        │               │ id (PK)          │
        │               │ sessionId (FK)   │
        │               │ role             │
        │               │ content          │
        │               │ model            │
        │               │ tokensUsed       │
        │               │ cost             │
        │               │ createdAt        │
        │               └──────────────────┘
        │
        └─→ ┌──────────────────┐
            │ agents           │
            ├──────────────────┤
            │ id (PK)          │
            │ name             │
            │ type             │
            │ status           │
            │ capabilities     │
            │ tasksCompleted   │
            │ successRate      │
            │ lastActiveAt     │
            └──────────────────┘
                    │
                    └─→ ┌──────────────────┐
                        │ tasks            │
                        ├──────────────────┤
                        │ id (PK)          │
                        │ agentId (FK)     │
                        │ title            │
                        │ status           │
                        │ priority         │
                        │ estimatedCost    │
                        │ actualCost       │
                        │ executionTimeMs  │
                        │ result           │
                        │ createdAt        │
                        └──────────────────┘

┌──────────────────┐
│ models           │
├──────────────────┤
│ id (PK)          │
│ name             │
│ provider         │
│ contextLength    │
│ costPer1kTokens  │
│ supportsVision   │
│ supportsStreaming│
│ isAvailable      │
│ totalUsageCount  │
│ totalTokensUsed  │
│ totalCost        │
│ averageLatencyMs │
└──────────────────┘

┌──────────────────┐
│ systemMetrics    │
├──────────────────┤
│ id (PK)          │
│ timestamp        │
│ successRate      │
│ responseTimeMs   │
│ totalTokensUsed  │
│ totalCostUSD     │
│ activeAgents     │
│ systemHealth     │
└──────────────────┘

┌──────────────────┐
│ knowledgeBase    │
├──────────────────┤
│ id (PK)          │
│ category         │
│ content          │
│ source           │
│ accessCount      │
│ lastAccessedAt   │
└──────────────────┘

┌──────────────────┐
│ generatedSkills  │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ implementation   │
│ performanceGain  │
│ generatedAt      │
│ isActive         │
│ usageCount       │
│ successRate      │
└──────────────────┘
```

### 4.2 Indexing Strategy

**Primary Indexes**:
- All primary keys (auto-indexed)
- Foreign keys for joins

**Secondary Indexes**:
- `agents.status` - for filtering by status
- `tasks.status` - for queue queries
- `chatSessions.userId` - for user queries
- `chatMessages.sessionId` - for message retrieval
- `systemMetrics.timestamp` - for time-range queries
- `models.isAvailable` - for active model queries

**Composite Indexes**:
- `(userId, createdAt)` on chatSessions
- `(agentId, status)` on tasks
- `(sessionId, createdAt)` on chatMessages

---

## 5. API Architecture

### 5.1 tRPC Router Structure

```typescript
// server/routers.ts
export const appRouter = router({
  auth: router({
    me: publicProcedure.query(...),
    logout: publicProcedure.mutation(...),
  }),
  chat: router({
    createSession: protectedProcedure.mutation(...),
    sendMessage: protectedProcedure.mutation(...),
    getMessages: protectedProcedure.query(...),
    getSessions: protectedProcedure.query(...),
    getAvailableModels: publicProcedure.query(...),
  }),
  agents: router({
    list: publicProcedure.query(...),
    getById: publicProcedure.query(...),
    getStats: publicProcedure.query(...),
  }),
  tasks: router({
    list: publicProcedure.query(...),
    getStats: publicProcedure.query(...),
  }),
  metrics: router({
    getLatest: publicProcedure.query(...),
    getHistory: publicProcedure.query(...),
    getModelMetrics: publicProcedure.query(...),
    getCostBreakdown: publicProcedure.query(...),
  }),
});
```

### 5.2 Request/Response Flow

```
Client Request
    ↓
tRPC Client Hook
    ↓
HTTP POST to /api/trpc/[procedure]
    ↓
tRPC Server Router
    ↓
Procedure Handler
    ↓
Business Logic
    ↓
Database Query
    ↓
Response Serialization (SuperJSON)
    ↓
HTTP Response
    ↓
React Query Cache Update
    ↓
Component Re-render
```

---

## 6. Real-Time Architecture

### 6.1 WebSocket Implementation

```typescript
// server/_core/websocket.ts
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const event = JSON.parse(data);
    
    // Broadcast updates
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
      }
    });
  });
});
```

### 6.2 Event Types

- **AgentStatusUpdate**: Agent status changed
- **TaskProgressUpdate**: Task execution progress
- **MetricsUpdate**: System metrics snapshot
- **ChatStreamUpdate**: Streaming chat response
- **ErrorNotification**: System error occurred

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
User Login
    ↓
Redirect to Manus OAuth
    ↓
User authenticates
    ↓
OAuth callback to /api/oauth/callback
    ↓
Create session cookie
    ↓
Redirect to dashboard
    ↓
Session cookie sent with each request
```

### 7.2 Authorization

- **Public Procedures**: No authentication required
- **Protected Procedures**: Requires valid session
- **Admin Procedures**: Requires admin role

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌─────────────────────────────────────────┐
│         Load Balancer (Manus)           │
└─────────────────────────────────────────┘
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
┌─────────────┐             ┌─────────────┐
│ App Server 1│             │ App Server 2│
│ (Node.js)   │             │ (Node.js)   │
└─────────────┘             └─────────────┘
    ↓                               ↓
    └───────────────┬───────────────┘
                    ↓
        ┌─────────────────────────┐
        │  MySQL Database Cluster │
        │  (Primary + Replicas)   │
        └─────────────────────────┘
```

### 8.2 Deployment Pipeline

```
Git Push
    ↓
GitHub Actions CI/CD
    ↓
Run Tests
    ↓
Build Docker Image
    ↓
Push to Registry
    ↓
Deploy to Staging
    ↓
Run E2E Tests
    ↓
Deploy to Production
    ↓
Health Checks
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

- Stateless API servers (can add more instances)
- Session storage in database (shared across instances)
- Database read replicas for analytics queries
- Cache layer for frequently accessed data

### 9.2 Vertical Scaling

- Database optimization (indexing, query optimization)
- Connection pooling (reduce database overhead)
- Caching strategies (Redis for hot data)
- Batch operations (reduce round-trips)

---

## 10. Monitoring & Observability

### 10.1 Logging

- Application logs: `.manus-logs/devserver.log`
- Browser console: `.manus-logs/browserConsole.log`
- Network requests: `.manus-logs/networkRequests.log`
- Session replay: `.manus-logs/sessionReplay.log`

### 10.2 Metrics

- Response time (p50, p95, p99)
- Error rate
- Request volume
- Database query performance
- Cache hit rate

### 10.3 Alerts

- High error rate (> 1%)
- Slow response time (> 5s)
- Database connection pool exhausted
- Disk space low
- Memory usage high

---

## 11. References

1. [React Architecture](https://react.dev/learn/thinking-in-react)
2. [tRPC Documentation](https://trpc.io)
3. [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
4. [Database Design](https://en.wikipedia.org/wiki/Database_design)
5. [Microservices Architecture](https://microservices.io/)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 2026 | Manus AI | Initial architecture |
