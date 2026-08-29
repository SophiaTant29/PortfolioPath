"use client";
import { useState } from "react";

const questions=[
  "Did you understand why each investment was shown to you?",
  "Did the research resources tell you what to look for?",
  "Did you feel like PortfolioPath was teaching you how to decide rather than telling you what to buy?",
  "At any point did you feel overwhelmed?",
  "Did the comparison screen make the tradeoffs understandable?",
  "Did you understand why each allocation category had its weight?"
];

export default function AlphaFeedback(){
  const [answers,setAnswers]=useState<Record<number,string>>({});
  return (
    <section className="panel">
      <p className="muted">Alpha usability test</p>
      <h1>Beginner feedback</h1>
      <p>Use this after someone completes the guided builder with minimal instruction.</p>
      {questions.map((q,i)=><div className="card" key={q} style={{marginTop:12}}>
        <strong>{q}</strong>
        <textarea style={{marginTop:10,width:"100%",minHeight:90}} value={answers[i]??""} onChange={e=>setAnswers({...answers,[i]:e.target.value})}/>
      </div>)}
      <div className="card" style={{marginTop:12}}>
        <strong>Where did you hesitate, get confused, or want more explanation?</strong>
        <textarea style={{marginTop:10,width:"100%",minHeight:120}}/>
      </div>
      <p className="helpText">For now this page is a testing worksheet. Persisting structured tester feedback can be added after the first usability sessions.</p>
    </section>
  );
}
