from app.etf_scoring import overlap_between

def test_overlap():
    a=[{"symbol":"AAA","weight":.6},{"symbol":"BBB","weight":.4}]
    b=[{"symbol":"AAA","weight":.5},{"symbol":"CCC","weight":.5}]
    r=overlap_between(a,b)
    assert round(r["overlap_pct"],1)==50.0
