#!/usr/bin/env bash
set -e

echo "=========================================="
echo "   Sakshya Digital Forensics - Firebase Deploy"
echo "=========================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Step 1: Build Frontend Next.js app
echo -e "\n[1/3] Building Next.js static export..."
cd "$SCRIPT_DIR/frontend"
npm run build
cd "$SCRIPT_DIR"

# Step 2: Check Firebase login status
echo -e "\n[2/3] Checking Firebase CLI authentication..."
npx -y firebase-tools projects:list

# Step 3: Deploy to Firebase Hosting
echo -e "\n[3/3] Deploying to Firebase Hosting..."
npx -y firebase-tools deploy --only hosting

echo -e "\n=========================================="
echo " Deployment process complete!"
echo "=========================================="
