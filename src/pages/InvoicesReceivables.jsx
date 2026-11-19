import ModulePage from "../components/ModulePage";

export default function InvoicesReceivables(props) {
  return (
    <ModulePage
      active="Invoices & receivables"
      title="Invoices & receivables"
      description="Invoices sent to customers and the amounts still owed to you."
      actionLabel="+ New invoice"
      {...props}
    />
  );
}
