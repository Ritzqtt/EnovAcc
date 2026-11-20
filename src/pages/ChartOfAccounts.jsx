import ModulePage from "../components/ModulePage";

export default function ChartOfAccounts(props) {
  return (
    <ModulePage
      active="Chart of accounts"
      title="Chart of accounts"
      description="The list of accounts used to record every transaction."
      actionLabel="+ New account"
      {...props}
    />
  );
}
