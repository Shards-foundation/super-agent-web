# Super Agent Dashboard - Testing Guide

**Version**: 1.0.0  
**Date**: February 2026  
**Author**: Manus AI

---

## 1. Testing Strategy

### 1.1 Testing Pyramid

```
        /\\
       /  \\
      / E2E \\         (10%)
     /______\\
     /      \\
    / Integ. \\       (20%)
   /________\\
   /        \\
  / Unit     \\      (70%)
 /____________\\
```

### 1.2 Test Types

| Type | Coverage | Speed | Cost |
|------|----------|-------|------|
| **Unit** | 70% | Fast | Low |
| **Integration** | 20% | Medium | Medium |
| **E2E** | 10% | Slow | High |

---

## 2. Unit Testing

### 2.1 Setup

**Framework**: Vitest  
**Location**: `tests/unit/`

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### 2.2 Example: Testing tRPC Procedure

```typescript
// tests/unit/routers/chat.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../../../server/routers';

describe('chat.sendMessage', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
  });

  it('should send message and get response', async () => {
    const result = await caller.chat.sendMessage({
      sessionId: 1,
      message: 'Hello, world!',
      model: 'kimi-k2',
    });

    expect(result).toBeDefined();
    expect(result.response).toBeDefined();
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(result.model).toBe('kimi-k2');
  });

  it('should validate message length', async () => {
    expect(async () => {
      await caller.chat.sendMessage({
        sessionId: 1,
        message: '', // Empty message
        model: 'kimi-k2',
      });
    }).rejects.toThrow();
  });

  it('should validate model selection', async () => {
    expect(async () => {
      await caller.chat.sendMessage({
        sessionId: 1,
        message: 'Hello',
        model: 'invalid-model' as any,
      });
    }).rejects.toThrow();
  });
});
```

### 2.3 Example: Testing Database Helpers

```typescript
// tests/unit/db.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getDb, upsertUser } from '../../../server/db';

describe('Database Helpers', () => {
  beforeEach(async () => {
    // Setup test database
  });

  afterEach(async () => {
    // Cleanup test database
  });

  it('should upsert user correctly', async () => {
    await upsertUser({
      openId: 'test-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });

    const user = await getUserByOpenId('test-123');
    expect(user).toBeDefined();
    expect(user?.name).toBe('Test User');
  });

  it('should update existing user', async () => {
    await upsertUser({
      openId: 'test-123',
      name: 'Original Name',
    });

    await upsertUser({
      openId: 'test-123',
      name: 'Updated Name',
    });

    const user = await getUserByOpenId('test-123');
    expect(user?.name).toBe('Updated Name');
  });
});
```

### 2.4 Example: Testing React Components

```typescript
// tests/unit/components/ChatBox.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatBox from '../../../client/src/components/ChatBox';

describe('ChatBox Component', () => {
  it('should render chat messages', () => {
    const messages = [
      { id: 1, role: 'user', content: 'Hello' },
      { id: 2, role: 'assistant', content: 'Hi there!' },
    ];

    render(<ChatBox messages={messages} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('should send message on submit', () => {
    const onSend = vi.fn();
    render(<ChatBox onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type your message...');
    const button = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    expect(onSend).toHaveBeenCalledWith('Test message');
  });

  it('should disable send button when input is empty', () => {
    render(<ChatBox />);

    const button = screen.getByText('Send');
    expect(button).toBeDisabled();
  });
});
```

---

## 3. Integration Testing

### 3.1 Setup

**Framework**: Vitest + Supertest  
**Location**: `tests/integration/`

```bash
# Run integration tests
pnpm test:integration

# Run specific test file
pnpm test:integration tests/integration/api.test.ts
```

### 3.2 Example: Testing API Endpoints

```typescript
// tests/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../../../server/_core/index';

describe('API Integration Tests', () => {
  let server: any;
  let agent: any;

  beforeAll(async () => {
    server = await createServer();
    agent = request.agent(server);
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Chat API', () => {
    it('should create chat session', async () => {
      const response = await agent
        .post('/api/trpc/chat.createSession')
        .send({
          modelUsed: 'kimi-k2',
          title: 'Test Session',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data).toHaveProperty('sessionId');
    });

    it('should send message and get response', async () => {
      const response = await agent
        .post('/api/trpc/chat.sendMessage')
        .send({
          sessionId: 1,
          message: 'Hello',
          model: 'kimi-k2',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.data).toHaveProperty('response');
      expect(response.body.result.data).toHaveProperty('tokensUsed');
    });
  });

  describe('Agents API', () => {
    it('should list agents', async () => {
      const response = await agent
        .post('/api/trpc/agents.list')
        .send({});

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.result.data)).toBe(true);
    });

    it('should get agent statistics', async () => {
      const response = await agent
        .post('/api/trpc/agents.getStats')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.result.data).toHaveProperty('totalAgents');
      expect(response.body.result.data).toHaveProperty('activeAgents');
    });
  });
});
```

