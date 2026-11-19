import ModulePage from "../components/ModulePage";

export default function FinancialReports(props) {
  return (
    <ModulePage
      active="Financial reports"
      title="Financial reports"
      description="Statements and summaries for the selected period."
      {...props}
    />
  );
}
