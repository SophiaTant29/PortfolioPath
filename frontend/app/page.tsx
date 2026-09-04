import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="panel heroPanel">
        <p className="sectionEyebrow">Investing, explained step by step</p>
        <h1>Learn how a diversified portfolio is built.</h1>
        <p>PortfolioPath guides new investors through plain-English investing concepts, an investor-profile exercise, an educational model allocation, research examples, and a final portfolio review—without placing real trades.</p>
        <div className="actions">
          <Link className="btn btnPrimary" href="/login?mode=signup">Create Free Learning Account</Link>
          <Link className="btn btnSecondary" href="/learn">Learn the Basics First</Link>
          <Link className="btn btnSecondary" href="/login">Sign In</Link>
        </div>
        <p className="helpText" style={{marginTop:14}}>New to terms such as ETF, diversification, volatility, or dividends? Open the Learning Center before starting the questionnaire.</p>
      </section>
      <section className="grid" style={{marginTop:16}}>
        <div className="card"><strong>1. Learn the language</strong><p className="muted">Use plain-English definitions before and during the portfolio-building exercise.</p></div>
        <div className="card"><strong>2. Build with guidance</strong><p className="muted">Explore educational model allocations and research examples without being told what to buy.</p></div>
        <div className="card"><strong>3. Understand the structure</strong><p className="muted">Study diversification, concentration, ETF overlap, and risk characteristics.</p></div>
      </section>
      <section className="panel" style={{marginTop:16}}>
        <p className="educationalNotice"><strong>Education and simulation only.</strong> PortfolioPath does not execute trades or provide individualized instructions to buy, sell, hold, add to, reduce, or replace securities. Model outputs and research rankings are learning tools, not return predictions.</p>
        <div className="actions"><Link className="btn btnSecondary" href="/disclosures">Read Investment Education Disclosures</Link></div>
      </section>
    </>
  );
}
