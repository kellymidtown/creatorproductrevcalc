import React, { useMemo, useState } from "react";

const NumberInput = ({ label, suffix, value, onChange, note, step=1, min=0 }) => (
  <label className="block">
    <span className="text-xs font-semibold text-gray-600">{label}</span>
    <div className="mt-1 flex items-center gap-1">
      <input
        type="number"
        className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        step={step}
        min={min}
        onChange={(e)=> onChange(Number(e.target.value))}
      />
      <span className="suffix">{suffix || ""}</span>
    </div>
    {note && <p className="mt-1 text-[11px] text-gray-500">{note}</p>}
  </label>
);

// Audience tiers (buttons set only audience size)
const tiers = [
  { name: "Micro", size: 10000 },
  { name: "Mid-tier", size: 100000 },
  { name: "Macro", size: 500000 },
  { name: "Mega", size: 1000000 },
];

// Defaults (Mid-tier)
const initial = {
  audienceSize: 100000,   // Mid-tier default
  reachRate: 10,
  platformCTR: 4,
  emailSubscribers: 2500,
  emailCTR: 5,
  platformCVR: 2.5,
  emailCVR: 1.0,
  fePrice: 37,
  bumpPrice: 22,
  bumpTakeRate: 30,
  upsellPrice: 68,
  upsellTakeRate: 20,
  refundRate: 2,
  launchesPerYear: 4
};

