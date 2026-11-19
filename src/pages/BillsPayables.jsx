import ModulePage from "../components/ModulePage";

export default function BillsPayables(props) {
  return (
    <ModulePage
      active="Bills & payables"
      title="Bills & payables"
      description="Supplier bills and the amounts you still owe."
      actionLabel="+ New bill"
      {...props}
    />
  );
}
