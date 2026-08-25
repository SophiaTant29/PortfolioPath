export type Tx = {
  id?: string;
  symbol: string;
  name?: string | null;
  category?: string | null;
  transaction_type: "BUY" | "SELL" | "DIVIDEND";
  trade_date: string;
  shares: number;
  price: number;
  fees?: number;
};

export function positionFromTransactions(transactions:Tx[], symbol:string) {
  const txs = transactions
    .filter(t=>t.symbol===symbol)
    .slice()
    .sort((a,b)=>a.trade_date.localeCompare(b.trade_date));

  let shares=0;
  let costBasis=0;

  for(const tx of txs){
    const qty=Number(tx.shares||0);
    const px=Number(tx.price||0);
    const fees=Number(tx.fees||0);

    if(tx.transaction_type==="BUY"){
      shares += qty;
      costBasis += qty*px + fees;
    } else if(tx.transaction_type==="SELL"){
      const avg=shares>0 ? costBasis/shares : 0;
      shares -= qty;
      costBasis -= avg*qty;
    }
  }

  shares=Math.max(0,shares);
  costBasis=Math.max(0,costBasis);

  return {
    shares,
    costBasis,
    avgCost: shares>0 ? costBasis/shares : 0
  };
}

export function cashRemaining(startingCash:number, transactions:Tx[]) {
  let cash=Number(startingCash||0);

  for(const tx of transactions){
    const value=Number(tx.shares||0)*Number(tx.price||0);
    const fees=Number(tx.fees||0);

    if(tx.transaction_type==="BUY") cash -= value + fees;
    else if(tx.transaction_type==="SELL") cash += value - fees;
    else if(tx.transaction_type==="DIVIDEND") cash += value;
  }

  return cash;
}
