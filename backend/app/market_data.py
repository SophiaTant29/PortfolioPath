import os, asyncio
import httpx
from dotenv import load_dotenv
from .cache import cache
from .etf_holdings_store import get_etf_holdings
from .yahoo_fund_holdings import fetch_top_holdings

load_dotenv()
BASE="https://financialmodelingprep.com/stable"
KEY=os.getenv("FMP_API_KEY")

TTL_DEFAULT=900
TTL_QUOTE=2592000
TTL_HISTORY=2592000
TTL_FUNDAMENTALS=2592000
TTL_ETF=2592000

async def get(path:str, ttl:int=TTL_DEFAULT, **params):
    if not KEY:
        raise RuntimeError("FMP_API_KEY is not configured.")
    params["apikey"]=KEY
    cache_key=(path,tuple(sorted((k,str(v)) for k,v in params.items())))
    cached=cache.get(cache_key)
    if cached is not None:
        return cached

    last_error=None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r=await client.get(f"{BASE}/{path}",params=params)
                if r.status_code==429:
                    await asyncio.sleep(0.8*(attempt+1))
                    last_error=RuntimeError("Market-data rate limit reached.")
                    continue
                r.raise_for_status()
                data=r.json()
                cache.set(cache_key,data,ttl)
                return data
        except Exception as e:
            last_error=e
            if attempt<2:
                await asyncio.sleep(0.5*(attempt+1))
    raise last_error or RuntimeError("Market-data request failed.")

async def profile(symbol:str):
    return await get("profile",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper())

async def quote(symbol:str):
    return await get("quote",ttl=TTL_QUOTE,symbol=symbol.upper())

async def history(symbol:str,start:str|None=None,end:str|None=None):
    params={"symbol":symbol.upper()}
    if start: params["from"]=start
    if end: params["to"]=end
    return await get("historical-price-eod/dividend-adjusted",ttl=TTL_HISTORY,**params)

async def income(symbol:str):
    return await get("income-statement",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper(),period="annual",limit=5)

async def balance(symbol:str):
    return await get("balance-sheet-statement",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper(),period="annual",limit=5)

async def cashflow(symbol:str):
    return await get("cash-flow-statement",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper(),period="annual",limit=5)

async def ratios(symbol:str):
    return await get("ratios-ttm",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper())

async def metrics(symbol:str):
    return await get("key-metrics-ttm",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper())

async def peers(symbol:str):
    return await get("stock-peers",ttl=TTL_FUNDAMENTALS,symbol=symbol.upper())

async def etf_info(symbol:str):
    return await get("etf/info",ttl=TTL_ETF,symbol=symbol.upper())

async def etf_holdings(symbol:str):
    """Return ETF holdings from the checked-in monthly snapshot, with a cached fallback.

    The local snapshot is preferred. If a PortfolioPath-selectable ETF is not
    present, use yfinance's top-holdings data as a best-effort fallback and cache
    that result for 30 days. FMP's premium ETF-holdings endpoint is not used.
    """
    ticker=symbol.upper().strip()
    local=get_etf_holdings(ticker)
    if local is not None:
        return local
    cache_key=("etf-holdings-fallback",ticker)
    cached=cache.get(cache_key)
    if cached is not None:
        return cached
    try:
        result=await asyncio.to_thread(fetch_top_holdings,ticker)
        cache.set(cache_key,result,TTL_ETF)
        return result
    except Exception as e:
        return {
            "symbol": ticker,
            "holdings": [],
            "snapshot_date": None,
            "source": "PortfolioPath ETF holdings fallback",
            "unavailable": True,
            "fallback_error": str(e),
        }

