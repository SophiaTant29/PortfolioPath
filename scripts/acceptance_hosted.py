import os, sys, json, urllib.request, urllib.error

FRONTEND=os.getenv("FRONTEND_URL","").rstrip("/")
API=os.getenv("API_URL","").rstrip("/")

if not FRONTEND or not API:
    print("ERROR: Set FRONTEND_URL and API_URL.")
    sys.exit(2)

def fetch(url):
    req=urllib.request.Request(url,headers={"User-Agent":"PortfolioPathAcceptance/1.0"})
    with urllib.request.urlopen(req,timeout=25) as r:
        body=r.read().decode("utf-8","replace")
        return r.status,body,dict(r.headers)

failures=[]

def check(name,url,body_contains=None):
    try:
        status,body,headers=fetch(url)
        ok=200 <= status < 400
        if body_contains and body_contains not in body:
            ok=False
        print(f"{name}: {'PASS' if ok else 'FAIL'} ({status})")
        if not ok: failures.append(name)
    except Exception as e:
        print(f"{name}: FAIL -> {e}")
        failures.append(name)

check("Frontend root", FRONTEND)
check("Login", FRONTEND+"/login")
check("Disclosures", FRONTEND+"/disclosures")
check("Privacy", FRONTEND+"/privacy")
check("Terms", FRONTEND+"/terms")
check("System status", FRONTEND+"/system-status")
check("Backend health", API+"/health", '"status":"ok"')

try:
    _,body,_=fetch(API+"/health")
    health=json.loads(body)
    print("Backend version:",health.get("version"))
    print("Market data configured:",health.get("market_data_configured"))
    if not health.get("market_data_configured"):
        failures.append("Market data configuration")
except Exception as e:
    print("Health payload parse: FAIL ->",e)
    failures.append("Health payload parse")

if failures:
    print("\nHOSTED ACCEPTANCE FAILED")
    for f in failures: print(" -",f)
    sys.exit(1)

print("\nHOSTED ACCEPTANCE PASSED")
