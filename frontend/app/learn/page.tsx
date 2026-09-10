import Link from "next/link";

const topics=[
  ["Asset allocation","How a portfolio divides money across stocks, bonds, cash-like holdings, regions, and other categories."],
  ["Diversification","Why owning investments with different underlying exposures can reduce dependence on one company, sector, or outcome."],
  ["Stocks vs. ETFs","A stock represents ownership in one company. An ETF is a fund that can hold dozens, hundreds, or even thousands of investments."],
  ["Dividends","Cash distributions that some companies or funds make to shareholders. Dividends are not guaranteed and can be reduced or stopped."],
  ["Risk and volatility","Risk is the possibility of losing money or not reaching a goal. Volatility describes how much prices move over time."],
  ["Time horizon","How long money can remain invested before it may be needed. A longer horizon can change how market fluctuations are experienced."],
  ["Bonds","Debt investments in which an investor lends money to a government or company in exchange for promised interest and repayment terms."],
  ["Expense ratio","The annual operating cost of a fund, expressed as a percentage of assets."],
  ["Market capitalization","The total market value of a company's shares. It is commonly used to group companies as large-, mid-, or small-cap."],
  ["Valuation","Ways of comparing a security's price with business fundamentals such as earnings, cash flow, or sales."],
  ["ETF overlap","Why two funds can look different but own many of the same underlying companies."],
  ["Concentration","How much of a portfolio depends on one holding, sector, theme, or group of similar investments."],
  ["Liquidity","How easily an investment can generally be bought or sold without a large effect on its price."],
  ["Research basics","What to look for in company filings, fund pages, financial statements, holdings, risks, fees, and business descriptions."],
];

export default function LearnPage(){
  return <>
    <section className="panel">
      <p className="sectionEyebrow">Learning Center</p>
      <h1>Learn before you build</h1>
      <p>If a term in the questionnaire or builder is unfamiliar, start here. PortfolioPath is designed so you can refer back to this page at any point.</p>
      <div className="actions"><Link className="btn btnPrimary" href="/learn/basics">Learn the Basics — 3 min</Link><Link className="btn btnSecondary" href="/learn/glossary">Open Beginner Glossary</Link><Link className="btn btnSecondary" href="/dashboard">Go to My Portfolios</Link></div>
    </section>
    <section className="grid" style={{marginTop:16}}>
      {topics.map(([title,text])=><div className="card" key={title}><h2>{title}</h2><p className="muted">{text}</p></div>)}
    </section>
    <section className="panel" style={{marginTop:16}}>
      <h2>Quick rule for new investors</h2>
      <p>More holdings do not automatically mean better diversification. One broad ETF may already hold many companies, while several ETFs can still overlap heavily.</p>
      <p className="educationalNotice">PortfolioPath teaches investing concepts through hypothetical model portfolios. It does not recommend that you buy, sell, or hold any security.</p>
    </section>
  </>;
}
