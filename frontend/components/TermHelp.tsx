"use client";
import { useState } from "react";
import { glossary } from "@/lib/glossary";

export default function TermHelp({term}:{term:string}) {
  const [open,setOpen]=useState(false);
  const text=glossary[term];
  if(!text)return <>{term}</>;
  return (
    <span className="termHelp">
      <button type="button" className="termHelpButton" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
        {term} <span aria-hidden="true">?</span>
      </button>
      {open && <span className="termHelpPopover" role="note">{text}</span>}
    </span>
  );
}
