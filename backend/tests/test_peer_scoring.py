from app.peer_scoring import percentile_rank

def test_percentile_direction():
    peers=[10,20,30,40,50]
    assert percentile_rank(45,peers,True)>50
    assert percentile_rank(45,peers,False)<50
