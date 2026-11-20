import ModulePage from "../components/ModulePage";

export default function JournalEntries(props) {
  return (
    <ModulePage
      active="Journal entries"
      title="Journal entries"
      description="Record and review journal entries before they are posted."
      actionLabel="+ New journal entry"
      {...props}
    />
  );
}
