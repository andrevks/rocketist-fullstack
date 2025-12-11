# n8n Setup

This directory contains Docker Compose configuration for running n8n locally.

## Quick Start

### Option 1: Use n8n Cloud (Recommended for Production)

Skip Docker setup and use [n8n.cloud](https://n8n.cloud) instead. Just import the workflows (see below).

### Option 2: Local Docker Setup

1. **Create `.env` file**:
   ```bash
   cd infra/docker/n8n
   cat > .env << EOF
   N8N_USER=admin
   N8N_PASSWORD=changeme
   N8N_HOST=localhost
   OPENAI_API_KEY=sk-...
   NEXT_API_URL=http://localhost:3000
   EOF
   ```

2. **Start n8n**:
   ```bash
   docker compose up -d
   ```
   
   Access n8n at `http://localhost:5678`
   
   **Note**: On Linux, if n8n can't connect to Next.js API, set `NEXT_API_URL=http://172.17.0.1:3000` in `.env`

3. **Import Workflows**:
   - Go to `http://localhost:5678`
   - Login (default: admin/changeme)
   - Go to **Workflows** → Click **"+"** → **"Import from File"**
   - Import:
     - [`workflows/typebot-intent-parser.json`](workflows/typebot-intent-parser.json)
     - [`workflows/task-enrichment.json`](workflows/task-enrichment.json)

4. **Configure**:
   - Add OpenAI API key in **Credentials**
   - Set environment variable: `NEXT_API_URL=http://localhost:3000` (Settings → Environment Variables)
   - Activate workflows (toggle ON)

5. **Get webhook URL**:
   - Open "typebot-intent-parser" workflow
   - Copy webhook URL from Webhook node
   - Add to Next.js `.env.local` as `N8N_BASE_URL` (base URL only, not full webhook path)

## Workflow Files

Workflows are stored in [`workflows/`](workflows/):

- **`typebot-intent-parser.json`** - LLM-based intent parsing with RAG for Typebot messages
- **`task-enrichment.json`** - Automated task enrichment using OpenAI

These files should be imported into n8n (Cloud or local) via the UI.

## Docker Compose Configuration

The `docker-compose.yml` sets up:
- n8n container with persistent data volume
- Basic auth (admin/changeme by default)
- Environment variables for OpenAI and Next.js API URLs
- Health checks

**Stop n8n**:
```bash
docker compose down
```

**View logs**:
```bash
docker compose logs -f
```

## Environment Variables

- `N8N_USER` / `N8N_PASSWORD` - Basic auth credentials
- `OPENAI_API_KEY` - OpenAI API key for LLM workflows
- `NEXT_API_URL` - Next.js API base URL (default: `http://host.docker.internal:3000`)

All variables can be set in `.env` file (not tracked in git).
