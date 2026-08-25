from __future__ import annotations
from dataclasses import dataclass
from math import sqrt
from statistics import pstdev
from typing import Iterable

@dataclass
class Tx:
    symbol: str
    transaction_type: str
    trade_date: str
    shares: float
    price: float
    fees: float = 0.0

def normalize_history(rows):
    out=[]
    for r in rows or []:
        date=r.get("date")
        close=r.get("adjClose", r.get("adjustedClose", r.get("close", r.get("price"))))
        if date and close is not None:
            try:
                px=float(close)
                if px>0:
                    out.append({"date":date,"close":px})
            except:
                pass
    out.sort(key=lambda x:x["date"])
    return out

def last_price_on_or_before(history, date):
    lo,hi=0,len(history)-1
    ans=None
    while lo<=hi:
        mid=(lo+hi)//2
        if history[mid]["date"]<=date:
            ans=history[mid]["close"]
            lo=mid+1
        else:
            hi=mid-1
    return ans

def build_daily_backtest(
    starting_cash: float,
    transactions: list[dict],
    histories: dict[str,list[dict]],
    benchmark_history: list[dict],
):
    txs=[Tx(
        symbol=t["symbol"],
        transaction_type=t["transaction_type"],
        trade_date=t["trade_date"],
        shares=float(t["shares"]),
        price=float(t["price"]),
        fees=float(t.get("fees",0) or 0),
    ) for t in transactions]
    txs.sort(key=lambda t:t.trade_date)

    if not txs:
        return {
            "series":[],
            "portfolio_return":0,
            "benchmark_return":0,
            "excess_return":0,
            "max_drawdown":0,
            "annualized_volatility":0,
            "current_value":starting_cash,
        }

    histories={k:normalize_history(v) for k,v in histories.items()}
    benchmark_history=normalize_history(benchmark_history)

    dates=sorted(set(
        [x["date"] for rows in histories.values() for x in rows]
        + [x["date"] for x in benchmark_history]
        + [t.trade_date for t in txs]
    ))

    start=txs[0].trade_date
    dates=[d for d in dates if d>=start]

    cash=float(starting_cash)
    shares={}
    tx_i=0
    bench_start=None
    series=[]

    for date in dates:
        while tx_i<len(txs) and txs[tx_i].trade_date<=date:
            t=txs[tx_i]
            shares[t.symbol]=shares.get(t.symbol,0.0)
            gross=t.shares*t.price
            if t.transaction_type=="BUY":
                shares[t.symbol]+=t.shares
                cash-=gross+t.fees
            elif t.transaction_type=="SELL":
                shares[t.symbol]-=t.shares
                cash+=gross-t.fees
            elif t.transaction_type=="DIVIDEND":
                cash+=gross
            tx_i+=1

        value=cash
        valid=True
        for symbol,qty in shares.items():
            if qty<=1e-12:
                continue
            px=last_price_on_or_before(histories.get(symbol,[]),date)
            if px is None:
                valid=False
                break
            value+=qty*px
        if not valid:
            continue

        bpx=last_price_on_or_before(benchmark_history,date)
        if bpx is None:
            continue
        if bench_start is None:
            bench_start=bpx

        portfolio_growth=100*(value/starting_cash) if starting_cash else 100
        benchmark_growth=100*(bpx/bench_start) if bench_start else 100

        series.append({
            "date":date,
            "portfolio_value":round(value,2),
            "portfolio_growth":round(portfolio_growth,6),
            "benchmark_growth":round(benchmark_growth,6),
            "portfolio_return":round(portfolio_growth-100,6),
            "benchmark_return":round(benchmark_growth-100,6),
            "excess_return":round(portfolio_growth-benchmark_growth,6),
        })

    if not series:
        raise ValueError("No aligned historical data was available.")

    latest=series[-1]
    peak=series[0]["portfolio_value"]
    max_dd=0.0
    daily=[]

    for i,row in enumerate(series):
        peak=max(peak,row["portfolio_value"])
        if peak>0:
            dd=row["portfolio_value"]/peak-1
            max_dd=min(max_dd,dd)
        if i>0 and series[i-1]["portfolio_value"]>0:
            daily.append(row["portfolio_value"]/series[i-1]["portfolio_value"]-1)

    vol=pstdev(daily)*sqrt(252) if len(daily)>=2 else 0.0

    return {
        "series":series,
        "current_value":latest["portfolio_value"],
        "portfolio_return":latest["portfolio_return"],
        "benchmark_return":latest["benchmark_return"],
        "excess_return":latest["excess_return"],
        "max_drawdown":round(max_dd*100,6),
        "annualized_volatility":round(vol*100,6),
        "start_date":series[0]["date"],
        "end_date":series[-1]["date"],
        "observations":len(series),
    }
