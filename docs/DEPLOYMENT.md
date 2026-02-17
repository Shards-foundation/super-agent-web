# Super Agent Dashboard - Deployment & Operations Guide

**Version**: 1.0.0  
**Date**: February 2026  
**Author**: Manus AI

---

## 1. Pre-Deployment Checklist

### 1.1 Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm check`)
- [ ] ESLint passing (`pnpm lint`)
- [ ] Code coverage > 80%
- [ ] Security scan passed
- [ ] Dependencies up to date

### 1.2 Documentation

- [ ] README updated
- [ ] API documentation current
- [ ] Architecture documented
- [ ] Deployment steps documented
- [ ] Rollback procedure documented

### 1.3 Infrastructure

- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Load balancer configured
- [ ] CDN configured

### 1.4 Security

- [ ] Security audit passed
- [ ] Secrets rotated
- [ ] API keys secured
- [ ] Database encrypted
- [ ] Backups encrypted
- [ ] Access logs enabled

---

## 2. Deployment Environments

### 2.1 Development

**URL**: http://localhost:3000  
**Database**: Local MySQL  
**Updates**: Continuous  
**Monitoring**: Basic

### 2.2 Staging

**URL**: https://staging.example.com  
**Database**: Staging MySQL  
**Updates**: Weekly  
**Monitoring**: Full

### 2.3 Production

**URL**: https://app.example.com  
**Database**: Production MySQL (replicated)  
**Updates**: Monthly  
**Monitoring**: Full + Alerts

---

## 3. Deployment Methods

### 3.1 Docker Deployment

**Build Image**:
```bash
docker build -f config/docker/Dockerfile -t super-agent:latest .
```

**Run Container**:
```bash
docker run -d \
  --name super-agent \
  -p 3000:3000 \
  -e DATABASE_URL=mysql://user:pass@host/db \
  -e JWT_SECRET=your-secret \
  super-agent:latest
```

**Docker Compose**:
```bash
docker-compose -f config/docker/docker-compose.yml up -d
```

### 3.2 Kubernetes Deployment

**Create Deployment**:
```yaml
apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: super-agent\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: super-agent\n  template:\n    metadata:\n      labels:\n        app: super-agent\n    spec:\n      containers:\n      - name: super-agent\n        image: super-agent:latest\n        ports:\n        - containerPort: 3000\n        env:\n        - name: DATABASE_URL\n          valueFrom:\n            secretKeyRef:\n              name: super-agent-secrets\n              key: database-url\n```\n\n**Deploy**:\n```bash\nkubectl apply -f k8s/deployment.yaml\n```\n\n### 3.3 Manual Deployment

