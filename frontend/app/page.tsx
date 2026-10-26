import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="panel heroPanel">
        <p className="sectionEyebrow">Investing, explained step by step</p>
        <h1>Learn how a diversified portfolio is built.</h1>
        <p>PortfolioPath guides new investors through plain-English concepts, an investor-profile exercise, an educational model allocation, and example investments—without placing real trades or requiring an account.</p>
        <div className="actions">
          <Link className="btn btnPrimary" href="/demo">Start Building — No Account Needed</Link>
          <Link className="btn btnSecondary" href="/learn">Learn the Basics First</Link>
        </div>
        <p className="helpText" style={{marginTop:14}}>The public demo saves progress in this browser only. Clearing browser storage removes the saved demo.</p>
      </section>
      <section className="grid" style={{marginTop:16}}>
        <div className="card"><strong>1. Learn the language</strong><p className="muted">Understand ETFs, diversification, and risk.</p></div>
        <div className="card"><strong>2. Build with guidance</strong><p className="muted">Explore an educational allocation based on your answers.</p></div>
        <div className="card"><strong>3. Explore investments</strong><p className="muted">Compare example stocks and ETFs in a practice portfolio.</p></div>
      </section>
      <section className="panel" style={{marginTop:16}}>
        <p className="educationalNotice"><strong>Education and simulation only.</strong> PortfolioPath does not execute trades or provide individualized instructions to buy, sell, or hold securities.</p>
        <div className="actions"><Link className="btn btnSecondary" href="/disclosures">Read Investment Education Disclosures</Link></div>
      </section>
    </>
  );
}
