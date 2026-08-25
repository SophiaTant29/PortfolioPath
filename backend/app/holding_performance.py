from __future__ import annotations

def safe_float(v, default=0.0):
    try:
        return float(v)
    except:
        return default

def normalize_history(rows):
    out=[]
    for r in rows or []:
        date=r.get("date")
        px=r.get("adjClose",r.get("adjustedClose",r.get("close",r.get("price"))))
        try:
            px=float(px)
        except:
            continue
        if date and px>0:
            out.append({"date":date,"close":px})
    out.sort(key=lambda x:x["date"])
    return out

def last_price_on_or_before(history,date):
    ans=None
    for row in history:
        if row["date"]<=date:
            ans=row["close"]
        else:
            break
    return ans

def holding_return_from_transactions(transactions, history):
    """
    Money-weight-neutral approximation for review purposes:
    each BUY lot is measured from its transaction price to latest price.
    SELLs reduce open shares using average-cost accounting.
    This is intended for holding review, not tax accounting.
    """
    hist=normalize_history(history)
    if not hist:
        return None

    latest=hist[-1]["close"]
    txs=sorted(transactions,key=lambda x:x["trade_date"])

    shares=0.0
    cost=0.0
    invested=0.0

    for t in txs:
        typ=t["transaction_type"]
        qty=safe_float(t.get("shares"))
        price=safe_float(t.get("price"))
        fees=safe_float(t.get("fees"))
        if typ=="BUY":
            shares += qty
            cost += qty*price + fees
        elif typ=="SELL" and shares>0:
            avg=cost/shares if shares else 0
            sell_qty=min(qty,shares)
            shares -= sell_qty
            cost -= avg*sell_qty

    if shares<=0 or cost<=0:
        return {
            "open_shares":max(0,shares),
            "avg_cost":0,
            "latest_price":latest,
            "holding_return":0,
            "market_value":0,
            "cost_basis":0,
        }

    avg=cost/shares
    mv=shares*latest
    ret=(latest/avg-1)*100 if avg>0 else 0

    return {
        "open_shares":round(shares,8),
        "avg_cost":round(avg,6),
        "latest_price":round(latest,6),
        "holding_return":round(ret,6),
        "market_value":round(mv,2),
        "cost_basis":round(cost,2),
    }
