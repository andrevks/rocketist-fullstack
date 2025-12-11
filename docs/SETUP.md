# Setup Guide

How to set up n8n and Typebot for the Rocketist AI Automation app.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase account and project
- OpenAI API key
- n8n Cloud account (or Docker setup)

## Environment Variables

### Next.js (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n
N8N_BASE_URL=https://your-n8n-instance.app.n8n.cloud
# Or for local n8n:
# N8N_BASE_URL=http://localhost:5678

# Optional: Full webhook URLs (if not using N8N_BASE_URL)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/task-created
N8N_TYPEBOT_WEBHOOK_URL=http://localhost:5678/webhook/typebot-chat
```

### n8n (Environment Variables in n8n UI)

```bash
NEXT_API_URL=http://localhost:3000
# Or your production URL:
# NEXT_API_URL=https://your-app.vercel.app
```

### n8n Credentials

1. Go to n8n → **Credentials**
2. Add **OpenAI API** credential
3. Enter your OpenAI API key
4. Name it: `OpenAI API` (or match your workflow reference)

## Setup Steps

### 1. Start Next.js App

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`

### 2. Setup n8n

#### Option A: n8n Cloud (Recommended)

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new workflow
3. Import workflows from `infra/docker/n8n/workflows/`
4. Set environment variables in n8n UI
5. Add OpenAI API credentials
6. Activate workflows

#### Option B: Local Docker

```bash
cd infra/docker/n8n
docker-compose up -d
```

Access n8n at `http://localhost:5678`

### 3. Import n8n Workflows

1. Export workflows from your n8n instance
2. Save to `infra/docker/n8n/workflows/`
3. Or import via n8n UI:
   - Workflows → Import from File
   - Select workflow JSON files

**Required Workflows:**
- **Typebot Intent Parser (with RAG)** - Handles Typebot chat messages
- **Task Enrichment** - Enriches new tasks with AI descriptions/steps

### 4. Setup Typebot

#### Option A: Typebot Cloud

1. Sign up at [typebot.io](https://typebot.io)
2. Create new typebot
3. Build the flow:
   - Text block: Welcome message
   - Text Input: Get user message
   - HTTP Request: Call `https://your-app.vercel.app/api/chat/typebot`
     - Method: POST
     - Body: `{"message": "{{textInput.value}}"}`
   - Text block: Show `{{httpRequest.body.reply}}`
4. Publish and get share link

#### Option B: Self-Hosted Typebot

See Typebot documentation for self-hosting setup.

### 5. Activate n8n Workflows

For each workflow in n8n:

1. Open the workflow
2. Click **Activate** (toggle in top right)
3. Copy the webhook URL
4. Update Next.js `.env.local` if needed

## Verification

### Test Typebot Flow

1. Open your Typebot
2. Send test messages:
   - "create task buy groceries"
   - "list tasks"
   - "done [task-id]"
   - "help"
3. Verify responses work correctly

### Test Task Enrichment

1. Create a task via web UI or Typebot
2. Check n8n execution logs
3. Verify task gets enriched with description/steps

### Check n8n Executions

1. Go to n8n → **Executions**
2. Check recent executions
3. Verify no errors

## Troubleshooting

### Typebot Not Working

- ✅ Check n8n workflow is activated
- ✅ Verify webhook URL in Next.js matches n8n
- ✅ Check n8n execution logs for errors
- ✅ Verify OpenAI API key is set in n8n

### Task Enrichment Not Working

- ✅ Check `N8N_WEBHOOK_URL` is set correctly
- ✅ Verify task enrichment workflow is activated
- ✅ Check n8n execution logs
- ✅ Verify OpenAI API key is set

### CORS Errors

- ✅ CORS is configured in `/api/chat/typebot`
- ✅ Should work automatically
- ✅ If issues persist, check environment variables

## Production Deployment

### Next.js (Vercel)

1. Deploy to Vercel
2. Set environment variables in Vercel dashboard
3. Use production URLs for `NEXT_API_URL` in n8n

### n8n Cloud

1. Use n8n Cloud instance
2. Set production `NEXT_API_URL` in n8n environment variables
3. Activate workflows

### Typebot Cloud

1. Update HTTP Request URL to production URL
2. Test thoroughly before going live