### 3.3 Example: Testing Database Transactions

```typescript
// tests/integration/db-transactions.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../../../server/db';

describe('Database Transactions', () => {
  beforeEach(async () => {
    // Clear test data
  });

  it('should handle concurrent operations', async () => {
    const db = await getDb();

    const promises = Array.from({ length: 10 }, (_, i) =>
      db.insert(agents).values({
        name: `Agent ${i}`,
        type: 'executor',
        status: 'idle',
      })
    );

    await Promise.all(promises);

    const count = await db.select().from(agents);
    expect(count).toHaveLength(10);
  });

  it('should rollback on error', async () => {
    const db = await getDb();

    try {
      // This should fail
      await db.insert(agents).values({
        name: 'Test',
        // Missing required fields
      } as any);
    } catch (error) {
      expect(error).toBeDefined();
    }

    const count = await db.select().from(agents);
    expect(count).toHaveLength(0);
  });
});
```

---

## 4. End-to-End Testing

### 4.1 Setup

**Framework**: Playwright  
**Location**: `tests/e2e/`

```bash
# Run E2E tests
pnpm test:e2e

# Run in headed mode (see browser)
pnpm test:e2e --headed

# Debug mode
pnpm test:e2e --debug
```

### 4.2 Example: Testing User Workflows

```typescript
// tests/e2e/chat-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');

    // Login
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL('**/dashboard');
  });

  test('should create chat session and send message', async ({ page }) => {
    // Navigate to chat
    await page.click('a:has-text("Chat")');

    // Create session
    await page.click('button:has-text("New Chat")');
    await page.fill('input[placeholder="Session title"]', 'Test Chat');
    await page.click('button:has-text("Create")');

    // Send message
    await page.fill('textarea[placeholder="Type your message..."]', 'Hello, AI!');
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForSelector('text=Hello, AI!');
    await page.waitForSelector('[data-testid="assistant-message"]');

    // Verify response exists
    const response = await page.locator('[data-testid="assistant-message"]').first();
    expect(response).toBeDefined();
  });

  test('should switch between models', async ({ page }) => {
    // Navigate to chat
    await page.click('a:has-text("Chat")');

    // Select model
    await page.click('[data-testid="model-selector"]');
    await page.click('text=DeepSeek Coder');

    // Verify model selected
    const selectedModel = await page.locator('[data-testid="selected-model"]');
    await expect(selectedModel).toContainText('DeepSeek Coder');
  });

  test('should view chat history', async ({ page }) => {
    // Navigate to chat
    await page.click('a:has-text("Chat")');

    // View history
    await page.click('button:has-text("History")');

    // Verify sessions listed
    const sessions = await page.locator('[data-testid="chat-session"]');
    expect(await sessions.count()).toBeGreaterThan(0);
  });
});
```

### 4.3 Example: Testing Agent Monitoring

```typescript
// tests/e2e/agent-monitoring.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Agent Monitoring', () => {
  test('should display agent status', async ({ page }) => {
    await page.goto('http://localhost:3000/agents');

    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]');

    // Get agent count
    const agents = await page.locator('[data-testid="agent-card"]');
    const count = await agents.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should show agent details', async ({ page }) => {
    await page.goto('http://localhost:3000/agents');

    // Click on first agent
    await page.click('[data-testid="agent-card"]');

    // Verify details panel
    await page.waitForSelector('[data-testid="agent-details"]');

    const details = await page.locator('[data-testid="agent-details"]');
    expect(details).toContainText('Status');
    expect(details).toContainText('Tasks Completed');
    expect(details).toContainText('Success Rate');
  });
});
```

---

## 5. Performance Testing

### 5.1 Load Testing

