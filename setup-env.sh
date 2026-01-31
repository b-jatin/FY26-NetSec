#!/bin/bash
echo "Creating .env.local from template..."
cat > .env.local << 'ENVEOF'
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-api03-..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
ENVEOF
echo ".env.local created! Please edit it with your actual values."
