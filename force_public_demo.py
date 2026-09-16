#!/usr/bin/env python3
from pathlib import Path
import re, shutil

ROOT = Path.cwd()
EXTS = {".ts",".tsx",".js",".jsx"}
SKIP = {".git","node_modules",".next","dist","build",".vercel"}

changed = []
matches = []

def files():
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        if any(part in SKIP for part in p.parts):
            continue
        yield p

def backup(p):
    b = p.with_suffix(p.suffix + ".bak")
    if not b.exists():
        shutil.copy2(p,b)

def save(p, old, new):
    if new != old:
        backup(p)
        p.write_text(new, encoding="utf-8")
        changed.append(str(p.relative_to(ROOT)))

# 1) Disable middleware/proxy auth gates entirely.
for p in files():
    if p.name not in {"middleware.ts","middleware.js","proxy.ts","proxy.js"}:
        continue
    old = p.read_text(encoding="utf-8", errors="ignore")
    if re.search(r"supabase|auth|login|signin|session|getUser|getSession", old, re.I):
        fn = "proxy" if p.stem == "proxy" else "middleware"
        new = (
            'import { NextResponse } from "next/server";\n'
            'import type { NextRequest } from "next/server";\n\n'
            f'export function {fn}(_request: NextRequest) {{\n'
            '  return NextResponse.next();\n'
            '}\n\n'
            'export const config = {\n'
            '  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],\n'
            '};\n'
        )
        save(p, old, new)

# 2) Redirect explicit login/signin pages home.
login_page_names = {
    "app/login/page.tsx","app/login/page.jsx","app/signin/page.tsx","app/signin/page.jsx",
    "src/app/login/page.tsx","src/app/login/page.jsx","src/app/signin/page.tsx","src/app/signin/page.jsx",
    "frontend/app/login/page.tsx","frontend/app/login/page.jsx","frontend/app/signin/page.tsx","frontend/app/signin/page.jsx",
    "frontend/src/app/login/page.tsx","frontend/src/app/login/page.jsx","frontend/src/app/signin/page.tsx","frontend/src/app/signin/page.jsx",
}
for rel in login_page_names:
    p = ROOT / rel
    if p.exists():
        old = p.read_text(encoding="utf-8", errors="ignore")
        new = 'import { redirect } from "next/navigation";\n\nexport default function LoginPage(){ redirect("/"); }\n'
        save(p, old, new)

# 3) Remove common hard redirects to auth routes from app code.
route_pat = r'/(?:login|signin|sign-in|auth|account/login)'
patterns = [
    re.compile(r'^\s*redirect\(\s*["\']'+route_pat+r'["\']\s*\);?\s*$', re.M),
    re.compile(r'^\s*router\.(?:push|replace)\(\s*["\']'+route_pat+r'["\']\s*\);?\s*$', re.M),
    re.compile(r'^\s*window\.location(?:\.href)?\s*=\s*["\']'+route_pat+r'["\']\s*;?\s*$', re.M),
]
for p in files():
    if p.name.startswith(("middleware","proxy")):
        continue
    old = p.read_text(encoding="utf-8", errors="ignore")
    new = old
    for pat in patterns:
        new = pat.sub("// PortfolioPath public demo: auth redirect disabled", new)
    save(p, old, new)

# 4) Neutralize common "if no user -> redirect" one-line guards.
guard_patterns = [
    re.compile(r'if\s*\(\s*!user\s*\)\s*redirect\(\s*["\']'+route_pat+r'["\']\s*\)\s*;?'),
    re.compile(r'if\s*\(\s*!session\s*\)\s*redirect\(\s*["\']'+route_pat+r'["\']\s*\)\s*;?'),
    re.compile(r'if\s*\(\s*!currentUser\s*\)\s*redirect\(\s*["\']'+route_pat+r'["\']\s*\)\s*;?'),
    re.compile(r'if\s*\(\s*!user\s*\)\s*router\.(?:push|replace)\(\s*["\']'+route_pat+r'["\']\s*\)\s*;?'),
]
for p in files():
    old = p.read_text(encoding="utf-8", errors="ignore")
    new = old
    for pat in guard_patterns:
        new = pat.sub("// PortfolioPath public demo: auth guard disabled", new)
    save(p, old, new)

# 5) Update risk wording.
risk_replacements = [
    ("Risk is the possibility that investments will go down in value.",
     "Risk is the uncertainty around an investment's future value. An investment can go up or down in value, and investments with greater potential returns often experience larger price movements."),
    ("Risk is the possibility that an investment will go down in value.",
     "Risk is the uncertainty around an investment's future value. An investment can go up or down in value, and investments with greater potential returns often experience larger price movements."),
]
for p in files():
    old = p.read_text(encoding="utf-8", errors="ignore")
    new = old
    for a,b in risk_replacements:
        new = new.replace(a,b)
    save(p, old, new)

# 6) Produce a report of remaining auth references for anything we couldn't safely auto-edit.
keywords = re.compile(r"sign.?in|login|supabase\.auth|getUser\(|getSession\(|onAuthStateChange|redirect\(|router\.(?:push|replace)\(", re.I)
for p in files():
    txt = p.read_text(encoding="utf-8", errors="ignore")
    hits = []
    for i,line in enumerate(txt.splitlines(),1):
        if keywords.search(line):
            hits.append(f"{i}: {line[:220]}")
    if hits:
        matches.append(f"\n### {p.relative_to(ROOT)}\n" + "\n".join(hits[:40]))

report = ROOT / "AUTH_REMAINING_REFERENCES.txt"
report.write_text(
    "Changed files:\n" + ("\n".join(sorted(set(changed))) if changed else "(none)") +
    "\n\nRemaining auth-related references:\n" + ("\n".join(matches) if matches else "(none found)") +
    "\n",
    encoding="utf-8"
)

print("Done.")
print("Changed files:")
for f in sorted(set(changed)):
    print(" -", f)
print("\nCreated AUTH_REMAINING_REFERENCES.txt")
print("If sign-in still appears, that report will show the exact remaining files/lines.")
