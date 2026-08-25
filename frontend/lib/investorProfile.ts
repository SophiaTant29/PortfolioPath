export type Goal = "growth" | "moderate" | "income" | "preserve" | "unsure";
export type Horizon = "lt2" | "2to5" | "5to10" | "gt10" | "none";
export type DropReaction = "sellall" | "sellpart" | "hold" | "buy" | "unsure";
export type Volatility = "verylow" | "some" | "moderatehigh" | "high" | "unsure";
export type Concern = "loss" | "miss" | "same" | "unsure";
export type Emergency = "gt6" | "3to6" | "lt3" | "none" | "unsure";
export type IncomeStability = "very" | "mostly" | "variable" | "uncertain" | "none";
export type Liquidity = "unlikely" | "possible" | "likely" | "verylikely" | "unsure";
export type Debt = "none" | "small" | "significant" | "unsure";
export type Appeal = "growth" | "large" | "dividend" | "mix" | "unsure";
export type Approach = "stocks" | "mix" | "funds" | "unsure";
export type Sector =
  | "Technology" | "Healthcare" | "Financials" | "Consumer"
  | "Energy" | "Industrials" | "Real Estate" | "Open" | "Unsure";
export type Speculative = "none" | "slight" | "moderate" | "very" | "unsure";
export type DividendImportance = "none" | "slight" | "moderate" | "very" | "unsure";

export type QuestionnaireAnswers = {
  amount: number;
  goal: Goal;
  horizon: Horizon;
  dropReaction: DropReaction;
  volatility: Volatility;
  concern: Concern;
  emergency: Emergency;
  incomeStability: IncomeStability;
  liquidity: Liquidity;
  debt: Debt;
  appeal: Appeal;
  approach: Approach;
  sector: Sector;
  speculative: Speculative;
  dividendImportance: DividendImportance;
};

export type InvestorProfileName =
  | "Protect"
  | "Cautious"
  | "Balanced"
  | "Growth"
  | "Aggressive Growth";

export type AllocationItem = {
  name: string;
  pct: number;
  dollars: number;
};

export type InvestorProfileResult = {
  riskTolerance: number;
  riskCapacity: number;
  overallRisk: number;
  profileName: InvestorProfileName;
  growthScore: number;
  incomeScore: number;
  preservationScore: number;
  stockPreference: number;
  speculativeScore: number;
  dividendScore: number;
  sectorPreference: Sector;
  debtNotice: "none" | "minor" | "strong" | "explain";
  allocation: AllocationItem[];
};

const val = <T extends string>(map: Record<T, number>, key: T) => map[key];

const round1 = (x:number) => Math.round(x * 10) / 10;

function profileFromRisk(risk:number): InvestorProfileName {
  if (risk <= 25) return "Protect";
  if (risk <= 45) return "Cautious";
  if (risk <= 65) return "Balanced";
  if (risk <= 82) return "Growth";
  return "Aggressive Growth";
}

function baseAssets(profile:InvestorProfileName) {
  const map:Record<InvestorProfileName,{stock:number;bond:number;cash:number}> = {
    "Protect": {stock:30,bond:45,cash:25},
    "Cautious": {stock:52,bond:32,cash:16},
    "Balanced": {stock:70,bond:20,cash:10},
    "Growth": {stock:88,bond:8,cash:4},
    "Aggressive Growth": {stock:95,bond:3,cash:2},
  };
  return {...map[profile]};
}

const sectorFractions:Record<string,number> = {
  "Broad U.S. Market": .34,
  "Technology": .13,
  "Healthcare": .10,
  "Financials": .075,
  "Consumer": .075,
  "Industrials": .065,
  "Energy": .035,
  "Real Estate": .025,
  "International": .18,
  "Small-Cap / Higher Risk": .065,
};

const guidedCaps:Record<string,number> = {
  Technology:25,
  Healthcare:20,
  Financials:15,
  Consumer:15,
  Industrials:15,
  Energy:10,
  "Real Estate":10,
};

const speculativeCaps:Record<InvestorProfileName,number> = {
  "Protect":2,
  "Cautious":3,
  "Balanced":5,
  "Growth":8,
  "Aggressive Growth":10,
};

function normalize(items:Record<string,number>, target:number) {
  const sum = Object.values(items).reduce((a,b)=>a+b,0);
  if (!sum) return items;
  const out:Record<string,number> = {};
  for (const [k,v] of Object.entries(items)) out[k] = v / sum * target;
  return out;
}

