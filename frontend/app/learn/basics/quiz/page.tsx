import { Suspense } from "react";
import BasicsQuiz from "@/components/BasicsQuiz";

export default function KnowledgeCheckPage(){
  return <Suspense fallback={<section className="panel"><p>Loading knowledge check…</p></section>}><BasicsQuiz /></Suspense>;
}
