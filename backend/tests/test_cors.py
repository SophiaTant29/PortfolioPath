from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_portfoliopath_vercel_preview_origin_allowed():
    origin = "https://portfolio-path-qmcf88dkp-sophia29-6091.vercel.app"
    r = client.options("/api/etf/overlap", headers={
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    })
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == origin

def test_unrelated_vercel_origin_not_allowed():
    origin = "https://unrelated-project-someone.vercel.app"
    r = client.options("/api/etf/overlap", headers={
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
    })
    assert r.headers.get("access-control-allow-origin") != origin