export function calculateInvestorProfile(a:QuestionnaireAnswers):InvestorProfileResult {
  const q4 = val({
    sellall:10, sellpart:30, hold:65, buy:100, unsure:50
  }, a.dropReaction);
  const q5 = val({
    verylow:10, some:40, moderatehigh:75, high:100, unsure:50
  }, a.volatility);
  const q6 = val({
    loss:20, miss:90, same:55, unsure:50
  }, a.concern);

  const riskTolerance = q4*.45 + q5*.35 + q6*.20;

  const q3 = val({
    lt2:10, "2to5":35, "5to10":70, gt10:100, none:80
  }, a.horizon);
  const q7 = val({
    gt6:100, "3to6":75, lt3:40, none:10, unsure:35
  }, a.emergency);
  const q8 = val({
    very:100, mostly:75, variable:45, uncertain:20, none:15
  }, a.incomeStability);
  const q9 = val({
    unlikely:100, possible:65, likely:30, verylikely:10, unsure:45
  }, a.liquidity);

  const riskCapacity = q3*.45 + q7*.20 + q9*.20 + q8*.15;
  const low = Math.min(riskTolerance, riskCapacity);
  const high = Math.max(riskTolerance, riskCapacity);
  let overallRisk = low*.60 + high*.40;
  overallRisk = Math.min(overallRisk, riskCapacity + 15);
  overallRisk = Math.max(0, Math.min(100, overallRisk));

  const profileName = profileFromRisk(overallRisk);

  const goalScores = {
    growth:{growth:100,income:10,preservation:20},
    moderate:{growth:70,income:30,preservation:60},
    income:{growth:45,income:100,preservation:65},
    preserve:{growth:15,income:45,preservation:100},
    unsure:{growth:55,income:40,preservation:55},
  }[a.goal];

  const appeal = {
    growth:{growth:20,income:0,preservation:0},
    large:{growth:5,income:5,preservation:15},
    dividend:{growth:0,income:25,preservation:10},
    mix:{growth:0,income:0,preservation:0},
    unsure:{growth:0,income:0,preservation:0},
  }[a.appeal];

  const growthScore = Math.min(100, goalScores.growth + appeal.growth);
  const incomeScore = Math.min(100, goalScores.income + appeal.income);
  const preservationScore = Math.min(100, goalScores.preservation + appeal.preservation);

  const stockPreference = {
    stocks:100, mix:60, funds:20, unsure:40
  }[a.approach];

  const speculativeScore = {
    none:0, slight:25, moderate:55, very:100, unsure:30
  }[a.speculative];

  const dividendScore = {
    none:10, slight:35, moderate:65, very:100, unsure:40
  }[a.dividendImportance];

  const debtNotice = {
    none:"none", small:"minor", significant:"strong", unsure:"explain"
  }[a.debt] as InvestorProfileResult["debtNotice"];

  const assets = baseAssets(profileName);

  if (a.goal === "preserve") {
    assets.stock -= 5; assets.bond += 3; assets.cash += 2;
  } else if (a.goal === "growth" && overallRisk >= 60) {
    assets.stock += 2;
    if (assets.cash >= 2) assets.cash -= 1;
    if (assets.bond >= 1) assets.bond -= 1;
  } else if (a.goal === "income") {
    assets.stock -= 3; assets.bond += 3;
  }

  let sectors:Record<string,number> = {};
  for (const [name,f] of Object.entries(sectorFractions)) sectors[name] = assets.stock * f;

  // Cap small-cap by profile and move the excess into broad market.
  const scCap = speculativeCaps[profileName];
  const desiredSmallCap = Math.min(sectors["Small-Cap / Higher Risk"], scCap * (speculativeScore/100 || 0.25));
  const smallCapDiff = sectors["Small-Cap / Higher Risk"] - desiredSmallCap;
  sectors["Small-Cap / Higher Risk"] = Math.max(0, desiredSmallCap);
  sectors["Broad U.S. Market"] += Math.max(0, smallCapDiff);

  // Small, controlled sector preference tilt.
  if (a.sector !== "Open" && a.sector !== "Unsure" && sectors[a.sector] != null) {
    const tilt = Math.min(5, assets.stock * .05);
    const current = sectors[a.sector];
    const cap = guidedCaps[a.sector] ?? 100;
    const add = Math.max(0, Math.min(tilt, cap-current));
    const others = Object.keys(sectors).filter(k=>k!==a.sector);
    const otherTotal = others.reduce((s,k)=>s+sectors[k],0);
    if (add>0 && otherTotal>0) {
      for (const k of others) sectors[k] -= add * (sectors[k]/otherTotal);
      sectors[a.sector] += add;
    }
  }

  sectors = normalize(sectors, assets.stock);

  const allocation:AllocationItem[] = [
    ...Object.entries(sectors).map(([name,pct])=>({name,pct,dollars:a.amount*pct/100})),
    {name:"Bonds",pct:assets.bond,dollars:a.amount*assets.bond/100},
    {name:"Short-Term",pct:assets.cash,dollars:a.amount*assets.cash/100},
  ].map(x=>({...x,pct:round1(x.pct),dollars:Math.round(x.dollars*100)/100}))
   .sort((x,y)=>y.pct-x.pct);

  return {
    riskTolerance:round1(riskTolerance),
    riskCapacity:round1(riskCapacity),
    overallRisk:round1(overallRisk),
    profileName,
    growthScore,
    incomeScore,
    preservationScore,
    stockPreference,
    speculativeScore,
    dividendScore,
    sectorPreference:a.sector,
    debtNotice,
    allocation,
  };
}

export const profileDescriptions:Record<InvestorProfileName,string> = {
  "Protect":"Your priority is limiting large changes in portfolio value while keeping some long-term growth potential.",
  "Cautious":"You can accept some market movement for growth, but stability remains important.",
  "Balanced":"Your portfolio balances long-term growth with investments intended to reduce overall risk.",
  "Growth":"You are comfortable with meaningful market fluctuations and are focused primarily on building wealth over time.",
  "Aggressive Growth":"You are comfortable with significant fluctuations and prioritize long-term growth over short-term stability.",
};
