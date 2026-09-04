from fastapi.testclient import TestClient
from app.main import app

client=TestClient(app)

def test_public_health_does_not_require_shared_secret(monkeypatch):
    monkeypatch.setenv("APP_ENV","production")
    monkeypatch.setenv("BACKEND_SHARED_SECRET","test-secret")
    assert client.get("/health").status_code==200

def test_api_requires_shared_secret_in_production(monkeypatch):
    monkeypatch.setenv("APP_ENV","production")
    monkeypatch.setenv("BACKEND_SHARED_SECRET","test-secret")
    r=client.post("/api/etf/overlap",json={"symbols":["VOO","QQQ"]})
    assert r.status_code==401

def test_api_accepts_matching_shared_secret(monkeypatch):
    monkeypatch.setenv("APP_ENV","production")
    monkeypatch.setenv("BACKEND_SHARED_SECRET","test-secret")
    r=client.post("/api/etf/overlap",headers={"x-portfoliopath-backend-key":"test-secret"},json={"symbols":["VOO","QQQ"]})
    assert r.status_code==200
    assert r.json()["pairwise"]
