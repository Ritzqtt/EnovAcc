const CURRENT_MONTH = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

// ₱1,000.00 for positives, − ₱1,000.00 for negatives.
function money(value) {
  const n = Number(value || 0);
  return n < 0 ? `− ${peso.format(Math.abs(n))}` : peso.format(n);
}

function Card({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[#dce5ea] bg-white ${className}`}>{children}</div>
  );
}

function StatCard({ label, value, caption }) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <p className="text-xs leading-[18px] text-[#637a8a]">{label}</p>
      <p className="text-[clamp(1.75rem,2.5vw,2.25rem)] font-bold leading-[44px] text-[#021820]">
        {value}
      </p>
      <p className="text-xs leading-[18px] text-[#637a8a]">{caption}</p>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-sm leading-6 text-[#021820]">
      <span>{label}</span>
      <span className="whitespace-nowrap tabular-nums">{value}</span>
    </div>
  );
}

function Highlight({ label, amount }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-[#e9f4f9] px-3 py-4 text-sm font-bold text-[#021820]">
      <span>{label}</span>
      <span className="whitespace-nowrap tabular-nums">{money(amount)}</span>
    </div>
  );
}

function ComputationCard({ title, children }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold leading-7 text-[#021820]">{title}</h2>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

/**
 * outputVat, inputVat, withholdingPayable: posted balances in pesos.
 * vatRate, withholdingRate: illustrative default rates, as percentages.
 */
export default function TaxSummaries({
  outputVat = 0,
  inputVat = 0,
  withholdingPayable = 0,
  vatRate = 12,
  withholdingRate = 2,
  month = CURRENT_MONTH,
  loading = false,
  error = null,
}) {
  const netVat = Number(outputVat || 0) - Number(inputVat || 0);

  return (
    <main className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold leading-4 text-[#0693c7]">
          FINANCE WORKSPACE / {month.toUpperCase()}
        </p>
        <h1 className="text-[32px] font-bold leading-10 text-[#021820]">
          Tax visibility, without the guesswork.
        </h1>
        <p className="text-xs leading-[18px] text-[#637a8a]">
          Review illustrative VAT and withholding summaries for internal monitoring.
        </p>
      </div>

      {loading && (
        <Card className="px-5 py-14 text-center text-sm text-[#637a8a]">
          Loading tax summaries…
        </Card>
      )}

      {!loading && error && (
        <Card className="px-5 py-14 text-center text-sm text-[#b0243f]">
          Couldn’t load tax summaries: {error}. Refresh the page to try again.
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              label="Output VAT"
              value={money(outputVat)}
              caption="Posted VAT payable balance"
            />
            <StatCard
              label="Input VAT"
              value={money(inputVat)}
              caption="Posted creditable input balance"
            />
            <StatCard
              label="Withholding payable"
              value={money(withholdingPayable)}
              caption="Posted withholding balance"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ComputationCard title="VAT computation">
              <Row label="Illustrative default rate" value={`${vatRate}%`} />
              <Row label="Taxable base × rate" value="VAT amount" />
              <Highlight label="Output less input VAT" amount={netVat} />
            </ComputationCard>

            <ComputationCard title="Withholding computation">
              <Row label="Illustrative default rate" value={`${withholdingRate}%`} />
              <Row label="Payment base × rate" value="Amount withheld" />
              <Highlight label="Withholding payable" amount={withholdingPayable} />
            </ComputationCard>
          </div>
        </>
      )}
    </main>
  );
}