#!/bin/bash

# 🚀 Vire Workplace HR App Deployment Script
# This script helps deploy the app to Vercel

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi
print_status "Node.js version: $(node --version)"

# Clean previous builds
print_status "Cleaning previous builds..."
npm run clean

# Install dependencies
print_status "Installing dependencies..."
npm ci --prefer-offline --no-audit

# Run linting
print_status "Running linting..."
npm run lint

# Build for production
print_status "Building for production..."
npm run build:vercel

# Check if build was successful
if [ -d "dist" ]; then
    print_status "Build completed successfully!"
    print_status "Build output size:"
    du -sh dist/
    
    echo ""
    print_warning "Next steps:"
    echo "1. Commit and push your changes to GitHub"
    echo "2. Vercel will automatically deploy from your repository"
    echo "3. Or use: vercel --prod (if you have Vercel CLI installed)"
    
else
    print_error "Build failed! dist/ directory not found."
    exit 1
fi

echo ""
print_status "Deployment script completed successfully! 🎉"
