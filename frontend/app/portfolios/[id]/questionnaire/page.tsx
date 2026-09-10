"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  calculateInvestorProfile,
  QuestionnaireAnswers
} from "@/lib/investorProfile";

const initial:QuestionnaireAnswers = {
  amount:0,
  goal:"moderate",
  horizon:"5to10",
  dropReaction:"hold",
  volatility:"some",
  concern:"same",
  emergency:"3to6",
  incomeStability:"mostly",
  liquidity:"unlikely",
  debt:"none",
  appeal:"mix",
  approach:"mix",
  sector:"Open",
  speculative:"slight",
  dividendImportance:"slight",
};

const Field=({n,title,help,children}:{n:number,title:string,help?:string,children:React.ReactNode})=>(
  <div className="card" style={{marginBottom:12}}>
    <strong>{n}. {title}</strong>
    {help&&<p className="muted" style={{margin:"6px 0 10px"}}>{help}</p>}
    {children}
  </div>
);

export default function QuestionnairePage(){
  const params=useParams<{id:string}>();
  const router=useRouter();
  const [a,setA]=useState<QuestionnaireAnswers>(initial);
  const [message,setMessage]=useState("");
  const result=useMemo(()=>calculateInvestorProfile(a),[a]);

  const set=<K extends keyof QuestionnaireAnswers>(k:K,v:QuestionnaireAnswers[K])=>
    setA(prev=>({...prev,[k]:v}));

  async function submit(e:FormEvent){
    e.preventDefault();
    setMessage("");
    if(a.amount<=0){setMessage("Enter an investment amount greater than $0.");return;}

    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push("/login");return;}

    const payload={
      answers:a,
      ...result,
      completedAt:new Date().toISOString()
    };

    const {error}=await supabase
      .from("portfolios")
      .update({
        risk_profile:payload,
        updated_at:new Date().toISOString()
      })
      .eq("id",params.id)
      .eq("user_id",user.id);

    if(error){setMessage(error.message);return;}
    router.push(`/portfolios/${params.id}/recommendation`);
  }

  return (
    <form onSubmit={submit}>
      <section className="panel" style={{marginBottom:16}}>
        <p className="muted">Investor Profile</p>
        <h1>Build your educational model portfolio</h1>
        <p>These questions help PortfolioPath create an educational model based on risk comfort, time horizon, and financial flexibility.</p>
        <p className="helpText">All 15 questions are required. You can edit your answers later.</p>
        <div className="actions"><a className="btn btnSecondary" href={`/learn/basics?next=${encodeURIComponent(`/portfolios/${params.id}/questionnaire`)}`}>New to investing? Take the 3-minute intro</a><a className="btn btnSecondary" href="/learn" target="_blank" rel="noreferrer">Open Learning Center</a></div>
      </section>

      <Field n={1} title="How much are you planning to invest?">
        <label className="field">Investment amount
          <input type="number" min="0.01" step="any" inputMode="decimal" placeholder="Enter any amount, e.g. 7250" value={a.amount>0?a.amount:""} onChange={e=>set("amount",e.target.value===""?0:Number(e.target.value))}/>
        </label>
      </Field>

      <Field n={2} title="What is your primary investment objective?">
        <select className="field" value={a.goal} onChange={e=>set("goal",e.target.value as QuestionnaireAnswers["goal"])}>
          <option value="growth">Maximize long-term growth</option>
          <option value="moderate">Achieve moderate growth while limiting risk</option>
          <option value="income">Generate income while maintaining growth potential</option>
          <option value="preserve">Preserve my investment and minimize losses</option>
          <option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={3} title="When do you expect to need a significant portion of this money?">
        <select className="field" value={a.horizon} onChange={e=>set("horizon",e.target.value as QuestionnaireAnswers["horizon"])}>
          <option value="lt2">Less than 2 years</option><option value="2to5">2–5 years</option>
          <option value="5to10">5–10 years</option><option value="gt10">More than 10 years</option>
          <option value="none">No specific time frame</option>
        </select>
      </Field>

      <Field n={4} title="Assume you invested $10,000 and your portfolio declined to $8,000 during a market downturn. What would you most likely do?">
        <select className="field" value={a.dropReaction} onChange={e=>set("dropReaction",e.target.value as QuestionnaireAnswers["dropReaction"])}>
          <option value="sellall">Sell most or all</option><option value="sellpart">Sell part</option>
          <option value="hold">Hold and wait</option><option value="buy">Invest more</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={5} title="What level of market volatility are you comfortable with?" help="Volatility means how much an investment may rise or fall in value over time.">
        <select className="field" value={a.volatility} onChange={e=>set("volatility",e.target.value as QuestionnaireAnswers["volatility"])}>
          <option value="verylow">Very little</option><option value="some">Some</option>
          <option value="moderatehigh">Moderate to high</option><option value="high">High</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={6} title="Which outcome would concern you more?">
        <select className="field" value={a.concern} onChange={e=>set("concern",e.target.value as QuestionnaireAnswers["concern"])}>
          <option value="loss">Losing $1,000</option><option value="miss">Missing the opportunity to earn $1,000</option>
          <option value="same">Both about the same</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={7} title="How much emergency savings do you have available outside this investment?">
        <select className="field" value={a.emergency} onChange={e=>set("emergency",e.target.value as QuestionnaireAnswers["emergency"])}>
          <option value="gt6">More than 6 months of expenses</option><option value="3to6">3–6 months</option>
          <option value="lt3">Less than 3 months</option><option value="none">None</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={8} title="How stable is your current income?">
        <select className="field" value={a.incomeStability} onChange={e=>set("incomeStability",e.target.value as QuestionnaireAnswers["incomeStability"])}>
          <option value="very">Very stable</option><option value="mostly">Mostly stable</option><option value="variable">Variable</option>
          <option value="uncertain">Uncertain</option><option value="none">No regular income</option>
        </select>
      </Field>

      <Field n={9} title="How likely are you to need this investment unexpectedly?">
        <select className="field" value={a.liquidity} onChange={e=>set("liquidity",e.target.value as QuestionnaireAnswers["liquidity"])}>
          <option value="unlikely">Very unlikely</option><option value="possible">Possible</option>
          <option value="likely">Likely</option><option value="verylikely">Very likely</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={10} title="Do you currently carry high-interest debt?" help="Examples include credit-card balances or other debt with high interest rates.">
        <select className="field" value={a.debt} onChange={e=>set("debt",e.target.value as QuestionnaireAnswers["debt"])}>
          <option value="none">No</option><option value="small">A small amount</option>
          <option value="significant">A significant amount</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={11} title="Which type of investment is most appealing to you?" help="Dividend-paying stocks or funds distribute part of their earnings or cash flow to shareholders, usually as periodic cash payments. Dividends are not guaranteed, and a dividend-paying investment can still lose value.">
        <select className="field" value={a.appeal} onChange={e=>set("appeal",e.target.value as QuestionnaireAnswers["appeal"])}>
          <option value="growth">Companies with strong growth potential</option><option value="large">Large, established companies</option>
          <option value="dividend">Dividend-paying investments</option><option value="mix">A diversified mix</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={12} title="Which investment approach would you prefer?" help="Diversified funds such as ETFs can hold many companies in one investment.">
        <select className="field" value={a.approach} onChange={e=>set("approach",e.target.value as QuestionnaireAnswers["approach"])}>
          <option value="stocks">Mostly individual companies</option><option value="mix">A combination of stocks and diversified funds</option>
          <option value="funds">Mostly diversified funds</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={13} title="Which area of the market interests you most?">
        <select className="field" value={a.sector} onChange={e=>set("sector",e.target.value as QuestionnaireAnswers["sector"])}>
          <option>Open</option><option>Technology</option><option>Healthcare</option><option>Financials</option>
          <option>Consumer</option><option>Energy</option><option>Industrials</option><option>Real Estate</option><option>Unsure</option>
        </select>
      </Field>

      <Field n={14} title="How interested are you in smaller companies or higher-risk investments with greater growth potential?">
        <select className="field" value={a.speculative} onChange={e=>set("speculative",e.target.value as QuestionnaireAnswers["speculative"])}>
          <option value="none">Not interested</option><option value="slight">Slightly interested</option>
          <option value="moderate">Moderately interested</option><option value="very">Very interested</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      <Field n={15} title="How important are dividends to your investment strategy?" help="A dividend is a cash payment some companies or funds distribute to shareholders. Dividend-producing investments are often associated with income, but payments can be reduced or stopped and a high dividend does not automatically mean an investment is safer or better.">
        <select className="field" value={a.dividendImportance} onChange={e=>set("dividendImportance",e.target.value as QuestionnaireAnswers["dividendImportance"])}>
          <option value="none">Not important</option><option value="slight">Slightly important</option>
          <option value="moderate">Moderately important</option><option value="very">Very important</option><option value="unsure">I am unsure</option>
        </select>
      </Field>

      {result.debtNotice==="strong" && (
        <section className="panel" style={{marginBottom:14,borderColor:"#e6b55b"}}>
          <strong>Before investing the full amount</strong>
          <p>High-interest debt may cost more than an investment can reasonably be expected to earn. Consider reviewing that debt before committing the full investment amount.</p>
        </section>
      )}

      <section className="panel">
        <div className="grid">
          <div><span className="muted">Estimated risk profile</span><div className="kpi">{result.profileName}</div></div>
          <div><span className="muted">Risk tolerance</span><div className="kpi">{result.riskTolerance}/100</div></div>
          <div><span className="muted">Risk capacity</span><div className="kpi">{result.riskCapacity}/100</div></div>
        </div>
        <div className="actions">
          <button className="btn btnPrimary" type="submit">Save & View Model Allocation</button>
        </div>
        {message&&<p>{message}</p>}
      </section>
    </form>
  );
}
