from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
errors=[]
warnings=[]

required=[
    ROOT/"frontend/package.json",
    ROOT/"frontend/app/page.tsx",
    ROOT/"frontend/proxy.ts",
    ROOT/"backend/app/main.py",
    ROOT/"backend/requirements.txt",
    ROOT/"supabase/schema.sql",
    ROOT/"supabase/config.toml",
    ROOT/"supabase/migrations/20260825050000_initial_schema.sql",
    ROOT/"supabase/migrations/20260825050500_v17_integration_hardening.sql",
    ROOT/"DEPLOYMENT.md",
    ROOT/"ALPHA_CHECKLIST.md",
]

for p in required:
    if not p.exists():
        errors.append(f"Missing required file: {p.relative_to(ROOT)}")

frontend_env=(ROOT/"frontend/.env.production.example").read_text() if (ROOT/"frontend/.env.production.example").exists() else ""
backend_env=(ROOT/"backend/.env.production.example").read_text() if (ROOT/"backend/.env.production.example").exists() else ""

for key in ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","NEXT_PUBLIC_API_BASE_URL","SUPABASE_SERVICE_ROLE_KEY"]:
    if key not in frontend_env:
        errors.append(f"Frontend production env template missing {key}")

for key in ["FMP_API_KEY","FRONTEND_ORIGIN"]:
    if key not in backend_env:
        errors.append(f"Backend production env template missing {key}")

schema=(ROOT/"supabase/schema.sql").read_text()
for table in ["portfolios","transactions","portfolio_selections","watchlist_items","journal_entries","performance_snapshots","security_score_snapshots"]:
    if table not in schema:
        errors.append(f"Schema missing expected table: {table}")

if "enable row level security" not in schema.lower():
    errors.append("Row Level Security does not appear in Supabase schema.")

if errors:
    print("RELEASE CHECK FAILED")
    for e in errors: print("ERROR:",e)
    sys.exit(1)

print("RELEASE CHECK PASSED")
for w in warnings: print("WARNING:",w)
