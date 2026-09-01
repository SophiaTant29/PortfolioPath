"use client";
import { useEffect,useState } from "react";

export default function ProfilePreferences(){
  const [mode,setMode]=useState("Guided");
  const [knowledge,setKnowledge]=useState("New to investing");
  const [saved,setSaved]=useState(false);
  useEffect(()=>{
    setMode(localStorage.getItem("pp_mode")||"Guided");
    setKnowledge(localStorage.getItem("pp_knowledge")||"New to investing");
  },[]);
  function save(){
    localStorage.setItem("pp_mode",mode);
    localStorage.setItem("pp_knowledge",knowledge);
    setSaved(true); setTimeout(()=>setSaved(false),1800);
  }
  return <div className="card">
    <h2>Learning preferences</h2>
    <label className="field">Experience level
      <select value={knowledge} onChange={e=>setKnowledge(e.target.value)}>
        <option>New to investing</option><option>Some investing experience</option><option>Comfortable with investing concepts</option>
      </select>
    </label>
    <label className="field">Interface mode
      <select value={mode} onChange={e=>setMode(e.target.value)}>
        <option>Guided</option><option>Advanced</option>
      </select>
    </label>
    <p className="helpText">Guided mode emphasizes plain-English explanations. Advanced mode is reserved for deeper metrics as those tools are added.</p>
    <button className="btn btnSecondary" onClick={save}>Save Preferences</button>
    {saved&&<p className="statusBadge statusGood" style={{marginLeft:10}}>Saved</p>}
  </div>;
}
