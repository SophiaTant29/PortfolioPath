import asyncio, os, secrets
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from . import market_data
from .analytics import build_daily_backtest
from .review_engine import extract_fundamental_trend, review_holding
from .scoring import build_security_scores, quality_from_component_scores, match_from_component_scores
from .peer_scoring import build_peer_relative_scores
from .etf_scoring import build_etf_score, overlap_between
from .holding_performance import holding_return_from_transactions
from .etf_holdings_store import snapshot_metadata

app=FastAPI(title="PortfolioPath Analytics API",version="1.0.0")

frontend_origin=os.getenv("FRONTEND_ORIGIN","http://localhost:3000").rstrip("/")
allowed_origins=list(dict.fromkeys(["http://localhost:3000","http://127.0.0.1:3000",frontend_origin]))
# Vercel creates a new preview/deployment hostname on each push. Restrict the
# regex to PortfolioPath deployments under the owner's Vercel team rather than
# allowing arbitrary *.vercel.app origins.
vercel_origin_regex=os.getenv(
    "FRONTEND_ORIGIN_REGEX",
    r"^https://portfolio-path-[a-z0-9-]+-sophia29-6091\.vercel\.app$"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=vercel_origin_regex,
    allow_credentials=True,
    allow_methods=["GET","POST","OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def protect_analytics_api(request:Request, call_next):
    """Require a server-to-server secret for analytics routes in production.

    Browsers call the authenticated Next.js proxy; the shared secret never ships to clients.
    Health remains public for hosting checks.
    """
    if request.url.path.startswith("/api/"):
        expected=os.getenv("BACKEND_SHARED_SECRET","")
        app_env=os.getenv("APP_ENV","development").lower()
        # Demo deployments remain usable without an extra shared secret.
        # For a true public launch, set BACKEND_SHARED_SECRET on both Render and Vercel;
        # once configured, every /api/* request is protected automatically.
        if expected:
            provided=request.headers.get("x-portfoliopath-backend-key","")
            if not secrets.compare_digest(provided,expected):
                return JSONResponse({"detail":"Unauthorized."},status_code=401)
    return await call_next(request)

@app.get("/health")
def health():
    return {
        "status":"ok",
        "market_data_configured": bool(os.getenv("FMP_API_KEY")),
        "service":"PortfolioPath Analytics API",
        "version":"1.0.0",
    }

@app.get("/api/security/{symbol}")
async def security(symbol:str):
    try:
        profile,quote=await asyncio.gather(
            market_data.profile(symbol),
            market_data.quote(symbol)
        )
        return {"symbol":symbol.upper(),"profile":profile,"quote":quote}
    except Exception as e:
        raise HTTPException(502,str(e))

@app.get("/api/security/{symbol}/history")
async def security_history(symbol:str,start:str|None=None,end:str|None=None):
    try:
        return {"symbol":symbol.upper(),"data":await market_data.history(symbol,start,end)}
    except Exception as e:
        raise HTTPException(502,str(e))

@app.get("/api/security/{symbol}/fundamentals")
async def fundamentals(symbol:str):
    try:
        income,balance,cash,ratios,metrics=await asyncio.gather(
            market_data.income(symbol),
            market_data.balance(symbol),
            market_data.cashflow(symbol),
            market_data.ratios(symbol),
            market_data.metrics(symbol),
        )
        return {
            "symbol":symbol.upper(),
            "income_statement":income,
            "balance_sheet":balance,
            "cash_flow":cash,
            "ratios_ttm":ratios,
            "key_metrics_ttm":metrics
        }
    except Exception as e:
        raise HTTPException(502,str(e))


class BacktestTransaction(BaseModel):
    symbol: str
    transaction_type: str
    trade_date: str
    shares: float
    price: float
    fees: float = 0.0

class BacktestRequest(BaseModel):
    starting_cash: float
    transactions: list[BacktestTransaction]
    benchmark_symbol: str = "^GSPC"

@app.post("/api/analytics/backtest")
async def backtest(req: BacktestRequest):
    if not req.transactions:
        return {
            "series": [],
            "current_value": req.starting_cash,
            "portfolio_return": 0,
            "benchmark_return": 0,
            "excess_return": 0,
            "max_drawdown": 0,
            "annualized_volatility": 0,
            "observations": 0,
        }

    try:
        txs=[t.model_dump() for t in req.transactions]
        start=min(t["trade_date"] for t in txs)
        symbols=sorted(set(t["symbol"] for t in txs))

        history_results=await asyncio.gather(*[
            market_data.history(symbol,start,None)
            for symbol in symbols
        ])

        histories={symbol:rows for symbol,rows in zip(symbols,history_results)}
        benchmark=await market_data.history(req.benchmark_symbol,start,None)

        return build_daily_backtest(
            starting_cash=req.starting_cash,
            transactions=txs,
            histories=histories,
            benchmark_history=benchmark,
        )
    except Exception as e:
        raise HTTPException(502,str(e))


class ReviewHoldingRequest(BaseModel):
    ticker: str
    amount: float
    portfolio_total: float
    holding_return: float
    benchmark_return: float
    holding_risk: float
    investor_risk: float
    portfolio_excess: float | None = None
    max_drawdown: float | None = None

@app.post("/api/analytics/review-holding")
async def review_one(req: ReviewHoldingRequest):
    try:
        income,balance,cash,ratios,metrics=await asyncio.gather(
            market_data.income(req.ticker),
            market_data.balance(req.ticker),
            market_data.cashflow(req.ticker),
            market_data.ratios(req.ticker),
            market_data.metrics(req.ticker),
        )
        fundamentals={
            "income_statement":income,
            "balance_sheet":balance,
            "cash_flow":cash,
            "ratios_ttm":ratios,
            "key_metrics_ttm":metrics,
        }
        trend=extract_fundamental_trend(fundamentals)
        review=review_holding(
            ticker=req.ticker,
            amount=req.amount,
            portfolio_total=req.portfolio_total,
            holding_return=req.holding_return,
            benchmark_return=req.benchmark_return,
            holding_risk=req.holding_risk,
            investor_risk=req.investor_risk,
            portfolio_excess=req.portfolio_excess,
            max_drawdown=req.max_drawdown,
            fundamental_status=trend["status"],
        )
        return {"review":review,"fundamentals":trend}
    except Exception as e:
        raise HTTPException(502,str(e))


class InvestorProfileInput(BaseModel):
    profileName: str = "Balanced"
    overallRisk: float = 55

class SecurityScoreRequest(BaseModel):
    investor_profile: InvestorProfileInput

@app.post("/api/security/{symbol}/score")
async def score_security(symbol:str, req:SecurityScoreRequest):
    try:
        investor=req.investor_profile.model_dump()
        profile,income,balance,cash,ratios,metrics,history,peer_payload=await asyncio.gather(
            market_data.profile(symbol),
            market_data.income(symbol),
            market_data.balance(symbol),
            market_data.cashflow(symbol),
            market_data.ratios(symbol),
            market_data.metrics(symbol),
            market_data.history(symbol,None,None),
            market_data.peers(symbol),
        )

        base=build_security_scores(
            profile=profile,
            income=income,
            balance=balance,
            cashflow=cash,
            ratios=ratios,
            metrics=metrics,
            history=history,
            investor_profile=investor,
        )

        peer_symbols=[]
        if isinstance(peer_payload,list):
            for row in peer_payload:
                if isinstance(row,dict):
                    vals=row.get("peersList") or row.get("peers") or []
                    if isinstance(vals,list): peer_symbols.extend(vals)
                elif isinstance(row,str):
                    peer_symbols.append(row)
        elif isinstance(peer_payload,dict):
            vals=peer_payload.get("peersList") or peer_payload.get("peers") or []
            if isinstance(vals,list): peer_symbols.extend(vals)

        peer_symbols=[p for p in dict.fromkeys(peer_symbols) if p and p.upper()!=symbol.upper()][:12]
        peer_bundles=[]

        async def score_peer(psymbol):
            try:
                pp,pi,pb,pc,pr,pm,ph=await asyncio.gather(
                    market_data.profile(psymbol),
                    market_data.income(psymbol),
                    market_data.balance(psymbol),
                    market_data.cashflow(psymbol),
                    market_data.ratios(psymbol),
                    market_data.metrics(psymbol),
                    market_data.history(psymbol,None,None),
                )
                return build_security_scores(
                    profile=pp,income=pi,balance=pb,cashflow=pc,ratios=pr,metrics=pm,history=ph,
                    investor_profile=investor
                )
            except:
                return None

        if peer_symbols:
            peer_bundles=[x for x in await asyncio.gather(*[score_peer(p) for p in peer_symbols]) if x]

        scoring_method="fixed-cutoff"
        peer_info=None

        if len(peer_bundles)>=3:
            peer_info=build_peer_relative_scores(base,peer_bundles)
            peer_scores=peer_info["peer_scores"]
            quality=quality_from_component_scores(peer_scores)
            match,risk_fit=match_from_component_scores(peer_scores,investor,base["security_risk"])

            # Blend peer-relative and absolute data so tiny/odd peer groups do not dominate.
            coverage=peer_info["peer_coverage"]/100
            blend=min(.80,max(.35,coverage*.80))
            blended_scores={}
            for k in base["scores"]:
                blended_scores[k]=round(peer_scores.get(k,base["scores"][k])*blend + base["scores"][k]*(1-blend),1)

            quality=quality_from_component_scores(blended_scores)
            match,risk_fit=match_from_component_scores(blended_scores,investor,base["security_risk"])
            base["scores"]=blended_scores
            base["quality_score"]=quality
            base["match_score"]=match
            base["risk_fit"]=risk_fit
            scoring_method="peer-relative-blended"

        return {
            "symbol":symbol.upper(),
            **base,
            "scoring_method":scoring_method,
            "peer_analysis":peer_info,
            "peer_symbols":peer_symbols,
        }
    except Exception as e:
        raise HTTPException(502,str(e))


class ETFScoreRequest(BaseModel):
    investor_profile: InvestorProfileInput
    portfolio_category: str | None = None

@app.post("/api/etf/{symbol}/score")
async def score_etf(symbol:str, req:ETFScoreRequest):
    try:
        info,holdings,history=await asyncio.gather(
            market_data.etf_info(symbol),
            market_data.etf_holdings(symbol),
            market_data.history(symbol,None,None),
        )
        result=build_etf_score(
            info=info,
            holdings=holdings,
            history=history,
            investor_profile=req.investor_profile.model_dump(),
            portfolio_category=req.portfolio_category,
        )
        return {
            "symbol":symbol.upper(),
            **result,
            "holdings_preview":(holdings or [])[:15] if isinstance(holdings,list) else []
        }
    except Exception as e:
        raise HTTPException(502,str(e))

class ETFOverlapRequest(BaseModel):
    symbols: list[str]

@app.post("/api/etf/overlap")
async def etf_overlap(req:ETFOverlapRequest):
    symbols=[s.upper() for s in dict.fromkeys(req.symbols) if s][:8]
    if len(symbols)<2:
        return {"symbols":symbols,"pairwise":[],"errors":{},"message":"At least two ETFs are required."}
    results=await asyncio.gather(*[market_data.etf_holdings(s) for s in symbols],return_exceptions=True)
    holdings_by_symbol={}; errors={}
    for symbol,result in zip(symbols,results):
        if isinstance(result,Exception):
            errors[symbol]=str(result)
            continue
        rows=(result or {}).get("holdings",[]) if isinstance(result,dict) else result
        if not rows:
            errors[symbol]=(result or {}).get("fallback_error") or "ETF holdings data is temporarily unavailable for this fund."
            continue
        holdings_by_symbol[symbol]=result
    pairwise=[]
    for i in range(len(symbols)):
        for j in range(i+1,len(symbols)):
            a,b=symbols[i],symbols[j]
            if a not in holdings_by_symbol or b not in holdings_by_symbol:
                continue
            result=overlap_between(holdings_by_symbol[a],holdings_by_symbol[b])
            pairwise.append({"a":a,"b":b,**result})
    meta=snapshot_metadata()
    return {
        "symbols":symbols,
        "pairwise":pairwise,
        "errors":errors,
        "data_cadence":"monthly",
        "snapshot_date":meta.get("snapshot_date"),
        "coverage_note":meta.get("coverage_note"),
        "supported_symbols":meta.get("supported_symbols",[]),
        "sources":{s:(holdings_by_symbol.get(s) or {}).get("source") for s in symbols if s in holdings_by_symbol},
    }


class HoldingPerformanceRequest(BaseModel):
    symbol: str
    transactions: list[BacktestTransaction]

@app.post("/api/analytics/holding-performance")
async def holding_performance(req:HoldingPerformanceRequest):
    try:
        if not req.transactions:
            return {"symbol":req.symbol.upper(),"holding_return":0,"open_shares":0}
        txs=[t.model_dump() for t in req.transactions]
        start=min(t["trade_date"] for t in txs)
        history=await market_data.history(req.symbol,start,None)
        result=holding_return_from_transactions(txs,history)
        if result is None:
            raise ValueError("No historical price data available.")
        return {"symbol":req.symbol.upper(),**result}
    except Exception as e:
        raise HTTPException(502,str(e))
