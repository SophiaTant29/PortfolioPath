#!/usr/bin/env python3
"""
PortfolioPath public-test update

Changes:
1) Remove the sign-in gate for public testers.
2) Update beginner-facing risk wording so it explains that investments can move up or down.

Run from the root of the PortfolioPath repository:
    python apply_public_test_update.py

The script creates .bak backups for every file it changes.
"""

from pathlib import Path
import re
import shutil

ROOT = Path.cwd()

TEXT_EXTS = {".ts", ".tsx", ".js", ".jsx", ".html", ".md"}
SKIP_DIRS = {".git", "node_modules", ".next", "dist", "build", ".vercel", "__pycache__"}

RISK_COPY = (
    "Risk is the uncertainty around an investment's future value. "
    "An investment can go up or down in value, and investments with greater "
    "potential returns often experience larger price movements."
)

def source_files():
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in TEXT_EXTS:
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        yield p

def backup(path: Path):
    b = path.with_suffix(path.suffix + ".bak")
    if not b.exists():
        shutil.copy2(path, b)

def write_changed(path: Path, old: str, new: str, changed):
    if new != old:
        backup(path)
        path.write_text(new, encoding="utf-8")
        changed.append(str(path.relative_to(ROOT)))

def patch_proxy_or_middleware(changed):
    candidates = [
        ROOT / "frontend" / "proxy.ts",
        ROOT / "frontend" / "src" / "proxy.ts",
        ROOT / "proxy.ts",
        ROOT / "frontend" / "middleware.ts",
        ROOT / "frontend" / "src" / "middleware.ts",
        ROOT / "middleware.ts",
    ]
    for p in candidates:
        if not p.exists():
            continue
        old = p.read_text(encoding="utf-8")
        if not re.search(r"(auth|login|sign.?in|supabase|protected|session)", old, re.I):
            continue

        fn_name = "proxy" if p.name == "proxy.ts" else "middleware"
        new = (
            'import { NextResponse } from "next/server";\n'
            'import type { NextRequest } from "next/server";\n\n'
            '/**\n'
            ' * PortfolioPath public testing mode.\n'
            ' * Authentication routing is intentionally disabled so visitors can try\n'
            ' * the educational experience without creating an account.\n'
            ' */\n'
            f'export function {fn_name}(_request: NextRequest) {{\n'
            '  return NextResponse.next();\n'
            '}\n\n'
            'export const config = {\n'
            '  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],\n'
            '};\n'
        )
        write_changed(p, old, new, changed)
        return str(p.relative_to(ROOT))
    return None

def patch_login_route(changed):
    candidates = [
        ROOT / "frontend" / "app" / "login" / "page.tsx",
        ROOT / "frontend" / "src" / "app" / "login" / "page.tsx",
        ROOT / "app" / "login" / "page.tsx",
        ROOT / "frontend" / "app" / "signin" / "page.tsx",
        ROOT / "frontend" / "src" / "app" / "signin" / "page.tsx",
        ROOT / "app" / "signin" / "page.tsx",
    ]
    for p in candidates:
        if not p.exists():
            continue
        old = p.read_text(encoding="utf-8")
        new = (
            'import { redirect } from "next/navigation";\n\n'
            '/**\n'
            ' * PortfolioPath public testing mode:\n'
            ' * sign-in is temporarily bypassed for external testers.\n'
            ' */\n'
            'export default function LoginPage() {\n'
            '  redirect("/");\n'
            '}\n'
        )
        write_changed(p, old, new, changed)
        return str(p.relative_to(ROOT))
    return None

def patch_root_auth_redirects(changed):
    patterns = [
        re.compile(r'^\\s*redirect\\(\\s*["\\\']/(?:login|signin)["\\\']\\s*\\);?\\s*$', re.M),
        re.compile(r'^\\s*router\\.(?:push|replace)\\(\\s*["\\\']/(?:login|signin)["\\\']\\s*\\);?\\s*$', re.M),
    ]
    for p in source_files():
        if p.name in {"proxy.ts", "middleware.ts"}:
            continue
        old = p.read_text(encoding="utf-8")
        new = old
        for pat in patterns:
            new = pat.sub("// Public testing mode: sign-in redirect removed.", new)
        write_changed(p, old, new, changed)

def patch_risk_copy(changed):
    replacements = [
        (
            re.compile(
                r"Risk is the possibility that (?:an )?investment(?:s)? (?:will|may|can) "
                r"(?:go down|decline|lose value)[^.]*\\.",
                re.I,
            ),
            RISK_COPY,
        ),
        (
            re.compile(
                r"Risk refers to the possibility that (?:an )?investment(?:s)? "
                r"(?:will|may|can) (?:go down|decline|lose value)[^.]*\\.",
                re.I,
            ),
            RISK_COPY,
        ),
    ]

    literal_pairs = [
        (
            "Risk is the possibility that investments will go down in value.",
            RISK_COPY,
        ),
        (
            "Risk is the possibility that an investment will go down in value.",
            RISK_COPY,
        ),
    ]

    for p in source_files():
        old = p.read_text(encoding="utf-8")
        new = old
        for a, b in literal_pairs:
            new = new.replace(a, b)
        for pat, replacement in replacements:
            new = pat.sub(replacement, new)
        write_changed(p, old, new, changed)

def main():
    changed = []
    proxy = patch_proxy_or_middleware(changed)
    login = patch_login_route(changed)
    patch_root_auth_redirects(changed)
    patch_risk_copy(changed)

    print("\nPortfolioPath public-test update complete.")
    if proxy:
        print(f"- Auth middleware/proxy bypassed: {proxy}")
    else:
        print("- No auth middleware/proxy file was automatically changed.")
    if login:
        print(f"- Login/sign-in route redirected to home: {login}")
    else:
        print("- No dedicated login/sign-in route was found.")
    if changed:
        print("- Changed files:")
        for f in sorted(set(changed)):
            print(f"  • {f}")
        print("\n.bak backups were created next to changed files.")
    else:
        print("- No matching files were changed. Review your auth implementation manually.")

if __name__ == "__main__":
    main()
