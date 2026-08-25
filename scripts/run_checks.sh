#!/usr/bin/env sh
set -e

echo "1/5 Release structure checks"
python scripts/check_release.py
python scripts/validate_migrations.py

echo "2/5 Backend tests"
cd backend
pytest -q
cd ..

echo "3/5 Frontend install/build"
cd frontend
npm install --no-audit --no-fund
npm run typecheck
npm run lint
npm run build
cd ..

echo "5/5 Done"
echo "PortfolioPath is ready for deployment validation."
