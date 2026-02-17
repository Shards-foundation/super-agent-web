# Super Agent Dashboard - Usage Guide

## Getting Started in 5 Minutes

### Prerequisites
- Node.js 22+ with pnpm
- MySQL database
- Manus account for OAuth

### 1. Install Dependencies
```bash
cd /home/ubuntu/super-agent-web
pnpm install
```

### 2. Configure Environment
Create `.env.local` with your credentials:
```env
DATABASE_URL=mysql://user:password@localhost/super_agent
VITE_APP_ID=your-manus-app-id
JWT_SECRET=generate-random-secret-key
```

### 3. Start Development Server
```bash
pnpm dev
```

### 4. Access Dashboard
Open: `https://3000-i5gjla8wna70eult1sqnx-f9f33c2b.us2.manus.computer`

---

## Core Features

### 1. Real-Time Chat Interface
**Location**: `/chat` (coming soon)

**Features**:
- Multi-model selection (Kimi K2, DeepSeek, Qwen, MiniMax, GPT-4)
- Conversation history persistence
- Token usage tracking
- Cost monitoring per message
- Markdown rendering for AI responses
- Copy message functionality

**How to Use**:
```typescript
// Create a chat session
const session = await trpc.chat.createSession.mutate({
  modelUsed: "kimi-k2",
  title: "Analysis Session"
});

// Send a message
const response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "Analyze this dataset",
  model: "kimi-k2"
});

// Access conversation history
const messages = await trpc.chat.getMessages.query({
  sessionId: session.sessionId
});
```

### 2. Agent Orchestration Dashboard
**Location**: `/agents` (coming soon)

**Displays**:
- Total agents count
- Active/idle/error agent breakdown
- Agent status (busy, idle, error)
- Task completion rates
- Success rate per agent
- Average latency metrics

**How to Use**:
```typescript
// Get all agents
const agents = await trpc.agents.list.query();

// Get agent statistics
const stats = await trpc.agents.getStats.query();
console.log(`Active agents: ${stats.activeAgents}`);
console.log(`Success rate: ${stats.averageSuccessRate}%`);

// Get specific agent details
const agent = await trpc.agents.getById.query({ id: 1 });
```

### 3. Task Queue Monitor
**Location**: Dashboard home page

**Displays**:
- Task status distribution (pending, running, completed, failed)
- Total tasks and completion rate
- Average execution time
- Task costs
- Priority queue visualization

**How to Use**:
```typescript
// Get all tasks
const tasks = await trpc.tasks.list.query({ limit: 50 });

// Filter by status
const running = await trpc.tasks.list.query({ status: "running" });

// Get statistics
const stats = await trpc.tasks.getStats.query();
console.log(`Completed: ${stats.completed}`);
console.log(`Failed: ${stats.failed}`);
console.log(`Avg execution time: ${stats.averageExecutionTime}ms`);
```

### 4. System Health Metrics
**Location**: Dashboard home page

**Key Metrics**:
- **Success Rate**: Percentage of successful operations
- **Active Agents**: Currently executing tasks
- **Total Cost**: Cumulative spending on LLM calls
- **System Health**: Overall operational status (0-100%)
- **Response Time**: Average latency in milliseconds
- **Token Usage**: Cumulative tokens consumed

**How to Use**:
```typescript
// Get latest metrics
const metrics = await trpc.metrics.getLatest.query();
console.log(`Success rate: ${metrics.successRate}%`);
console.log(`Total cost: $${metrics.totalCostUSD}`);

// Get historical data
const history = await trpc.metrics.getHistory.query({ hours: 24 });

// Get model performance
const models = await trpc.metrics.getModelMetrics.query();

// Get cost breakdown
const costs = await trpc.metrics.getCostBreakdown.query();
```

### 5. Model Router & Selection
**Available Models**:
- **Kimi K2** (Moonshot): 256K context, $0.0008/1K tokens
- **DeepSeek Coder**: 128K context, $0.0005/1K tokens
- **Qwen Turbo** (Alibaba): 32K context, $0.0003/1K tokens
- **MiniMax M2**: 200K context, $0.0006/1K tokens
- **GPT-4 Turbo** (OpenAI): 128K context, $0.001/1K tokens

**How to Select**:
```typescript
// Get available models
const models = await trpc.chat.getAvailableModels.query();

// Use specific model
await trpc.chat.sendMessage.mutate({
  sessionId: 1,
  message: "Your prompt",
  model: "deepseek-coder" // Choose model
});
```

---

## Common Workflows

### Workflow 1: Analyze Data with Multiple Models
```typescript
// Create session
const session = await trpc.chat.createSession.mutate({
  modelUsed: "kimi-k2",
  title: "Data Analysis"
});

// Send to Kimi K2
let response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "Analyze this dataset: ...",
  model: "kimi-k2"
});
console.log("Kimi response:", response.response);

// Send same prompt to DeepSeek for comparison
response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "Analyze this dataset: ...",
  model: "deepseek-coder"
});
console.log("DeepSeek response:", response.response);
```