**SSH to Server**:
```bash\nssh deploy@production.example.com\n```\n\n**Pull Latest Code**:
```bash\ncd /app/super-agent-web\ngit pull origin main\n```\n\n**Install Dependencies**:
```bash\npnpm install --frozen-lockfile\n```\n\n**Build Application**:
```bash\npnpm build\n```\n\n**Restart Service**:
```bash\nsudo systemctl restart super-agent\n```\n\n---\n\n## 4. Database Migrations\n\n### 4.1 Generate Migration\n\n```bash\npnpm drizzle-kit generate\n```\n\nThis creates a new migration file in `drizzle/migrations/`.\n\n### 4.2 Review Migration\n\n```bash\ncat drizzle/migrations/0001_*.sql\n```\n\nReview the SQL to ensure it's correct.\n\n### 4.3 Apply Migration\n\n**Development**:\n```bash\npnpm drizzle-kit migrate\n```\n\n**Production**:\n```bash\n# Backup database first\nmysqldump -u user -p database > backup.sql\n\n# Apply migration\nDATABASE_URL=mysql://user:pass@host/db pnpm drizzle-kit migrate\n```\n\n### 4.4 Rollback Migration\n\n```bash\n# Restore from backup\nmysql -u user -p database < backup.sql\n```\n\n---\n\n## 5. Configuration Management\n\n### 5.1 Environment Variables\n\n**Production (.env.production)**:\n```env\nNODE_ENV=production\nDATABASE_URL=mysql://user:pass@prod-host/super_agent\nJWT_SECRET=your-production-secret\nVITE_APP_ID=your-app-id\nOAUTH_SERVER_URL=https://api.manus.im\nBUILT_IN_FORGE_API_URL=https://forge.manus.im\nBUILT_IN_FORGE_API_KEY=your-api-key\n```\n\n**Staging (.env.staging)**:\n```env\nNODE_ENV=staging\nDATABASE_URL=mysql://user:pass@staging-host/super_agent\nJWT_SECRET=your-staging-secret\n```\n\n### 5.2 Secrets Management\n\n**Using AWS Secrets Manager**:\n```bash\naws secretsmanager get-secret-value --secret-id super-agent/prod\n```\n\n**Using HashiCorp Vault**:\n```bash\nvault kv get secret/super-agent/prod\n```\n\n---\n\n## 6. Monitoring & Observability\n\n### 6.1 Application Metrics\n\n**Key Metrics**:\n- Request latency (p50, p95, p99)\n- Error rate\n- Request volume\n- Database query time\n- Cache hit rate\n\n**Collection**:\n```typescript\n// server/_core/metrics.ts\nimport prom from 'prom-client';\n\nconst httpDuration = new prom.Histogram({\n  name: 'http_request_duration_seconds',\n  help: 'Duration of HTTP requests in seconds',\n  labelNames: ['method', 'route', 'status_code'],\n});\n```\n\n### 6.2 Logging\n\n**Log Levels**:\n- ERROR: Critical issues\n- WARN: Warnings\n- INFO: General information\n- DEBUG: Debugging information\n\n**Centralized Logging**:\n```typescript\nimport winston from 'winston';\n\nconst logger = winston.createLogger({\n  transports: [\n    new winston.transports.Console(),\n    new winston.transports.File({ filename: 'error.log', level: 'error' }),\n    new winston.transports.File({ filename: 'combined.log' }),\n  ],\n});\n```\n\n### 6.3 Alerting\n\n**Alert Rules**:\n- Error rate > 1%\n- Response time > 5s (p95)\n- Database connection pool exhausted\n- Disk space < 10%\n- Memory usage > 90%\n\n**Notification Channels**:\n- Slack\n- PagerDuty\n- Email\n- SMS (critical)\n\n---\n\n## 7. Backup & Recovery\n\n### 7.1 Backup Strategy\n\n**Frequency**:\n- Hourly: Last 24 hours\n- Daily: Last 30 days\n- Weekly: Last 90 days\n- Monthly: Last 1 year\n\n**Backup Script**:\n```bash\n#!/bin/bash\nBACKUP_DIR=\"/backups/super-agent\"\nDATE=$(date +%Y%m%d_%H%M%S)\n\nmysqldump -u user -p database | gzip > $BACKUP_DIR/backup_$DATE.sql.gz\n\n# Upload to S3\naws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://backups/super-agent/\n\n# Cleanup old backups\nfind $BACKUP_DIR -mtime +30 -delete\n```\n\n### 7.2 Recovery Procedure\n\n**RTO (Recovery Time Objective)**: 4 hours  \n**RPO (Recovery Point Objective)**: 1 hour\n\n**Steps**:\n1. Identify backup to restore\n2. Provision new database instance\n3. Restore backup\n4. Verify data integrity\n5. Update connection strings\n6. Restart application\n7. Run smoke tests\n\n---\n\n## 8. Scaling\n\n### 8.1 Horizontal Scaling\n\n**Add More Servers**:\n```bash\n# Add new app server\ndocker run -d --name super-agent-2 super-agent:latest\n\n# Add to load balancer\naws elb register-instances-with-load-balancer \\\n  --load-balancer-name super-agent-lb \\\n  --instances i-1234567890abcdef0\n```\n\n### 8.2 Vertical Scaling\n\n**Increase Resources**:\n- CPU: Increase instance type\n- Memory: Increase instance type\n- Storage: Add more disk space\n- Database: Upgrade instance class\n\n### 8.3 Database Optimization\n\n**Read Replicas**:\n```sql\n-- Create read replica\nCREATE SERVER replica_server\n  FOREIGN DATA WRAPPER mysql\n  OPTIONS (HOST 'replica.example.com', USER 'user', PASSWORD 'pass', DATABASE 'super_agent');\n```\n\n**Caching**:\n```typescript\nimport redis from 'redis';\n\nconst client = redis.createClient({\n  host: 'redis.example.com',\n  port: 6379,\n});\n\n// Cache frequently accessed data\nawait client.set('agents:list', JSON.stringify(agents), 'EX', 3600);\n```\n\n---\n\n## 9. Incident Response\n\n### 9.1 Incident Classification\n\n| Severity | Impact | Response Time |\n|----------|--------|---------------|\n| **P1** | Service down | < 15 min |\n| **P2** | Degraded | < 1 hour |\n| **P3** | Minor | < 4 hours |\n| **P4** | Cosmetic | < 24 hours |\n\n### 9.2 Response Procedure\n\n```\n1. Detection\n   ↓\n2. Alerting\n   ↓\n3. Acknowledgment (< 5 min)\n   ↓\n4. Investigation (< 15 min)\n   ↓\n5. Mitigation (< 30 min)\n   ↓\n6. Resolution (< 4 hours)\n   ↓\n7. Communication\n   ↓\n8. Post-Mortem\n```\n\n### 9.3 Rollback Procedure\n\n**Quick Rollback**:\n```bash\n# Revert to previous version\ngit revert HEAD\npnpm build\ndocker build -t super-agent:rollback .\ndocker run -d --name super-agent-rollback super-agent:rollback\n```\n\n---\n\n## 10. Performance Optimization\n\n### 10.1 Database Optimization\n\n```sql\n-- Add indexes\nCREATE INDEX idx_agents_status ON agents(status);\nCREATE INDEX idx_tasks_status ON tasks(status);\nCREATE INDEX idx_chat_sessions_user ON chatSessions(userId, createdAt);\n\n-- Analyze query performance\nEXPLAIN SELECT * FROM agents WHERE status = 'idle';\n```\n\n### 10.2 Application Optimization\n\n```typescript\n// Batch database queries\nconst agents = await db.select().from(agents).limit(100);\n\n// Use connection pooling\nconst pool = mysql.createPool({\n  connectionLimit: 10,\n  host: process.env.DB_HOST,\n  user: process.env.DB_USER,\n  password: process.env.DB_PASSWORD,\n  database: process.env.DB_NAME,\n});\n```\n\n---\n\n## 11. Maintenance Windows\n\n### 11.1 Scheduled Maintenance\n\n**Frequency**: Monthly (first Sunday, 2-4 AM UTC)  \n**Activities**:\n- Database optimization\n- Dependency updates\n- Security patches\n- Performance tuning\n\n**Notification**:\n```\nScheduled maintenance window: Sunday 2-4 AM UTC\nExpected downtime: 30 minutes\nServices affected: All\n```\n\n---\n\n## 12. Compliance & Auditing\n\n### 12.1 Audit Logging\n\n```typescript\n// Log all sensitive operations\nawait auditLog({\n  action: 'user_login',\n  userId: user.id,\n  timestamp: new Date(),\n  ipAddress: req.ip,\n  userAgent: req.headers['user-agent'],\n});\n```\n\n### 12.2 Compliance Checks\n\n- GDPR: Data retention, right to deletion\n- SOC 2: Access controls, audit trails\n- HIPAA: Encryption, access logs (if applicable)\n\n---\n\n## References\n\n1. [Docker Documentation](https://docs.docker.com)\n2. [Kubernetes Documentation](https://kubernetes.io/docs)\n3. [MySQL Backup & Recovery](https://dev.mysql.com/doc/)\n4. [DevOps Best Practices](https://aws.amazon.com/devops/)\n\n---\n\n**Last Updated**: February 2026\n
