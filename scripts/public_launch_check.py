from pathlib import Path
import re, sys, json
ROOT=Path(__file__).resolve().parents[1]
errors=[]; warnings=[]
required=[
    ROOT/'frontend/app/privacy/page.tsx',
    ROOT/'frontend/app/terms/page.tsx',
    ROOT/'frontend/app/disclosures/page.tsx',
    ROOT/'frontend/app/auth/confirm/route.ts',
    ROOT/'frontend/app/api/backend/[...path]/route.ts',
    ROOT/'backend/data/etf_holdings_monthly.json',
]
for p in required:
    if not p.exists(): errors.append(f'Missing required launch file: {p.relative_to(ROOT)}')
for p in [ROOT/'frontend',ROOT/'backend']:
    for f in p.rglob('*'):
        if f.is_file() and f.suffix in {'.ts','.tsx','.py','.md'}:
            try:t=f.read_text(errors='ignore')
            except:continue
            if 'should be replaced with reviewed production' in t or 'product-development placeholder' in t:
                errors.append(f'Placeholder launch language remains in {f.relative_to(ROOT)}')
main=(ROOT/'backend/app/main.py').read_text()
if 'BACKEND_SHARED_SECRET' not in main: errors.append('Backend shared-secret gate is missing.')
if 'protect_analytics_api' not in main: errors.append('Backend analytics protection middleware is missing.')
env=(ROOT/'frontend/.env.production.example').read_text()
for key in ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','API_BASE_URL','BACKEND_SHARED_SECRET','SUPABASE_SERVICE_ROLE_KEY']:
    if key not in env: errors.append(f'Frontend production env template missing {key}')
try:
    data=json.loads((ROOT/'backend/data/etf_holdings_monthly.json').read_text())
    if not data.get('snapshot_date'): warnings.append('ETF snapshot has no snapshot_date.')
    if len(data.get('funds',{}))<10: warnings.append('ETF snapshot coverage is small; fallback coverage should be monitored.')
except Exception as e: errors.append(f'ETF holdings snapshot is invalid JSON: {e}')
print('PortfolioPath public-launch static check')
for e in errors: print('ERROR:',e)
for w in warnings: print('WARN:',w)
if errors:
    print(f'FAILED: {len(errors)} error(s), {len(warnings)} warning(s)')
    sys.exit(1)
print(f'PASS: 0 errors, {len(warnings)} warning(s)')
