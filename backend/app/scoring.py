from __future__ import annotations
from math import sqrt
from statistics import pstdev

def clamp(x, lo=0.0, hi=100.0):
    try:
        return max(lo, min(hi, float(x)))
    except:
        return 50.0

def safe(v, default=None):
    try:
        if v is None:
            return default
        return float(v)
    except:
        return default

def first(rows):
    return rows[0] if isinstance(rows,list) and rows else {}

def score_between(value, bad, good, inverse=False):
    if value is None:
        return 50.0
    if bad == good:
        return 50.0
    x=(value-bad)/(good-bad)
    s=clamp(x*100)
    return 100-s if inverse else s

def annualized_volatility(history):
    rows=sorted(history or [], key=lambda x:x.get("date",""))
    prices=[]
    for r in rows:
        px=safe(r.get("adjClose",r.get("adjustedClose",r.get("close"))))
        if px and px>0:
            prices.append(px)
    if len(prices)<3:
        return None
    rets=[prices[i]/prices[i-1]-1 for i in range(1,len(prices)) if prices[i-1]>0]
    if len(rets)<2:
        return None
    return pstdev(rets)*sqrt(252)

def growth_scores(income):
    i0,i1=first(income), income[1] if isinstance(income,list) and len(income)>1 else {}
    rev0,rev1=safe(i0.get("revenue")),safe(i1.get("revenue"))
    eps0,eps1=safe(i0.get("eps")),safe(i1.get("eps"))
    rev_growth=(rev0/rev1-1) if rev0 is not None and rev1 not in (None,0) else safe(i0.get("revenueGrowth"))
    eps_growth=(eps0/eps1-1) if eps0 is not None and eps1 not in (None,0) else safe(i0.get("epsgrowth"))
    rev_score=score_between(rev_growth,-0.10,0.25)
    eps_score=score_between(eps_growth,-0.15,0.30)
    return round((rev_score+eps_score)/2,1), rev_growth, eps_growth

def profitability_scores(income, cashflow):
    i0=first(income); c0=first(cashflow)
    revenue=safe(i0.get("revenue"))
    net_income=safe(i0.get("netIncome"))
    operating_income=safe(i0.get("operatingIncome"))
    fcf=safe(c0.get("freeCashFlow"))
    net_margin=(net_income/revenue) if revenue and net_income is not None else None
    op_margin=(operating_income/revenue) if revenue and operating_income is not None else None
    fcf_margin=(fcf/revenue) if revenue and fcf is not None else None
    parts=[
        score_between(net_margin,-0.02,0.20),
        score_between(op_margin,0.00,0.25),
        score_between(fcf_margin,-0.03,0.18),
    ]
    return round(sum(parts)/len(parts),1), net_margin, op_margin, fcf_margin

def financial_strength_scores(balance, cashflow, income):
    b0=first(balance); c0=first(cashflow); i0=first(income)
    debt=safe(b0.get("totalDebt"))
    equity=safe(b0.get("totalStockholdersEquity",b0.get("totalEquity")))
    cash=safe(b0.get("cashAndCashEquivalents",b0.get("cashAndShortTermInvestments")))
    fcf=safe(c0.get("freeCashFlow"))
    revenue=safe(i0.get("revenue"))
    debt_to_equity=(debt/equity) if debt is not None and equity not in (None,0) and equity>0 else None
    cash_to_debt=(cash/debt) if cash is not None and debt not in (None,0) else None
    fcf_margin=(fcf/revenue) if revenue and fcf is not None else None
    parts=[
        score_between(debt_to_equity,2.5,0.15,inverse=False) if debt_to_equity is not None else 50,
        score_between(cash_to_debt,0.05,1.0),
        score_between(fcf_margin,-0.03,0.18),
    ]
    # Fix D/E direction explicitly: lower is better
    if debt_to_equity is not None:
        parts[0]=score_between(debt_to_equity,0.15,2.5,inverse=True)
    return round(sum(parts)/len(parts),1), debt_to_equity, cash_to_debt

def valuation_scores(ratios, metrics):
    r0=first(ratios); m0=first(metrics)
    pe=safe(r0.get("priceToEarningsRatioTTM",r0.get("peRatioTTM",m0.get("peRatioTTM"))))
    pb=safe(r0.get("priceToBookRatioTTM",r0.get("priceBookValueRatioTTM")))
    ev_ebitda=safe(m0.get("enterpriseValueOverEBITDATTM",m0.get("evToEBITDATTM")))
    scores=[]
    if pe is not None and pe>0: scores.append(score_between(pe,12,45,inverse=True))
    if pb is not None and pb>0: scores.append(score_between(pb,1.5,10,inverse=True))
    if ev_ebitda is not None and ev_ebitda>0: scores.append(score_between(ev_ebitda,8,28,inverse=True))
    if not scores: scores=[50]
    return round(sum(scores)/len(scores),1), pe, pb, ev_ebitda

