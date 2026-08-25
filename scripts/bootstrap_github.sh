#!/usr/bin/env sh
set -e

REMOTE_URL="$1"

if [ -z "$REMOTE_URL" ]; then
  echo "Usage: sh scripts/bootstrap_github.sh git@github.com:YOUR_USER/PortfolioPath.git"
  echo "   or: sh scripts/bootstrap_github.sh https://github.com/YOUR_USER/PortfolioPath.git"
  exit 2
fi

if [ ! -d .git ]; then
  git init
fi

git branch -M main

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git add .
git commit -m "Initial PortfolioPath hosted alpha" || true
git push -u origin main

echo "PortfolioPath published to GitHub."
