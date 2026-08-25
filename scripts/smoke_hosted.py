import os, sys, urllib.request, urllib.error

frontend=os.getenv("FRONTEND_URL","").rstrip("/")
api=os.getenv("API_URL","").rstrip("/")

if not frontend or not api:
    print("Set FRONTEND_URL and API_URL before running hosted smoke checks.")
    sys.exit(2)

checks=[
    ("Frontend", frontend),
    ("Backend health", api+"/health"),
]

failed=False
for name,url in checks:
    try:
        req=urllib.request.Request(url,headers={"User-Agent":"PortfolioPathSmoke/1.0"})
        with urllib.request.urlopen(req,timeout=20) as r:
            status=r.status
        ok=200 <= status < 400
        print(f"{name}: {'PASS' if ok else 'FAIL'} ({status}) {url}")
        failed |= not ok
    except Exception as e:
        print(f"{name}: FAIL {url} -> {e}")
        failed=True

sys.exit(1 if failed else 0)
