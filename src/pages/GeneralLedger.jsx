import ModulePage from "../components/ModulePage";

export default function GeneralLedger(props) {
  return (
    <ModulePage
      active="General ledger"
      title="General ledger"
      description="Every posted transaction, organized by account."
      {...props}
    />
  );
}
