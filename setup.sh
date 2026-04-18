#!/bin/bash

# EG Comfort App - Quick Start Guide

echo "================================"
echo "EG Comfort App - Setup"
echo "================================"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 14+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Navigate to project
cd "$(dirname "$0")"
echo "📁 Project location: $(pwd)"
echo ""

# Check if npm modules are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

echo ""
echo "🚀 To start the development server, run:"
echo "   npm start"
echo ""
echo "🔨 To build for production, run:"
echo "   npm run build"
echo ""
echo "================================"
