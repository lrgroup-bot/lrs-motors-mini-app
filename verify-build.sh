#!/usr/bin/env bash

# LRS Motors - Build Verification Script
# This script verifies the project structure and dependencies

echo "🔍 LRS Motors Telegram Mini App - Build Verification"
echo "================================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js version..."
node --version
echo ""

# Check npm
echo "✓ Checking npm version..."
npm --version
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "⚠ Dependencies not installed. Run: npm install"
fi
echo ""

# Check key files
echo "✓ Checking project structure..."
files=(
    "package.json"
    "tsconfig.json"
    "next.config.ts"
    "tailwind.config.ts"
    "postcss.config.js"
    ".env.example"
    ".gitignore"
    ".eslintrc.json"
    "src/app/layout.tsx"
    "src/app/globals.css"
    "src/providers/TelegramProvider.tsx"
    "src/providers/AuthProvider.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (MISSING)"
    fi
done
echo ""

echo "✓ Build verification complete!"
echo ""
echo "📚 Next steps:"
echo "  1. npm install              (if not done)"
echo "  2. cp .env.example .env.local"
echo "  3. Edit .env.local with real values"
echo "  4. npm run dev              (start development server)"
echo ""
echo "🚀 Development server will be at: http://localhost:3000"
