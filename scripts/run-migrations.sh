#!/bin/bash
# Script to run Supabase migrations
# Usage: ./scripts/run-migrations.sh

set -e

echo "📋 Supabase Migration Runner"
echo "=============================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found."
  echo ""
  echo "Install it with:"
  echo "  npm install -g supabase"
  echo ""
  echo "Or use the Supabase Dashboard method (see README.md)"
  exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found. Please create it first with your Supabase credentials."
  exit 1
fi

# Source .env.local to get project ref
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
  exit 1
fi

# Extract project ref from URL (e.g., https://xxxxx.supabase.co -> xxxxx)
PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co.*|\1|')

if [ -z "$PROJECT_REF" ]; then
  echo "❌ Could not extract project ref from NEXT_PUBLIC_SUPABASE_URL"
  exit 1
fi

echo "📦 Linking to project: $PROJECT_REF"
echo ""

# Link to project (non-interactive if already linked)
supabase link --project-ref "$PROJECT_REF" 2>/dev/null || {
  echo "ℹ️  Project already linked or linking..."
}

echo ""
echo "🚀 Running migrations..."
echo ""

# Push migrations
supabase db push

echo ""
echo "✅ Migrations completed!"
echo ""
echo "Next steps:"
echo "  1. Verify the 'tasks' table exists in Supabase Dashboard"
echo "  2. Restart your Next.js dev server"
echo ""

