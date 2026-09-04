from __future__ import annotations

from typing import Any


def _weight(value: Any) -> float | None:
    if value is None:
        return None
    try:
        if isinstance(value, str):
            text=value.strip().replace(",","")
            pct=text.endswith("%")
            number=float(text.rstrip("%"))
            return number/100 if pct or number>1 else number
        number=float(value)
        return number/100 if number>1 else number
    except Exception:
        return None


def dataframe_to_holdings(frame: Any) -> list[dict]:
    """Normalize yfinance FundsData.top_holdings into PortfolioPath rows.

    yfinance has changed its exact DataFrame layout over time, so this parser
    accepts both symbol-as-index and symbol-as-column shapes and several common
    weight labels.
    """
    if frame is None:
        return []
    try:
        records=frame.reset_index().to_dict(orient="records")
    except Exception:
        try:
            records=list(frame) if isinstance(frame,list) else []
        except Exception:
            records=[]
    out=[]
    for row in records:
        if not isinstance(row,dict):
            continue
        symbol=(
            row.get("Symbol") or row.get("symbol") or row.get("Ticker") or row.get("ticker")
            or row.get("index") or row.get("Holding") or row.get("holding")
            or row.get("Name") or row.get("name")
        )
        if not symbol:
            continue
        raw=None
        for key in (
            "Holding Percent","holdingPercent","Weight","weight","Percentage","percentage",
            "Portfolio Weight","portfolioWeight","% Assets","percentAssets"
        ):
            if row.get(key) is not None:
                raw=row.get(key)
                break
        w=_weight(raw)
        if w is None or w < 0:
            continue
        out.append({"ticker":str(symbol).upper().strip(),"weight":w})
    return out


def fetch_top_holdings(symbol: str) -> dict:
    """Fetch a fund's top holdings using yfinance as a best-effort fallback.

    PortfolioPath's checked-in monthly snapshot remains the preferred source.
    This fallback is used only when a selected ETF is absent from that snapshot.
    """
    import yfinance as yf

    ticker=symbol.upper().strip()
    fd=yf.Ticker(ticker).funds_data
    frame=fd.top_holdings
    holdings=dataframe_to_holdings(frame)
    if not holdings:
        raise RuntimeError("No top-holdings data was available for this fund.")
    return {
        "symbol": ticker,
        "holdings": holdings,
        "source": "Yahoo Finance top-holdings fallback via yfinance",
        "coverage_note": "Top holdings only; overlap is a minimum observed overlap rather than total fund overlap.",
        "snapshot_date": None,
    }
