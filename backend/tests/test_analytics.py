from app.analytics import build_daily_backtest

def test_simple_buy_and_hold():
    txs=[{"symbol":"AAA","transaction_type":"BUY","trade_date":"2026-01-02","shares":5,"price":100,"fees":0}]
    histories={"AAA":[
        {"date":"2026-01-02","close":100},
        {"date":"2026-01-03","close":110},
    ]}
    bench=[
        {"date":"2026-01-02","close":100},
        {"date":"2026-01-03","close":105},
    ]
    r=build_daily_backtest(1000,txs,histories,bench)
    assert round(r["current_value"],2)==1050
    assert round(r["portfolio_return"],2)==5
    assert round(r["benchmark_return"],2)==5