### Workflow 2: Monitor Agent Performance
```typescript
// Get agent statistics
const stats = await trpc.agents.getStats.query();
console.log(`Total agents: ${stats.totalAgents}`);
console.log(`Currently active: ${stats.activeAgents}`);
console.log(`Average success rate: ${stats.averageSuccessRate}%`);

// Get all agents
const agents = await trpc.agents.list.query();

// Check individual agent
const agent = agents[0];
console.log(`Agent: ${agent.name}`);
console.log(`Status: ${agent.status}`);
console.log(`Tasks completed: ${agent.tasksCompleted}`);
console.log(`Success rate: ${agent.successRate}%`);
```

### Workflow 3: Track Costs
```typescript
// Get cost breakdown by model
const costs = await trpc.metrics.getCostBreakdown.query();
costs.forEach(item => {
  console.log(`${item.model}: $${item.cost} (${item.usage} uses)`);
});

// Get latest metrics
const metrics = await trpc.metrics.getLatest.query();
console.log(`Total spent: $${metrics.totalCostUSD}`);
console.log(`Tokens used: ${metrics.totalTokensUsed}`);

// Historical analysis
const history = await trpc.metrics.getHistory.query({ hours: 24 });
console.log(`Last 24 hours: ${history.length} snapshots`);
```

### Workflow 4: View Task Progress
```typescript
// Get all tasks
const tasks = await trpc.tasks.list.query({ limit: 100 });

// Filter running tasks
const running = tasks.filter(t => t.status === "running");
console.log(`Currently running: ${running.length} tasks`);

// Get statistics
const stats = await trpc.tasks.getStats.query();
console.log(`Completed: ${stats.completed}`);
console.log(`Failed: ${stats.failed}`);
console.log(`Success rate: ${(stats.completed / stats.total * 100).toFixed(1)}%`);
console.log(`Total cost: $${stats.totalCost}`);
```

---

## Database Management

### View Tables
```bash
# Connect to MySQL
mysql -u user -p database_name

# List all tables
SHOW TABLES;

# View agents
SELECT id, name, status, successRate FROM agents;

# View recent tasks
SELECT id, title, status, actualCost FROM tasks ORDER BY createdAt DESC LIMIT 10;

# View chat sessions
SELECT id, userId, modelUsed, messageCount, totalCost FROM chatSessions;

# View system metrics
SELECT * FROM systemMetrics ORDER BY timestamp DESC LIMIT 1;
```

### Insert Test Data
```bash
# Add test agent
INSERT INTO agents (name, type, status, successRate, tasksCompleted)
VALUES ('Test Agent', 'executor', 'idle', 95.5, 100);

# Add test task
INSERT INTO tasks (agentId, title, status, priority, estimatedCost)
VALUES (1, 'Test Task', 'pending', 'high', 0.05);

# Add test model
INSERT INTO models (name, provider, contextLength, costPer1kTokens, isAvailable)
VALUES ('Test Model', 'Test', 4096, 0.001, true);
```

---

## API Testing

### Using Browser Console
```javascript
// Test chat creation
const session = await trpc.chat.createSession.mutate({
  modelUsed: "kimi-k2",
  title: "Console Test"
});
console.log(session);

// Test message sending
const response = await trpc.chat.sendMessage.mutate({
  sessionId: session.sessionId,
  message: "Hello, how are you?",
  model: "kimi-k2"
});
console.log(response);

// Test agent query
const agents = await trpc.agents.list.query();
console.log(agents);
```

### Using cURL
```bash
# Get available models
curl -X POST http://localhost:3000/api/trpc/chat.getAvailableModels \
  -H "Content-Type: application/json"

# Get agent stats
curl -X POST http://localhost:3000/api/trpc/agents.getStats \
  -H "Content-Type: application/json"

# Get latest metrics
curl -X POST http://localhost:3000/api/trpc/metrics.getLatest \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### Issue: "Database not available"
**Solution**: Check DATABASE_URL in .env.local
```bash
# Test connection
mysql -u user -p -h host database_name
```

### Issue: "Model not found"
**Solution**: Verify model exists in database
```sql
SELECT * FROM models WHERE isAvailable = true;
```

### Issue: "Chat messages not saving"
**Solution**: Check database permissions
```sql
GRANT ALL PRIVILEGES ON database_name.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: "High token usage"
**Solution**: Monitor per-session usage
```typescript
const sessions = await trpc.chat.getSessions.query();
sessions.forEach(s => {
  console.log(`${s.title}: ${s.totalTokensUsed} tokens, $${s.totalCost}`);
});
```

---

## Performance Tips

1. **Batch Operations**: Group multiple queries together
2. **Use Limits**: Always add `.limit()` to avoid loading entire tables
3. **Cache Results**: Use React Query's built-in caching
4. **Monitor Costs**: Check metrics regularly to avoid overspending
5. **Optimize Prompts**: Shorter prompts use fewer tokens

---

## Next Steps

1. **Deploy to Production**: Click "Publish" button in Management UI
2. **Set Up Monitoring**: Configure alerts for high costs
3. **Add Custom Agents**: Extend with your own agent implementations
4. **Implement Real-Time Updates**: Add WebSocket for live metrics
5. **Build Analytics Dashboard**: Create visualization pages

---

## Support

For issues or questions:
1. Check SKILLS.md for detailed documentation
2. Review database schema in drizzle/schema.ts
3. Check server logs: `tail -f .manus-logs/devserver.log`
4. Test API endpoints directly in browser console
