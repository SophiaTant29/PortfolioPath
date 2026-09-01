from __future__ import annotations
from math import sqrt
from statistics import pstdev

def clamp(x,lo=0,hi=100):
    try:return max(lo,min(hi,float(x)))
    except:return 50.0

def safe(v,default=None):
    try:
        if v is None:return default
        return float(v)
    except:return default

def first(rows):
    return rows[0] if isinstance(rows,list) and rows else (rows if isinstance(rows,dict) else {})

def score_between(value,bad,good,inverse=False):
    if value is None:return 50.0
    x=(float(value)-bad)/(good-bad) if good!=bad else .5
    s=clamp(x*100)
    return 100-s if inverse else s

def annualized_volatility(history):
    rows=sorted(history or [],key=lambda x:x.get("date",""))
    prices=[]
    for r in rows:
        px=safe(r.get("adjClose",r.get("adjustedClose",r.get("close"))))
        if px and px>0: prices.append(px)
    if len(prices)<3:return None
    rets=[prices[i]/prices[i-1]-1 for i in range(1,len(prices)) if prices[i-1]>0]
    if len(rets)<2:return None
    return pstdev(rets)*sqrt(252)

def concentration_metrics(holdings):
    weights=[]
    for h in holdings or []:
        w=safe(h.get("weightPercentage",h.get("weight",h.get("percentage"))))
        if w is None: continue
        if w>1: w=w/100
        if w>=0: weights.append(w)
    weights=sorted(weights,reverse=True)
    top10=sum(weights[:10]) if weights else None
    hhi=sum(w*w for w in weights) if weights else None
    count=len(weights)
    return top10,hhi,count

def normalize_assets(info):
    i=first(info)
    return safe(
        i.get("assetsUnderManagement",
        i.get("aum",
        i.get("totalAssets")))
    )

def normalize_expense(info):
    i=first(info)
    v=safe(i.get("expenseRatio",i.get("expenseRatioPercentage")))
    if v is not None and v>1:v=v/100
    return v

def normalize_volume(info):
    i=first(info)
    return safe(i.get("averageVolume",i.get("avgVolume")))

def normalize_inception_years(info):
    i=first(info)
    date=i.get("inceptionDate")
    if not date:return None
    try:
        from datetime import date as D
        y=int(str(date)[:4])
        return max(0,D.today().year-y)
    except:return None

def build_etf_score(*,info,holdings,history,investor_profile,portfolio_category=None):
    expense=normalize_expense(info)
    aum=normalize_assets(info)
    avg_volume=normalize_volume(info)
    years=normalize_inception_years(info)
    vol=annualized_volatility(history)
    top10,hhi,count=concentration_metrics(holdings)

    cost_score=score_between(expense,.012,.0003,inverse=False) if expense is not None else 50
    # Explicit lower-is-better orientation.
    if expense is not None:
        cost_score=score_between(expense,.0003,.012,inverse=True)

    liquidity_score=score_between(avg_volume,50_000,2_000_000) if avg_volume is not None else 50
    fund_size_score=score_between(aum,50_000_000,10_000_000_000) if aum is not None else 50
    track_record_score=score_between(years,1,10) if years is not None else 50
    stability_score=score_between(vol,.10,.50,inverse=True) if vol is not None else 50

    diversification_parts=[]
    if count:
        diversification_parts.append(score_between(count,20,500))
    if top10 is not None:
        diversification_parts.append(score_between(top10,.20,.75,inverse=True))
    if hhi is not None:
        diversification_parts.append(score_between(hhi,.002,.08,inverse=True))
    diversification_score=sum(diversification_parts)/len(diversification_parts) if diversification_parts else 50

    concentration_score=50
    if top10 is not None:
        concentration_score=score_between(top10,.20,.75,inverse=True)

    investor_risk=safe(investor_profile.get("overallRisk"),55)
    implied_risk=55 if vol is None else clamp(10+(vol-.10)/(.50-.10)*90)
    risk_fit=clamp(100-abs(implied_risk-investor_risk)*1.4)

    # Beginner orientation: broad, low-cost, diversified ETFs score well.
    core=(
        diversification_score*.24+
        cost_score*.16+
        liquidity_score*.12+
        concentration_score*.12+
        stability_score*.12+
        fund_size_score*.10+
        track_record_score*.08+
        risk_fit*.06
    )

    # Portfolio category fit is intentionally light; this is not expected return.
    category_fit=80 if portfolio_category else 65
    match=core*.90+category_fit*.10

    return {
        "match_score":round(clamp(match),1),
        "quality_score":round(clamp(core),1),
        "estimated_risk":round(implied_risk,1),
        "scores":{
            "diversification":round(diversification_score,1),
            "expense_ratio":round(cost_score,1),
            "liquidity":round(liquidity_score,1),
            "concentration":round(concentration_score,1),
            "stability":round(stability_score,1),
            "fund_size":round(fund_size_score,1),
            "track_record":round(track_record_score,1),
            "risk_fit":round(risk_fit,1),
        },
        "metrics":{
            "expense_ratio":expense,
            "aum":aum,
            "average_volume":avg_volume,
            "years_since_inception":years,
            "annualized_volatility":vol,
            "top10_weight":top10,
            "hhi":hhi,
            "holding_count":count,
        }
    }

def overlap_between(holdings_a,holdings_b):
    def normalize_rows(payload):
        if isinstance(payload,list): return payload
        if isinstance(payload,dict):
            for key in ("holdings","data","portfolioHoldings","results"):
                value=payload.get(key)
                if isinstance(value,list): return value
            # Some providers return ticker-keyed holding objects.
            vals=[v for v in payload.values() if isinstance(v,dict)]
            if vals: return vals
        return []

    def map_holdings(rows):
        out={}
        for h in normalize_rows(rows):
            if not isinstance(h,dict): continue
            ticker=str(h.get("asset") or h.get("symbol") or h.get("ticker") or h.get("name") or "").upper().strip()
            if not ticker: continue
            w=safe(h.get("weightPercentage",h.get("weight",h.get("percentage",h.get("portfolioWeight")))))
            if w is None: continue
            if w>1:w=w/100
            if w<0: continue
            out[ticker]=max(out.get(ticker,0),w)
        return out

    a=map_holdings(holdings_a); b=map_holdings(holdings_b)
    common=sorted(set(a)&set(b))
    overlap=sum(min(a[t],b[t]) for t in common)
    top=sorted(
        [{"ticker":t,"weight_a":a[t],"weight_b":b[t],"shared_weight":min(a[t],b[t])} for t in common],
        key=lambda x:x["shared_weight"],reverse=True
    )[:10]
    return {
        "overlap_pct":round(overlap*100,2),
        "common_holdings":len(common),
        "top_common":top,
        "holdings_a_count":len(a),
        "holdings_b_count":len(b),
        "warning":"One or both ETF holding datasets were empty." if not a or not b else None
    }
