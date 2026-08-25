from pathlib import Path
import re, sys

root=Path(__file__).resolve().parents[1]
m=root/"supabase/migrations"
files=sorted(p.name for p in m.glob("*.sql"))

errors=[]
if not files:
    errors.append("No Supabase migrations found.")

for f in files:
    if not re.match(r"^\d{14}_[a-zA-Z0-9_\-]+\.sql$",f):
        errors.append(f"Migration name is not timestamped: {f}")

baseline=[f for f in files if "initial_schema" in f]
if not baseline:
    errors.append("Missing initial_schema migration.")

if errors:
    print("MIGRATION VALIDATION FAILED")
    for e in errors: print("ERROR:",e)
    sys.exit(1)

print("MIGRATION VALIDATION PASSED")
for f in files: print(" -",f)
