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
    <div className="pageHeader" style={{marginBottom:24}}>
      <div><p className="sectionEyebrow">Learning Center</p><h1>Investing fundamentals.</h1><p className="muted">A concise curriculum for understanding portfolio construction and investment research.</p></div>
      <div className="actions"><Link className="btn btnPrimary" href="/learn/basics">Resume Basics</Link><Link className="btn btnSecondary" href="/learn/glossary">Beginner Glossary</Link></div>
    </div>
    <p className="educationalNotice">PortfolioPath teaches concepts and research skills through simplified examples. It does not provide individualized investment recommendations.</p>
    <section className="editorialGrid" style={{marginTop:24}}>
      <div className="editorialCard large"><div className="editorialMeta">Start here</div><h2>Learn the Basics</h2><p className="muted">Stocks, ETFs, portfolios, risk, diversification, investment goals, and research — all in one short guided lesson.</p><div className="actions"><Link className="btn btnPrimary" href="/learn/basics">Open guided lesson</Link></div></div>
      <div style={{display:"grid",gap:16}}>
        <div className="editorialCard"><div className="editorialMeta">Core concept</div><h2>Diversification</h2><p className="muted">Learn why owning more investments does not always mean more diversification.</p></div>
        <div className="editorialCard"><div className="editorialMeta">Research skill</div><h2>How to compare funds</h2><p className="muted">Compare holdings, fees, methodology, concentration, and overlap.</p></div>
      </div>
    </section>
    <section style={{marginTop:32}}>
      <div className="pageHeader"><div><p className="sectionEyebrow">Reference library</p><h2>Explore concepts</h2></div></div>
      <div className="grid">{topics.map(([title,text])=><div className="card" key={title}><h2>{title}</h2><p className="muted">{text}</p></div>)}</div>
    </section>
  </>;
}
