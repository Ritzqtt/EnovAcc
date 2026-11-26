import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuditLogs() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, created_at, actor_name, action, reference")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      setError(error.message);
      setEntries([]);
    } else {
      setEntries(
        (data ?? []).map((row) => ({
          id: row.id,
          timestamp: row.created_at,
          user: row.actor_name,
          action: row.action,
          reference: row.reference,
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { entries, loading, error, refetch: fetchLogs };
}