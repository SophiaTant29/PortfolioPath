import { glossary } from "@/lib/glossary";

export default function GlossaryPage(){
  return (
    <section className="panel">
      <p className="muted">Beginner Learning Center</p>
      <h1>Investing terms, explained simply</h1>
      <p>PortfolioPath uses these definitions throughout the app so you can learn the language while you build.</p>
      <div style={{display:"grid",gap:12,marginTop:16}}>
        {Object.entries(glossary).map(([term,definition])=><div className="card" key={term}>
          <h3>{term}</h3>
          <p>{definition}</p>
        </div>)}
      </div>
    </section>
  );
}