```typescript
// tests/performance/load.test.ts
import { describe, it, expect } from 'vitest';
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m30s', target: 20 }, // Stay at 20
    { duration: '30s', target: 0 }, // Ramp down
  ],
};

export default function () {
  // Test chat endpoint
  const chatRes = http.post('http://localhost:3000/api/trpc/chat.sendMessage', {
    sessionId: 1,
    message: 'Hello',
    model: 'kimi-k2',
  });

  check(chatRes, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

---

## 6. Security Testing

### 6.1 Input Validation Testing

```typescript
// tests/security/input-validation.test.ts
import { describe, it, expect } from 'vitest';
import { appRouter } from '../../../server/routers';

describe('Input Validation Security', () => {
  it('should reject SQL injection attempts', async () => {
    const caller = appRouter.createCaller({ user: null });

    expect(async () => {
      await caller.chat.sendMessage({
        sessionId: "1; DROP TABLE users;--" as any,
        message: 'test',
        model: 'kimi-k2',
      });
    }).rejects.toThrow();
  });

  it('should reject XSS payloads', async () => {
    const caller = appRouter.createCaller({ user: null });

    expect(async () => {
      await caller.chat.sendMessage({
        sessionId: 1,
        message: '<script>alert("XSS")</script>',
        model: 'kimi-k2',
      });
    }).rejects.toThrow();
  });

  it('should enforce message length limits', async () => {
    const caller = appRouter.createCaller({ user: null });

    const longMessage = 'a'.repeat(10001);

    expect(async () => {
      await caller.chat.sendMessage({
        sessionId: 1,
        message: longMessage,
        model: 'kimi-k2',
      });
    }).rejects.toThrow();
  });
});
```

---

## 7. Test Coverage

### 7.1 Coverage Goals

| Category | Target |
|----------|--------|
| **Statements** | 80% |
| **Branches** | 75% |
| **Functions** | 80% |
| **Lines** | 80% |

### 7.2 Generating Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html
```

---

## 8. Test Data Management

### 8.1 Fixtures

```typescript
// tests/fixtures/data.ts
export const mockUser = {
  id: 1,
  openId: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export const mockAgent = {
  id: 1,
  name: 'Test Agent',
  type: 'executor' as const,
  status: 'idle' as const,
  capabilities: ['execute', 'analyze'],
  tasksCompleted: 100,
  successRate: 95.5,
  lastActiveAt: new Date(),
  averageLatencyMs: 250,
  metadata: {},
};

export const mockChatSession = {
  id: 1,
  userId: 1,
  modelUsed: 'kimi-k2',
  title: 'Test Chat',
  messageCount: 5,
  totalTokensUsed: 1000,
  totalCost: 0.001,
  createdAt: new Date(),
};
```

---

## 9. Continuous Integration

### 9.1 GitHub Actions Workflow

Tests run automatically on:
- Push to main/develop
- Pull requests
- Scheduled daily at 2 AM UTC

### 9.2 Test Reports

- Coverage reports uploaded to Codecov
- Test results visible in PR checks
- Failed tests block merge

---

## 10. Best Practices

### 10.1 Writing Tests

- **Descriptive names**: Clearly describe what is being tested
- **Single responsibility**: Each test tests one thing
- **Arrange-Act-Assert**: Clear test structure
- **No side effects**: Tests should be independent
- **Deterministic**: Same result every run

### 10.2 Test Organization

```
tests/
├── unit/
│   ├── routers/
│   ├── db/
│   ├── components/
│   └── hooks/
├── integration/
│   ├── api/
│   ├── db/
│   └── workflows/
├── e2e/
│   ├── chat-workflow.spec.ts
│   ├── agent-monitoring.spec.ts
│   └── analytics.spec.ts
├── security/
│   ├── input-validation.test.ts
│   └── auth.test.ts
├── performance/
│   └── load.test.ts
└── fixtures/
    └── data.ts
```

---

## 11. Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in vitest.config.ts
```typescript
export default defineConfig({
  test: {
    testTimeout: 10000, // 10 seconds
  },
});
```

### Issue: Database connection fails in tests

**Solution**: Use test database URL
```bash
DATABASE_URL=mysql://test:test@localhost/test_db pnpm test
```

### Issue: E2E tests fail intermittently

**Solution**: Add explicit waits
```typescript
await page.waitForSelector('[data-testid="element"]', { timeout: 5000 });
```

---

## References

1. [Vitest Documentation](https://vitest.dev)
2. [Playwright Documentation](https://playwright.dev)
3. [Testing Library](https://testing-library.com)
4. [Jest Best Practices](https://jestjs.io/docs/getting-started)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 2026 | Manus AI | Initial testing guide |
