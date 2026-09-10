import { Suspense } from "react";
import InvestingBasicsLesson from "@/components/InvestingBasicsLesson";

export default function InvestingBasicsPage(){
  return <Suspense fallback={<section className="panel"><p>Loading lesson…</p></section>}><InvestingBasicsLesson /></Suspense>;
}
