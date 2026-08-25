from app.review_engine import review_holding

def test_concentrated_underperformer_is_flagged():
    r=review_holding(
        ticker="XYZ",
        amount=3000,
        portfolio_total=10000,
        holding_return=-15,
        benchmark_return=5,
        holding_risk=85,
        investor_risk=50,
        portfolio_excess=-10,
        max_drawdown=-30,
        fundamental_status="Weakening",
    )
    assert r["status"]=="Consider Replacing"
