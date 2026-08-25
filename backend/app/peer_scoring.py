from __future__ import annotations
from statistics import median

def safe(v):
    try:
        if v is None: return None
        return float(v)
    except:
        return None

def percentile_rank(value, peer_values, higher_is_better=True):
    vals=[float(x) for x in peer_values if x is not None]
    if value is None or len(vals)<3:
        return None
    value=float(value)
    below=sum(1 for x in vals if x<value)
    equal=sum(1 for x in vals if x==value)
    pct=(below+0.5*equal)/len(vals)*100
    return round(pct if higher_is_better else 100-pct,1)

def winsorize(values, lower=.05, upper=.95):
    vals=sorted(float(x) for x in values if x is not None)
    if len(vals)<4:return vals
    lo=vals[max(0,int(len(vals)*lower)-1)]
    hi=vals[min(len(vals)-1,int(len(vals)*upper))]
    return [min(hi,max(lo,x)) for x in vals]

def metric_value(bundle, key):
    m=bundle.get("metrics",{})
    return safe(m.get(key))

def build_peer_relative_scores(target:dict, peers:list[dict]):
    """
    `target` and each peer are outputs of the base security scoring pipeline.
    Scores are percentile ranks within the peer set.

    Higher-is-better metrics:
      revenue growth, EPS growth, margins, cash/debt, dividend yield (moderately)
    Lower-is-better metrics:
      debt/equity, P/E, price/book, EV/EBITDA, volatility
    """
    definitions={
        "revenue_growth": True,
        "eps_growth": True,
        "net_margin": True,
        "operating_margin": True,
        "fcf_margin": True,
        "cash_to_debt": True,
        "debt_to_equity": False,
        "pe": False,
        "price_to_book": False,
        "ev_to_ebitda": False,
        "annualized_volatility": False,
        "dividend_yield": True,
    }

    ranks={}
    for key,higher in definitions.items():
        value=metric_value(target,key)
        vals=winsorize([metric_value(p,key) for p in peers])
        ranks[key]=percentile_rank(value,vals,higher_is_better=higher)

    def avg(keys, fallback):
        vals=[ranks[k] for k in keys if ranks.get(k) is not None]
        return round(sum(vals)/len(vals),1) if vals else fallback

    base=target.get("scores",{})
    peer_scores={
        "financial_strength":avg(["debt_to_equity","cash_to_debt","fcf_margin"],base.get("financial_strength",50)),
        "profitability":avg(["net_margin","operating_margin","fcf_margin"],base.get("profitability",50)),
        "growth":avg(["revenue_growth","eps_growth"],base.get("growth",50)),
        "valuation":avg(["pe","price_to_book","ev_to_ebitda"],base.get("valuation",50)),
        "stability":avg(["annualized_volatility"],base.get("stability",50)),
        "dividend":avg(["dividend_yield"],base.get("dividend",50)),
        "momentum":base.get("momentum",50),
    }

    coverage=sum(1 for v in ranks.values() if v is not None)
    possible=len(ranks)
    confidence=round(coverage/possible*100,1)

    return {
        "peer_scores":peer_scores,
        "metric_percentiles":ranks,
        "peer_coverage":confidence,
        "peer_count":len(peers),
    }
