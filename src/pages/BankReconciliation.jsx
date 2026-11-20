import ModulePage from "../components/ModulePage";

export default function BankReconciliation(props) {
  return (
    <ModulePage
      active="Bank reconciliation"
      title="Bank reconciliation"
      description="Match bank statement lines against recorded transactions."
      {...props}
    />
  );
}
