export type ResearchResource = {
  title: string;
  why: string;
  lookFor: string[];
};

export const categoryGuidance: Record<string, { role: string; questions: string[] }> = {
  "Broad U.S. Market": {
    role: "Build a diversified core across many U.S. companies rather than relying on a few individual businesses.",
    questions: [
      "How broad is the exposure: total market, large-cap only, or a style tilt?",
      "How concentrated are the largest holdings?",
      "What does the fund cost and how closely does it track its benchmark?",
      "Would this overlap heavily with another fund you already selected?"
    ]
  },
  "Technology": {
    role: "Add targeted exposure to technology businesses while controlling sector concentration and company-specific risk.",
    questions: [
      "Which technology industries drive the company or fund?",
      "How dependent is the investment on a few products or customers?",
      "How strong are revenue growth, profitability, free cash flow, and balance-sheet quality?",
      "How expensive is the investment relative to peers and its own history?"
    ]
  },
  "Healthcare": {
    role: "Add exposure to healthcare businesses whose risks can differ from the broader market.",
    questions: [
      "What products, services, or drug franchises drive revenue?",
      "Are there patent, clinical-trial, reimbursement, or regulatory risks?",
      "How consistent are margins and free cash flow?",
      "How concentrated is the company or fund in a small number of holdings?"
    ]
  },
  "Financials": {
    role: "Add exposure to banks, insurers, asset managers, and other financial businesses.",
    questions: [
      "How sensitive is the business to interest rates and credit conditions?",
      "What does balance-sheet strength look like?",
      "How stable are earnings through different economic environments?",
      "For a fund, how concentrated is it in the largest banks?"
    ]
  },
  "Consumer": {
    role: "Add exposure to businesses tied to consumer spending and household demand.",
    questions: [
      "Is demand discretionary or defensive?",
      "How strong is the brand or competitive position?",
      "Are margins and free cash flow durable?",
      "How sensitive is the business to inflation and economic slowdowns?"
    ]
  },
  "Industrials": {
    role: "Add exposure to manufacturing, transportation, infrastructure, aerospace, and other industrial activity.",
    questions: [
      "How cyclical is demand?",
      "What does the order backlog or demand pipeline look like?",
      "How capital-intensive is the business?",
      "How diversified are customers and end markets?"
    ]
  },
  "Energy": {
    role: "Add exposure to energy producers, services, infrastructure, or a diversified energy fund.",
    questions: [
      "How sensitive are earnings to oil and natural-gas prices?",
      "What does debt look like across commodity cycles?",
      "How much free cash flow is generated at different price environments?",
      "Does a fund concentrate heavily in a few mega-cap producers?"
    ]
  },
  "Real Estate": {
    role: "Add listed real-estate exposure through REITs or diversified real-estate funds.",
    questions: [
      "What property types drive the investment?",
      "How sensitive is it to interest rates and refinancing costs?",
      "How strong are occupancy, lease terms, and cash-flow coverage?",
      "How diversified is the fund across property types and issuers?"
    ]
  },
  "International": {
    role: "Diversify beyond the U.S. across developed and/or emerging markets.",
    questions: [
      "Which countries and regions dominate the exposure?",
      "How much emerging-market exposure is included?",
      "How concentrated is the investment by country, company, or currency?",
      "How much does it overlap with other international holdings?"
    ]
  },
  "Small-Cap / Higher Risk": {
    role: "Add a controlled allocation to smaller or higher-volatility companies without letting that risk dominate the portfolio.",
    questions: [
      "How volatile and financially resilient are the underlying companies?",
      "How concentrated is the investment?",
      "Does the position size match the portfolio's risk budget?",
      "Is recent performance influencing the decision more than fundamentals?"
    ]
  },
  "Bonds": {
    role: "Add income and potential stability through fixed-income securities.",
    questions: [
      "What is the portfolio's duration and interest-rate sensitivity?",
      "What is the credit quality?",
      "What yield is being earned for the risk taken?",
      "How diversified is the fund across issuers and maturities?"
    ]
  },
  "Short-Term / Cash": {
    role: "Preserve liquidity and reduce portfolio volatility for money intended to stay readily available.",
    questions: [
      "What is the current yield?",
      "How stable is the value?",
      "How quickly can the money be accessed?",
      "What expenses or restrictions apply?"
    ]
  }
};

export function guidanceFor(category?: string) {
  return categoryGuidance[category ?? ""] ?? {
    role: "Fill this allocation role with an investment you understand well enough to explain its purpose, strengths, and risks.",
    questions: [
      "What role does this investment play?",
      "What are its major risks?",
      "What are its main strengths and risks?",
      "Does it overlap with holdings already selected?"
    ]
  };
}

export function researchResources(type: "Stock" | "ETF"): ResearchResource[] {
  if (type === "ETF") {
    return [
      {
        title: "Official fund page & prospectus",
        why: "This is the primary source for what the fund actually owns, what index or strategy it follows, and what it charges.",
        lookFor: ["Expense ratio", "Benchmark or strategy", "Number of holdings", "Top holdings", "Country/sector exposure", "Prospectus risks"]
      },
      {
        title: "SEC filings",
        why: "SEC filings and the prospectus are formal disclosures rather than marketing summaries.",
        lookFor: ["Principal risks", "Investment objective", "Fee table", "Portfolio policy", "Material changes"]
      },
      {
        title: "Price & historical behavior",
        why: "Historical prices help you see volatility and drawdowns; they do not tell you what will happen next.",
        lookFor: ["Large drawdowns", "Volatility", "Long flat periods", "Benchmark tracking", "Behavior during market stress"]
      },
      {
        title: "PortfolioPath comparison",
        why: "Funds can look different while owning many of the same securities. Comparing alternatives helps avoid unnecessary duplication.",
        lookFor: ["Overlap", "Cost", "Diversification", "Concentration", "Liquidity", "Track record"]
      }
    ];
  }

  return [
    {
      title: "Investor relations",
      why: "The company's own investor-relations materials explain its business, reported results, presentations, and earnings releases.",
      lookFor: ["Revenue drivers", "Business segments", "Management commentary", "Earnings releases", "Investor presentations"]
    },
    {
      title: "SEC filings",
      why: "10-K, 10-Q, and 8-K filings contain required disclosures that can reveal risks and changes not obvious from a price chart.",
      lookFor: ["Risk factors", "Financial statements", "Debt", "Cash flow", "Share dilution", "Material events"]
    },
    {
      title: "Financial trends",
      why: "A company's quality is better understood through trends than through one quarter or one headline.",
      lookFor: ["Revenue growth", "Margins", "Free cash flow", "Profitability", "Debt", "Return on equity/capital"]
    },
    {
      title: "Valuation & peer comparison",
      why: "A strong company can still be expensive. Peer context helps you understand what expectations may already be reflected in the price.",
      lookFor: ["P/E", "PEG", "EV/EBITDA", "Free-cash-flow yield", "Peer medians", "Historical valuation range"]
    },
    {
      title: "Price & historical behavior",
      why: "Price history helps you understand volatility and drawdowns, not predict future returns.",
      lookFor: ["Maximum drawdown", "Volatility", "Recovery periods", "Relative performance", "Reaction to earnings"]
    }
  ];
}
