import ModulePage from "../components/ModulePage";

export default function Expenses(props) {
  return (
    <ModulePage
      active="Expenses"
      title="Expenses"
      description="Track and categorize company expenses."
      actionLabel="+ New expense"
      {...props}
    />
  );
}
