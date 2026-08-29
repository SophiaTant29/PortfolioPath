import Link from "next/link";

export default function CategoryCompletionReview({
  category,target,selected,holdings,nextCategory,onContinue,portfolioId,checkpointCount
}:{
  category:string;
  target:number;
  selected:number;
  holdings:{ticker:string;amount:number}[];
  nextCategory?:string;
  onContinue?:()=>void;
  portfolioId:string;
  checkpointCount:number;
}) {
  const diff=selected-target;
  const pctDiff=target?Math.abs(diff)/target:0;
  const status=pctDiff<=.05?"On target":pctDiff<=.10?"Close to target":"Review allocation";
  return (
    <section className="panel" style={{marginTop:16}}>
      <p className="muted">Category completion review</p>
      <h2>{category}</h2>
      <div className="grid">
        <div className="card"><span className="muted">Target</span><div className="kpi">${target.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
        <div className="card"><span className="muted">Selected</span><div className="kpi">${selected.toLocaleString(undefined,{maximumFractionDigits:0})}</div></div>
        <div className="card"><span className="muted">Status</span><div className="kpi" style={{fontSize:20}}>{status}</div></div>
        <div className="card"><span className="muted">Category status</span><div className="kpi" style={{fontSize:20}}>{holdings.length ? "Ready" : "Choose holdings"}</div></div>
      </div>

      <h3>Your choices</h3>
      {holdings.length
        ? <ul>{holdings.map(h=><li key={h.ticker}><strong>{h.ticker}</strong> — ${h.amount.toLocaleString(undefined,{maximumFractionDigits:0})}</li>)}</ul>
        : <p className="muted">No investments selected in this category.</p>}

      <p className="helpText">
        Before continuing, confirm that your selected amount is close to the model target and that you are comfortable with the holdings you chose.
      </p>

      <div className="actions">
        <Link className="btn btnSecondary" href={`/portfolios/${portfolioId}/build`}>Keep researching</Link>
        {nextCategory && onContinue && <button className="btn btnPrimary" onClick={onContinue} disabled={!holdings.length}>
          Continue to {nextCategory}
        </button>}
      </div>
    </section>
  );
}
