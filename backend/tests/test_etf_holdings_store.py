from app.etf_holdings_store import get_etf_holdings, snapshot_metadata
from app.etf_scoring import overlap_between


def test_snapshot_metadata_and_known_funds():
    meta = snapshot_metadata()
    assert meta["snapshot_date"]
    assert "VOO" in meta["supported_symbols"]
    assert "QQQ" in meta["supported_symbols"]


def test_voo_qqq_monthly_overlap_works_without_live_provider():
    voo = get_etf_holdings("VOO")
    qqq = get_etf_holdings("QQQ")
    assert voo and qqq
    result = overlap_between(voo, qqq)
    assert result["common_holdings"] >= 8
    assert result["overlap_pct"] > 20
    assert result["coverage_a_pct"] > 30
    assert result["coverage_b_pct"] > 40


def test_unknown_etf_is_not_treated_as_empty_known_fund():
    assert get_etf_holdings("NOTAREALFUND") is None
