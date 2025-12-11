#!/bin/bash

# Test script to diagnose Typebot → Next.js → n8n flow

set -e

echo "🔍 Testing Typebot Integration Flow"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if Next.js API is running
echo "1️⃣  Testing Next.js API..."
if curl -s -f http://localhost:3000/api/chat/typebot/debug > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js API is running${NC}"
else
    echo -e "${RED}❌ Next.js API is not running (http://localhost:3000)${NC}"
    echo "   Start it with: npm run dev"
    exit 1
fi

# Test 2: Test Next.js API endpoint
echo ""
echo "2️⃣  Testing Next.js API endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/chat/typebot \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}')

if echo "$RESPONSE" | grep -q "reply"; then
    echo -e "${GREEN}✅ Next.js API responded:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${YELLOW}⚠️  Unexpected response from Next.js API:${NC}"
    echo "$RESPONSE"
fi

# Test 3: Check if n8n is running
echo ""
echo "3️⃣  Testing n8n..."
if curl -s -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ n8n is running${NC}"
else
    echo -e "${RED}❌ n8n is not running (http://localhost:5678)${NC}"
    echo "   Start it with: cd infra/docker/n8n && docker compose up -d"
    exit 1
fi

# Test 4: Test n8n webhook directly
echo ""
echo "4️⃣  Testing n8n webhook directly..."
WEBHOOK_URL="http://localhost:5678/webhook/typebot-chat"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"message": "test message"}')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ n8n webhook responded (HTTP $HTTP_STATUS):${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ n8n webhook failed (HTTP $HTTP_STATUS):${NC}"
    echo "$BODY"
    echo ""
    echo "   💡 Make sure:"
    echo "      1. n8n workflow 'Typebot Intent Parser (with RAG)' is ACTIVATED"
    echo "      2. Webhook path is '/webhook/typebot-chat'"
    echo "      3. Check n8n Executions tab for errors"
fi

# Test 5: Check environment variables
echo ""
echo "5️⃣  Checking environment variables..."
if [ -f .env.local ]; then
    if grep -q "N8N_WEBHOOK_URL" .env.local; then
        echo -e "${GREEN}✅ N8N_WEBHOOK_URL found in .env.local${NC}"
        grep "N8N_WEBHOOK_URL" .env.local
    else
        echo -e "${YELLOW}⚠️  N8N_WEBHOOK_URL not found in .env.local${NC}"
        echo "   Add: N8N_WEBHOOK_URL=http://localhost:5678/webhook/typebot-chat"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
fi

echo ""
echo "✅ Diagnosis complete!"
echo ""
echo "Next steps if tests failed:"
echo "  1. Check n8n workflow is activated: http://localhost:5678"
echo "  2. Check n8n Executions tab for errors"
echo "  3. Verify N8N_WEBHOOK_URL in .env.local"
echo "  4. Check Next.js console logs for errors"

