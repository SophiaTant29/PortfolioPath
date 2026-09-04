from app.yahoo_fund_holdings import dataframe_to_holdings

class FakeFrame:
    def reset_index(self):
        return self
    def to_dict(self,orient="records"):
        assert orient=="records"
        return [
            {"Symbol":"AAPL","Holding Percent":0.08},
            {"Symbol":"MSFT","Holding Percent":"7.5%"},
        ]

def test_dataframe_parser_handles_decimal_and_percent_string():
    rows=dataframe_to_holdings(FakeFrame())
    assert rows==[
        {"ticker":"AAPL","weight":0.08},
        {"ticker":"MSFT","weight":0.075},
    ]