def dividend_scores(ratios, profile):
    r0=first(ratios); p0=first(profile)
    dy=safe(r0.get("dividendYieldTTM",p0.get("lastDiv")))
    payout=safe(r0.get("dividendPayoutRatioTTM"))
    if dy is not None and dy>1: dy=dy/100
    yield_score=score_between(dy,0,0.05)
    payout_score=50
    if payout is not None:
        if payout<0: payout_score=20
        elif payout<=0.70: payout_score=80
        elif payout<=1.00: payout_score=55
        else: payout_score=25
    return round(yield_score*.65+payout_score*.35,1), dy, payout

def stability_score(history):
    vol=annualized_volatility(history)
    if vol is None:
        return 50.0,None
    return round(score_between(vol,0.12,0.60,inverse=True),1),vol

def objective_quality(scores):
    return round(
        scores["financial_strength"]*.30+
        scores["profitability"]*.25+
        scores["growth"]*.20+
        scores["valuation"]*.15+
        scores["stability"]*.10
    ,1)

PROFILE_WEIGHTS={
    "Protect":{"financial_strength":.25,"profitability":.20,"growth":.05,"valuation":.10,"stability":.25,"dividend":.15},
    "Cautious":{"financial_strength":.25,"profitability":.20,"growth":.05,"valuation":.15,"stability":.25,"dividend":.10},
    "Balanced":{"financial_strength":.22,"profitability":.22,"growth":.18,"valuation":.15,"stability":.15,"dividend":.08},
    "Growth":{"financial_strength":.20,"profitability":.20,"growth":.25,"valuation":.15,"stability":.10,"dividend":.05,"momentum":.05},
    "Aggressive Growth":{"financial_strength":.15,"profitability":.20,"growth":.30,"valuation":.10,"stability":.05,"dividend":.05,"momentum":.15},
}

def momentum_score(history):
    rows=sorted(history or [], key=lambda x:x.get("date",""))
    prices=[]
    for r in rows:
        px=safe(r.get("adjClose",r.get("adjustedClose",r.get("close"))))
        if px and px>0:
            prices.append(px)
    if len(prices)<2:
        return 50.0,None
    ret=prices[-1]/prices[0]-1
    return round(score_between(ret,-0.20,0.40),1),ret

def personalized_fit(scores, profile_name, investor_risk, security_risk=None):
    weights=PROFILE_WEIGHTS.get(profile_name,PROFILE_WEIGHTS["Balanced"])
    core=0
    for k,w in weights.items():
        core+=scores.get(k,50)*w

    risk_fit=50
    if security_risk is not None and investor_risk is not None:
        risk_fit=clamp(100-abs(float(security_risk)-float(investor_risk))*1.5)

    return round(core*.85+risk_fit*.15,1), round(risk_fit,1)

def estimate_security_risk(volatility):
    if volatility is None:
        return 55.0
    # Maps roughly 12% vol -> low risk and 60% -> very high.
    return round(clamp(10+(volatility-0.12)/(0.60-0.12)*90),1)

def build_security_scores(*, profile, income, balance, cashflow, ratios, metrics, history, investor_profile):
    growth,rev_growth,eps_growth=growth_scores(income)
    profitability,net_margin,op_margin,fcf_margin=profitability_scores(income,cashflow)
    strength,debt_to_equity,cash_to_debt=financial_strength_scores(balance,cashflow,income)
    valuation,pe,pb,ev_ebitda=valuation_scores(ratios,metrics)
    dividend,div_yield,payout=dividend_scores(ratios,profile)
    stability,volatility=stability_score(history)
    momentum,momentum_return=momentum_score(history)
    security_risk=estimate_security_risk(volatility)

    scores={
        "financial_strength":strength,
        "profitability":profitability,
        "growth":growth,
        "valuation":valuation,
        "stability":stability,
        "dividend":dividend,
        "momentum":momentum,
    }
    quality=objective_quality(scores)
    match,risk_fit=personalized_fit(
        scores,
        investor_profile.get("profileName","Balanced"),
        investor_profile.get("overallRisk",55),
        security_risk,
    )

    return {
        "scores":scores,
        "quality_score":quality,
        "match_score":match,
        "security_risk":security_risk,
        "risk_fit":risk_fit,
        "metrics":{
            "revenue_growth":rev_growth,
            "eps_growth":eps_growth,
            "net_margin":net_margin,
            "operating_margin":op_margin,
            "fcf_margin":fcf_margin,
            "debt_to_equity":debt_to_equity,
            "cash_to_debt":cash_to_debt,
            "pe":pe,
            "price_to_book":pb,
            "ev_to_ebitda":ev_ebitda,
            "dividend_yield":div_yield,
            "payout_ratio":payout,
            "annualized_volatility":volatility,
            "momentum_return":momentum_return,
        }
    }


def quality_from_component_scores(scores):
    return objective_quality(scores)

def match_from_component_scores(scores, investor_profile, security_risk):
    match,risk_fit=personalized_fit(
        scores,
        investor_profile.get("profileName","Balanced"),
        investor_profile.get("overallRisk",55),
        security_risk,
    )
    return match,risk_fit
