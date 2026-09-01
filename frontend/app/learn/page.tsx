import Link from "next/link";

export default function LearnPage(){
  return <>
    <section className="panel">
      <p className="sectionEyebrow">Learning Center</p>
      <h1>Learn the ideas behind your portfolio</h1>
      <p>Start with the concepts that matter most when you are new to investing. PortfolioPath uses these ideas throughout the builder and review pages.</p>
    </section>
    <section className="grid" style={{marginTop:16}}>
      <div className="card"><h2>Asset allocation</h2><p className="muted">Why portfolios split money across different categories instead of relying on one investment.</p></div>
      <div className="card"><h2>Diversification</h2><p className="muted">How owning different companies, sectors, regions, and asset types can reduce concentration.</p></div>
      <div className="card"><h2>Stocks vs. ETFs</h2><p className="muted">Learn the difference between owning one company and owning a fund that may hold many investments.</p></div>
      <div className="card"><h2>Risk and volatility</h2><p className="muted">Understand why investment values move and why time horizon and financial flexibility matter.</p></div>
      <div className="card"><h2>Research basics</h2><p className="muted">Learn what to look for in company filings, fund pages, financial statements, and portfolio holdings.</p></div>
      <div className="card"><h2>ETF overlap</h2><p className="muted">See why two different fund names can still own many of the same underlying companies.</p></div>
    </section>
    <section className="panel" style={{marginTop:16}}>
      <h2>Need a definition?</h2>
      <p>Use the beginner glossary for common investing terms used throughout PortfolioPath.</p>
      <Link className="btn btnPrimary" href="/learn/glossary">Open Glossary</Link>
    </section>
  </>;
}
