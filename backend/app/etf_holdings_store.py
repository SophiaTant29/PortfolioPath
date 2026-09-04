import json
from functools import lru_cache
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "etf_holdings_monthly.json"

@lru_cache(maxsize=1)
def _load():
    with DATA_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)

def snapshot_metadata():
    data = _load()
    return {
        "snapshot_date": data.get("snapshot_date"),
        "coverage_note": data.get("coverage_note"),
        "supported_symbols": sorted((data.get("funds") or {}).keys()),
    }

def get_etf_holdings(symbol: str):
    data = _load()
    symbol = symbol.upper().strip()
    fund = (data.get("funds") or {}).get(symbol)
    if not fund:
        return None
    return {
        "symbol": symbol,
        "benchmark": fund.get("benchmark"),
        "snapshot_date": data.get("snapshot_date"),
        "coverage_note": data.get("coverage_note"),
        "holdings": fund.get("holdings") or [],
        "source": "PortfolioPath monthly ETF holdings snapshot",
    }
