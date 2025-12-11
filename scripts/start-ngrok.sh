#!/bin/bash

# Script to start ngrok tunnel for Next.js app
# Usage: ./scripts/start-ngrok.sh

echo "🚀 Starting ngrok tunnel for Next.js app..."
echo "📝 Make sure your Next.js app is running on port 3000"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "📦 Install it with: brew install ngrok/ngrok/ngrok"
    echo "   Or download from: https://ngrok.com/download"
    exit 1
fi

# Check if port 3000 is in use (Next.js should be running)
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Warning: Port 3000 doesn't seem to be in use."
    echo "   Make sure your Next.js app is running with: npm run dev"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check for reserved domain in config
if [ -f "ngrok.yml" ]; then
    echo "📄 Found ngrok.yml config file, using it..."
    ngrok start nextjs
else
    echo "🌐 Starting ngrok on port 3000..."
    echo "💡 Tip: Use a reserved domain for a stable URL"
    echo ""
    ngrok http 3000
fi

