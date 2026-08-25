from app.holding_performance import holding_return_from_transactions

def test_holding_return_buy():
    txs=[{"symbol":"AAA","transaction_type":"BUY","trade_date":"2026-01-01","shares":10,"price":100,"fees":0}]
    hist=[{"date":"2026-01-01","close":100},{"date":"2026-02-01","close":120}]
    r=holding_return_from_transactions(txs,hist)
    assert round(r["holding_return"],2)==20.0
    assert round(r["market_value"],2)==1200.0

def test_holding_return_after_partial_sell():
    txs=[
        {"symbol":"AAA","transaction_type":"BUY","trade_date":"2026-01-01","shares":10,"price":100,"fees":0},
        {"symbol":"AAA","transaction_type":"SELL","trade_date":"2026-01-10","shares":5,"price":110,"fees":0},
    ]
    hist=[{"date":"2026-01-01","close":100},{"date":"2026-02-01","close":120}]
    r=holding_return_from_transactions(txs,hist)
    assert round(r["open_shares"],2)==5.0
    assert round(r["avg_cost"],2)==100.0
