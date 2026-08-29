export type ResearchLink = {
  title: string;
  url: string;
  why: string;
  lookFor: string[];
};

function enc(v:string){ return encodeURIComponent(v); }

export function getResearchLinks(ticker:string,name:string,type:"Stock"|"ETF"):ResearchLink[] {
  const officialSearch = type==="ETF"
    ? `https://www.google.com/search?q=${enc(`${name} ${ticker} official fund page`)}`
    : `https://www.google.com/search?q=${enc(`${name} ${ticker} investor relations`)}`;
  const secSearch = `https://www.sec.gov/edgar/search/#/q=${enc(ticker)}`;
  const yahoo = `https://finance.yahoo.com/quote/${enc(ticker)}/`;
  const morningstar = `https://www.google.com/search?q=${enc(`${ticker} Morningstar`)}`;

  if(type==="ETF"){
    return [
      {title:"Official fund page",url:officialSearch,
       why:"This is the best place to learn what the fund is designed to do and what it actually owns.",
       lookFor:["Expense ratio","Index or strategy","Number of holdings","Top 10 holdings","Sector and country exposure","Fund objective"]},
      {title:"SEC prospectus & filings",url:secSearch,
       why:"These are formal disclosures, so they explain risks and rules that may be less visible on a marketing page.",
       lookFor:["Principal investment risks","Investment objective","Fee table","Portfolio policy","Material changes"]},
      {title:"Yahoo Finance",url:yahoo,
       why:"This gives an easy view of price history, trading activity, basic statistics, and historical performance.",
       lookFor:["Long-term price chart","Large drawdowns","52-week range","Average volume","Performance over multiple time periods"]},
      {title:"Morningstar research",url:morningstar,
       why:"Morningstar can help compare funds using categories, holdings, risk, fees, and historical performance.",
       lookFor:["Fund category","Risk rating","Portfolio composition","Fees","Performance versus category","Style box / asset mix"]}
    ];
  }

  return [
    {title:"Investor relations",url:officialSearch,
     why:"The company’s investor-relations site is the primary source for earnings releases, presentations, and management commentary.",
     lookFor:["Latest earnings release","Revenue growth","Management outlook","Business segments","Investor presentations","Recent company updates"]},
    {title:"SEC filings",url:secSearch,
     why:"SEC filings contain required disclosures and are one of the best places to understand the business and its risks.",
     lookFor:["10-K annual report","10-Q quarterly report","Risk factors","Debt","Cash flow","Share dilution","Material events in 8-K filings"]},
    {title:"Yahoo Finance",url:yahoo,
     why:"This is a quick place to see price history, valuation statistics, earnings dates, analyst estimates, and basic financial information.",
     lookFor:["P/E ratio","Market cap","52-week range","Earnings dates","Revenue and earnings trends","Price performance"]},
    {title:"Morningstar research",url:morningstar,
     why:"Morningstar can provide another independent view of valuation, profitability, financial health, and historical performance.",
     lookFor:["Valuation","Profitability","Financial health","Historical returns","Industry comparison","Risk"]}
  ];
}
