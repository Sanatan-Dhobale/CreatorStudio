#!/bin/bash

echo "🚀 CreatorHub Setup Script"
echo "=========================="

# Create uploads directory
mkdir -p backend/uploads/briefs
mkdir -p backend/uploads/profiles

echo "✅ Upload directories created"

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env from example
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ .env file created. Please update with your credentials."
else
  echo "ℹ️  .env already exists, skipping..."
fi

cd ..

# Setup frontend
echo ""
echo "⚛️  Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update backend/.env with your MongoDB URI, email credentials"
echo "  2. Start MongoDB: mongod"
echo "  3. Start backend:  cd backend && npm run dev"
echo "  4. Start frontend: cd frontend && npm start"
echo ""
echo "🔗 URLs:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5000"
echo ""
echo "📘 Key routes:"
echo "  /collab/:username     — Public brand inquiry form"
echo "  /p/:slug              — Affiliate link redirect + tracking"
echo "  /dashboard            — Creator dashboard"
echo "  /api/health           — Backend health check"