function fmtCurrency(n){
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function fmtPct(n){
  if (!isFinite(n)) return "—";
  return `${(n).toFixed(1)}%`;
}

export default function App(){
  const [inputs, setInputs] = useState({...initial});
  const [selectedTier, setSelectedTier] = useState("Mid-tier");
  const [whatIf, setWhatIf] = useState({
    emailBuyersUp10: false,
    platformBuyersUp10: false,
    bumpTakeRateUp10: false,
    upsellTakeRateUp10: false,
  });

  const update = (k, v) => setInputs(s => ({...s, [k]: v}));

  const {
    audienceSize, reachRate, platformCTR,
    emailSubscribers, emailCTR,
    platformCVR, emailCVR,
    fePrice,
    bumpPrice, bumpTakeRate,
    upsellPrice, upsellTakeRate,
    refundRate, launchesPerYear
  } = inputs;

  const calc = useMemo(()=>{
    // Reach
    const platformReach = audienceSize * (reachRate/100);
    const emailReach = emailSubscribers * (emailCTR/100); // clicks from email

    // Buyers (floating before rounding/toggles)
    let platformBuyerFloat = platformReach * (platformCTR/100) * (platformCVR/100);
    let emailBuyerFloat = emailReach * (emailCVR/100);

    // Apply what-if multipliers to buyer floats (before rounding)
    if (whatIf.platformBuyersUp10) platformBuyerFloat *= 1.1;
    if (whatIf.emailBuyersUp10) emailBuyerFloat *= 1.1;

    // Round buyers to whole people
    const platformBuyers = Math.round(platformBuyerFloat);
    const emailBuyers = Math.round(emailBuyerFloat);
    const totalBuyers = platformBuyers + emailBuyers;

    // Take-rate adjustments (optionally increased by 10% via what-if)
    const adjBumpTake = whatIf.bumpTakeRateUp10 ? bumpTakeRate * 1.1 : bumpTakeRate;
    const adjUpsellTake = whatIf.upsellTakeRateUp10 ? upsellTakeRate * 1.1 : upsellTakeRate;

    // Attach bump/upsell to ALL buyers
    const bumpBuyers = Math.round(totalBuyers * (adjBumpTake/100));
    const upsellBuyers = Math.round(totalBuyers * (adjUpsellTake/100));

    // Revenues
    const feRevenue = totalBuyers * fePrice;
    const bumpRevenue = bumpBuyers * bumpPrice;
    const upsellRevenue = upsellBuyers * upsellPrice;

    const grossSubtotal = feRevenue + bumpRevenue + upsellRevenue;
    const refunds = grossSubtotal * (refundRate/100);
    const grossAfterRefunds = grossSubtotal - refunds;

    const annualGross = grossAfterRefunds * launchesPerYear;

    // Percentages
    const platformBuyerPctOfReach = platformReach > 0 ? (platformBuyers / platformReach) * 100 : NaN;
    const emailBuyerPctOfReach = emailReach > 0 ? (emailBuyers / emailReach) * 100 : NaN;
    const totalReach = platformReach + emailReach;
    const totalBuyerPctOfReach = totalReach > 0 ? (totalBuyers / totalReach) * 100 : NaN;

    return {
      platformReach, emailReach, totalReach,
      platformBuyers, emailBuyers, totalBuyers,
      platformBuyerPctOfReach, emailBuyerPctOfReach, totalBuyerPctOfReach,
      feRevenue, bumpRevenue, upsellRevenue,
      grossSubtotal, refunds, grossAfterRefunds,
      annualGross,
      bumpBuyers, upsellBuyers,
    };
  }, [inputs, whatIf]);

  const TierButton = ({ name, size }) => (
    <button
      onClick={() => {
        setSelectedTier(name);
        setInputs(s => ({ ...s, audienceSize: size }));
      }}
      className={`rounded-2xl px-3 py-2 text-sm font-medium border ${
        selectedTier === name
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-800 border-gray-200 hover:border-indigo-200'
      }`}
    >
      {name}
    </button>
  );

  const Stat = ({ label, value, sub }) => (
    <div className="rounded-2xl bg-white ring-1 ring-gray-100 p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-gray-500">{sub}</div>}
    </div>
  );

  return (
    <div className="w-full pt-6 pb-2 px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Creator Digital Product Revenue Calculator</h1>
            <p className="text-gray-600 mt-1">Enter your assumptions to project how much your own digital products can increase your revenue.</p>
            <p className="text-[11px] text-gray-500 mt-1">Notes: This is a directional model, not a forecast. Real-world performance varies with audience and list quality, offer-market fit, and promo strategy.</p>
          </div>
          <div className="flex items-center gap-2">
            {tiers.map(t => <TierButton key={t.name} name={t.name} size={t.size} />)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="card bg-white p-5 ring-1 ring-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Inputs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput label="Audience size" value={audienceSize} onChange={(v)=>update('audienceSize', v)} note="Total followers on your main platform(s)." />
              <NumberInput label="Average reach per post" suffix="%" value={reachRate} onChange={(v)=>update('reachRate', v)} note="% of audience who see the promo." step={0.1} />

              <NumberInput label="Platform click‑through rate" suffix="%" value={platformCTR} onChange={(v)=>update('platformCTR', v)} note="% of reached who click to sales page." step={0.1} />
              <NumberInput label="Existing email subscribers" value={emailSubscribers} onChange={(v)=>update('emailSubscribers', v)} />

              <NumberInput label="Email click‑through rate" suffix="%" value={emailCTR} onChange={(v)=>update('emailCTR', v)} note="% of subscribers who click the email." step={0.1} />
              <NumberInput label="Platform conversion rate (buyers)" suffix="%" value={platformCVR} onChange={(v)=>update('platformCVR', v)} note="% of platform CTR who purchase." step={0.1} />

              <NumberInput label="Email conversion rate (buyers)" suffix="%" value={emailCVR} onChange={(v)=>update('emailCVR', v)} note="% of email CTR who purchase." step={0.1} />
              <NumberInput label="Front‑end offer price" value={fePrice} onChange={(v)=>update('fePrice', v)} />

              <NumberInput label="Order bump price" value={bumpPrice} onChange={(v)=>update('bumpPrice', v)} />
              <NumberInput label="Order bump take rate" suffix="%" value={bumpTakeRate} onChange={(v)=>update('bumpTakeRate', v)} note="% of buyers who add the bump." step={0.1} />

              <NumberInput label="Upsell offer price" value={upsellPrice} onChange={(v)=>update('upsellPrice', v)} />
              <NumberInput label="Upsell offer take rate" suffix="%" value={upsellTakeRate} onChange={(v)=>update('upsellTakeRate', v)} note="% of buyers who take the upsell." step={0.1} />

              <NumberInput label="Refund rate" suffix="%" value={refundRate} onChange={(v)=>update('refundRate', v)} note="Applied to FE + bump + upsell combined." step={0.1} />
              <NumberInput label="Launches per year" value={launchesPerYear} onChange={(v)=>update('launchesPerYear', v)} />
            </div>
          </section>

          <section className="card bg-white p-5 ring-1 ring-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Stat label="Platform buyers" value={calc.platformBuyers.toLocaleString()} sub={ isFinite(calc.platformBuyerPctOfReach) ? fmtPct(calc.platformBuyerPctOfReach) + " of platform reach" : "—" }/>
              <Stat label="Email buyers" value={calc.emailBuyers.toLocaleString()} sub={ isFinite(calc.emailBuyerPctOfReach) ? fmtPct(calc.emailBuyerPctOfReach) + " of email reach" : "—" }/>
              <Stat label="Total buyers" value={calc.totalBuyers.toLocaleString()} sub={ isFinite(calc.totalBuyerPctOfReach) ? fmtPct(calc.totalBuyerPctOfReach) + " of total reach" : "—" }/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Per Launch</div>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between"><span>Front‑end offer sales</span><span>{fmtCurrency(calc.feRevenue)}</span></li>
                  <li className="flex justify-between"><span>Order bump sales</span><span>{fmtCurrency(calc.bumpRevenue)}</span></li>
                  <li className="flex justify-between"><span>Upsell offer sales</span><span>{fmtCurrency(calc.upsellRevenue)}</span></li>
                  <li className="flex justify-between border-t pt-1"><span>Gross sales subtotal</span><span>{fmtCurrency(calc.grossSubtotal)}</span></li>
                  <li className="flex justify-between"><span>Refunds</span><span>-{fmtCurrency(calc.refunds)}</span></li>
                  <li className="flex justify-between text-lg font-semibold border-t pt-2"><span>Gross sales (after refunds)</span><span>{fmtCurrency(calc.grossAfterRefunds)}</span></li>
                </ul>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Annualized</div>
                <ul className="space-y-1 text-sm">
                  <li className="flex justify-between"><span>Launches per year</span><span>{launchesPerYear}</span></li>
                  <li className="flex justify-between text-lg font-semibold border-t pt-2"><span>Estimated annual gross</span><span>{fmtCurrency(calc.annualGross)}</span></li>
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700 mb-2">What‑if toggles</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <button onClick={()=>setWhatIf(s=>({...s, emailBuyersUp10: !s.emailBuyersUp10}))} className={`rounded-2xl px-3 py-2 border text-sm ${ whatIf.emailBuyersUp10 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200' }`}>Increase email buyers by 10%</button>
                <button onClick={()=>setWhatIf(s=>({...s, platformBuyersUp10: !s.platformBuyersUp10}))} className={`rounded-2xl px-3 py-2 border text-sm ${ whatIf.platformBuyersUp10 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200' }`}>Increase platform buyers by 10%</button>
                <button onClick={()=>setWhatIf(s=>({...s, bumpTakeRateUp10: !s.bumpTakeRateUp10}))} className={`rounded-2xl px-3 py-2 border text-sm ${ whatIf.bumpTakeRateUp10 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200' }`}>Increase order bump take rate by 10%</button>
                <button onClick={()=>setWhatIf(s=>({...s, upsellTakeRateUp10: !s.upsellTakeRateUp10}))} className={`rounded-2xl px-3 py-2 border text-sm ${ whatIf.upsellTakeRateUp10 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200' }`}>Increase upsell offer take rate by 10%</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
