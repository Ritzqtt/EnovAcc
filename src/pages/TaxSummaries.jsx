import ModulePage from "../components/ModulePage";
import MetricCards from "../components/MetricCards";
import PanelGroup from "../components/Panel";

const METRICS = [
  [
    "Output VAT",
    "₱0.00",
    "Posted VAT payable balance"
  ],
  [
    "Input VAT",
    "₱0.00",
    "Posted creditable input balance"
  ],
  [
    "Withholding payable",
    "₱0.00",
    "Posted withholding balance"
  ]
];

const PANELS = [
  {
    "type": "calc",
    "title": "VAT computation",
    "rows": [
      [
        "Illustrative default rate",
        "12%"
      ],
      [
        "Taxable base × rate",
        "VAT amount"
      ]
    ],
    "total": [
      "Output less input VAT",
      "₱0.00"
    ]
  },
  {
    "type": "calc",
    "title": "Withholding computation",
    "rows": [
      [
        "Illustrative default rate",
        "2%"
      ],
      [
        "Payment base × rate",
        "Amount withheld"
      ]
    ],
    "total": [
      "Withholding payable",
      "₱0.00"
    ]
  }
];

export default function TaxSummaries(props) {
  return (
    <ModulePage
      active="Tax summaries"
      title="Tax visibility, without the guesswork."
      description="Review illustrative VAT and withholding summaries for internal monitoring."
      actionLabel="Review settings"
      {...props}
    >
      <MetricCards items={METRICS} />
      <PanelGroup panels={PANELS} />
    </ModulePage>
  );
}
