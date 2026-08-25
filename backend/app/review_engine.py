from __future__ import annotations
from dataclasses import dataclass

def clamp(x, lo=0, hi=100):
    return max(lo, min(hi, x))

def pct_change(new, old):
    try:
        new=float(new); old=float(old)
        if old==0: return None
        return (new/old-1)*100
    except:
        return None

def first(rows):
    return rows[0] if isinstance(rows,list) and rows else {}

def second(rows):
    return rows[1] if isinstance(rows,list) and len(rows)>1 else {}

def extract_fundamental_trend(payload:dict):
    income=payload.get("income_statement") or []
    balance=payload.get("balance_sheet") or []
    cash=payload.get("cash_flow") or []
    ratios=payload.get("ratios_ttm") or []

    inc0,inc1=first(income),second(income)
    bal0,bal1=first(balance),second(balance)
    cf0,cf1=first(cash),second(cash)
    r0=first(ratios)

    revenue_growth = inc0.get("revenueGrowth")
    if revenue_growth is not None:
        try: revenue_growth=float(revenue_growth)*100
        except: revenue_growth=None
    if revenue_growth is None:
        revenue_growth=pct_change(inc0.get("revenue"),inc1.get("revenue"))

    profit_growth=pct_change(inc0.get("netIncome"),inc1.get("netIncome"))
    debt_change=pct_change(bal0.get("totalDebt"),bal1.get("totalDebt"))
    fcf_change=pct_change(cf0.get("freeCashFlow"),cf1.get("freeCashFlow"))

    pe = (
        r0.get("priceToEarningsRatioTTM")
        or r0.get("peRatioTTM")
        or r0.get("priceEarningsRatio")
    )

    score=0
    positives=[]
    concerns=[]

    if revenue_growth is not None:
        if revenue_growth >= 8:
            score += 1
            positives.append("Revenue growth is healthy.")
        elif revenue_growth < 0:
            score -= 2
            concerns.append("Revenue has declined.")

    if profit_growth is not None:
        if profit_growth >= 8:
            score += 1
            positives.append("Net income has improved.")
        elif profit_growth <= -10:
            score -= 2
            concerns.append("Net income has weakened.")

    if debt_change is not None:
        if debt_change <= -5:
            score += 1
            positives.append("Debt has declined.")
        elif debt_change >= 20:
            score -= 1
            concerns.append("Debt has increased materially.")

    if fcf_change is not None:
        if fcf_change >= 10:
            score += 2
            positives.append("Free cash flow has improved.")
        elif fcf_change <= -15:
            score -= 2
            concerns.append("Free cash flow has weakened.")

    status="Stable"
    if score>=3: status="Improving"
    elif score<=-3: status="Weakening"

    return {
        "status":status,
        "score":score,
        "revenue_growth":revenue_growth,
        "profit_growth":profit_growth,
        "debt_change":debt_change,
        "fcf_change":fcf_change,
        "pe":pe,
        "positives":positives,
        "concerns":concerns,
    }

def review_holding(
    *,
    ticker:str,
    amount:float,
    portfolio_total:float,
    holding_return:float,
    benchmark_return:float,
    holding_risk:float,
    investor_risk:float,
    portfolio_excess:float|None=None,
    max_drawdown:float|None=None,
    fundamental_status:str|None=None,
):
    weight=(amount/portfolio_total*100) if portfolio_total>0 else 0
    under=holding_return-benchmark_return
    score=0
    positives=[]
    concerns=[]

    if under<=-15:
        score+=4
        concerns.append(f"{ticker} is underperforming the benchmark by {abs(under):.1f} percentage points.")
    elif under<=-8:
        score+=3
        concerns.append(f"{ticker} is underperforming the benchmark by {abs(under):.1f} percentage points.")
    elif under<=-4:
        score+=2
        concerns.append(f"{ticker} is modestly underperforming the benchmark.")
    elif under>=6:
        positives.append(f"{ticker} is outperforming the benchmark by {under:.1f} percentage points.")
    else:
        positives.append("Performance is reasonably close to the benchmark.")

    if weight>20:
        score+=3
        concerns.append(f"The position is {weight:.1f}% of the selected portfolio, which is highly concentrated.")
    elif weight>12:
        score+=2
        concerns.append(f"The position is {weight:.1f}% of the selected portfolio.")
    else:
        positives.append("Position size is not unusually large.")

    if holding_risk>investor_risk+25:
        score+=3
        concerns.append("The holding's risk level is much higher than the investor profile.")
    elif holding_risk>investor_risk+15:
        score+=2
        concerns.append("The holding's risk level is somewhat higher than the investor profile.")
    else:
        positives.append("Risk is reasonably aligned with the investor profile.")

    if portfolio_excess is not None and portfolio_excess<-8 and under<0:
        score+=1
        concerns.append("The overall portfolio is also trailing the benchmark.")

    if max_drawdown is not None and max_drawdown<=-25 and holding_risk>70:
        score+=1
        concerns.append("The portfolio has experienced a large drawdown and this is one of the higher-risk holdings.")

    if fundamental_status=="Weakening":
        score+=3
        concerns.append("Recent financial data shows weakening business fundamentals.")
    elif fundamental_status=="Improving":
        score=max(0,score-1)
        positives.append("Recent financial data shows improving business fundamentals.")

    if score>=7:
        status="Consider Replacing"
    elif score>=3:
        status="Review"
    else:
        status="Hold"

    return {
        "ticker":ticker,
        "status":status,
        "review_score":score,
        "weight":round(weight,2),
        "relative_performance":round(under,2),
        "positives":positives,
        "concerns":concerns,
    }
