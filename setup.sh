#!/bin/bash

# IKIGAI Web App - Replit Auto Setup Script

echo "🚀 IKIGAI Web App - Replit Setup Started"
echo "=========================================="

# Step 1: Install Dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Step 2: Build Project
echo "🔨 Building project..."
npm run build

# Step 3: Create .env if not exists
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local..."
  echo "VITE_API_URL=https://ikigai-app-backend.replit.app/api" > .env.local
fi

echo ""
echo "✅ Setup Complete!"
echo "=========================================="
echo "To start the dev server, run:"
echo "  npm run dev"
echo ""
echo "Your app will be available at:"
echo "  http://localhost:5174"
echo ""
echo "Production URL will be provided by Replit"
echo "=========================================="
