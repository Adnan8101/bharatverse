#!/bin/bash

# BharatVerse Deployment Readiness Check
echo "🚀 BharatVerse Deployment Readiness Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "success" ]; then
        echo -e "${GREEN}✅ $1${NC}"
    elif [ "$2" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "Checking Node.js version..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION" "success"
else
    print_status "Node.js not found" "error"
    exit 1
fi

# Check npm version
echo "Checking npm version..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_status "npm version: $NPM_VERSION" "success"
else
    print_status "npm not found" "error"
    exit 1
fi

# Check if package.json exists
echo "Checking package.json..."
if [ -f "package.json" ]; then
    print_status "package.json exists" "success"
    
    # Check package name
    PACKAGE_NAME=$(node -p "require('./package.json').name")
    if [ "$PACKAGE_NAME" = "bharatverse" ]; then
        print_status "Package name updated to bharatverse" "success"
    else
        print_status "Package name not updated: $PACKAGE_NAME" "warning"
    fi
else
    print_status "package.json not found" "error"
    exit 1
fi

# Check if node_modules exists
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    print_status "Dependencies installed" "success"
else
    print_status "Dependencies not installed. Run 'npm install'" "warning"
fi

# Check for required configuration files
echo "Checking configuration files..."
if [ -f "next.config.mjs" ]; then
    print_status "next.config.mjs exists" "success"
else
    print_status "next.config.mjs not found" "error"
fi

if [ -f "vercel.json" ]; then
    print_status "vercel.json exists" "success"
else
    print_status "vercel.json not found" "error"
fi

if [ -f "tailwind.config.ts" ]; then
    print_status "tailwind.config.ts exists" "success"
else
    print_status "tailwind.config.ts not found" "error"
fi

# Check for environment file
echo "Checking environment configuration..."
if [ -f ".env.local" ]; then
    print_status ".env.local exists" "success"
elif [ -f ".env" ]; then
    print_status ".env exists" "success"
else
    print_status "No environment file found. Copy .env.example to .env.local" "warning"
fi

# Check Prisma schema
echo "Checking Prisma setup..."
if [ -f "prisma/schema.prisma" ]; then
    print_status "Prisma schema exists" "success"
else
    print_status "Prisma schema not found" "error"
fi

# Check for build script
echo "Checking build configuration..."
BUILD_SCRIPT=$(node -p "require('./package.json').scripts.build" 2>/dev/null)
if [ "$?" -eq 0 ]; then
    print_status "Build script configured: $BUILD_SCRIPT" "success"
else
    print_status "Build script not found" "error"
fi

# Check for key directories
echo "Checking project structure..."
REQUIRED_DIRS=("app" "components" "lib" "prisma" "public")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "$dir directory exists" "success"
    else
        print_status "$dir directory not found" "error"
    fi
done

# Check for branding consistency
echo "Checking branding consistency..."
GOCART_REFS=$(grep -r "gocart\|GoCart" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.log" --exclude="package-lock.json" . | wc -l)
if [ "$GOCART_REFS" -eq 0 ]; then
    print_status "All gocart references updated to bharatverse" "success"
else
    print_status "$GOCART_REFS remaining gocart references found" "warning"
fi

# Test build (optional)
echo ""
echo "Would you like to test the build? (y/n)"
read -r response
if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo "Testing build..."
    if npm run build; then
        print_status "Build test successful" "success"
    else
        print_status "Build test failed" "error"
    fi
fi

echo ""
echo "=========================================="
echo "🎉 Deployment readiness check complete!"
echo ""
echo "Next steps for Vercel deployment:"
echo "1. Push code to GitHub repository"
echo "2. Connect repository to Vercel"
echo "3. Configure environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "For detailed deployment instructions, see DEPLOYMENT.md"
