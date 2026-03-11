# Queue System Tutorial - Redis + BullMQ with Docker

## Overview

This tutorial explains how to set up a production-ready queue system using Redis and BullMQ running entirely in Docker containers. The system consists of three main components:

1. **API** - Your existing Hono API that enqueues jobs
2. **Redis** - Message broker and storage for queue data
3. **Worker** - Separate container that processes jobs from the queue

## Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌─────────────────┐
│   API Server    │────▶│    Redis    │◀────│  Worker         │
│   (Port 3000)   │     │  (Port 6379)│     │  Container      │
└─────────────────┘     └─────────────┘     └─────────────────┘
        │                       │                       │
        │ Adds jobs            │ Stores jobs          │ Processes jobs
        │ to queue             │ & progress           │ from queue
        └─────────────────────┴──────────────────────┘
```

## Files Created

### Source Files

| File | Purpose |
|------|---------|
| `src/queues/types.ts` | TypeScript interfaces for job data |
| `src/queues/connection.ts` | Redis connection configuration |
| `src/queues/index.ts` | Queue creation and job addition functions |
| `src/queues/worker.ts` | Worker setup and job processors |
| `src/jobs/email.ts` | Example email job handler |
| `src/jobs/workspace.ts` | Example workspace job handler |

### Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile.worker` | Multi-stage build for worker container |
| `docker-compose.override.yml` | Additional compose config for queues |
| `docker-compose.yml` | Updated with Redis service |

## Prerequisites

1. **Docker** - Install from https://www.docker.com/get-started
2. **Docker Compose** - Usually included with Docker Desktop

## Setup Instructions

### Step 1: Install Dependencies

```bash
bun install
```

This will install:
- `bullmq` - Queue management library
- `ioredis` - Redis client for Node.js

### Step 2: Start the Stack

To run the full stack with Redis and worker:

```bash
docker-compose up -d --build
```

This starts:
- **api** - Your Hono API on port 3000
- **db** - PostgreSQL on port 5432
- **redis** - Redis on port 6379
- **worker** - Queue worker (optional, see below)

### Step 3: Run Worker Separately (Development)

For development, you can run the worker locally:

```bash
# Terminal 1 - Start Redis
docker run -d --name redis -p 6379:6379 redis

# Terminal 2 - Run worker
bun run src/queues/worker.ts
```

### Step 4: Using Queues in Your API

Import the queue functions and add jobs:

```typescript
import { addEmailJob, addWorkspaceJob } from './queues/index';

// In your API route
app.post('/send-email', async (c) => {
  const { to, subject, type } = c.req.json();
  
  await addEmailJob({
    type,
    to,
    subject,
  });
  
  return c.json({ message: 'Job queued' });
});

app.post('/workspace', async (c) => {
  const { workspaceId, tenantId, action } = c.req.json();
  
  await addWorkspaceJob({
    workspaceId,
    tenantId,
    action,
  });
  
  return c.json({ message: 'Workspace job queued' });
});
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis server hostname |
| `REDIS_PORT` | `6379` | Redis server port |
| `REDIS_PASSWORD` | - | Redis password (optional) |

### Docker Environment

In Docker, use the service name as hostname:
```yaml
environment:
  - REDIS_HOST=redis
  - REDIS_PORT=6379
```

## How Jobs Work

### Adding a Job

```typescript
await addEmailJob({
  type: 'welcome',
  to: 'user@example.com',
  subject: 'Welcome!',
});
```

### Job Processing

The worker automatically:
1. Picks up jobs from the queue
2. Processes them asynchronously
3. Retries failed jobs (up to 3 times with exponential backoff)
4. Removes completed jobs after 1 hour

### Job States

```
pending → active → completed
              └─→ failed → (retry) → active
```

## Monitoring

### Check Redis Data

```bash
# Connect to Redis container
docker exec -it job-orchestrator-redis redis-cli

# List keys
KEYS *

# View queue info
LLEN bull:email-queue
LLEN bull:workspace-queue
```

### Worker Logs

```bash
docker logs job-orchestrator-worker
```

## Scaling Workers

To scale worker instances:

```bash
docker-compose up -d --scale worker=3
```

This runs 3 worker containers processing jobs in parallel.

## Documentation & Resources

### Official Documentation

- **BullMQ Docs**: https://docs.bullmq.io/
- **Redis Docs**: https://redis.io/docs/
- **Docker Compose**: https://docs.docker.com/compose/

### Tutorials

- **BullMQ Workers in Docker**: https://oneuptime.com/blog/post/2026-01-21-bullmq-workers-docker/view
- **BullMQ Ultimate Guide**: https://www.dragonflydb.io/guides/bullmq
- **BullMQ with Express Example**: https://github.com/tanveerj5/bullmq-queue-system-with-express

### Key BullMQ Concepts

- **Queue**: Named job container (e.g., "email-queue")
- **Job**: Individual unit of work with data
- **Worker**: Process that consumes jobs
- **Job Options**: Retry settings, priorities, delays
- **Concurrency**: Number of jobs processed simultaneously

## Common Issues

### Redis Connection Refused

```bash
# Check Redis is running
docker ps

# Check Redis logs
docker logs job-orchestrator-redis
```

### Worker Not Picking Up Jobs

- Ensure Redis is accessible from worker container
- Check environment variables are set correctly
- Verify worker container is running

### Jobs Stuck in Pending

- Check worker logs for errors
- Ensure worker process is running
- Verify Redis connection in worker

## Next Steps

1. Add actual business logic to job handlers in `src/jobs/`
2. Set up job scheduling (delayed jobs) for future processing
3. Add BullMQ Dashboard for monitoring: https://github.com/vcapretz/bull-board
4. Configure Redis persistence for production
5. Set up Redis Sentinel for high availability
