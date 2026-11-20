import ModulePage from "../components/ModulePage";

export default function TaxSummaries(props) {
  return (
    <ModulePage
      active="Tax summaries"
      title="Tax summaries"
      description="Tax totals gathered from posted transactions."
      {...props}
    />
  );
}
