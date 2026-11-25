import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useWorkspaceUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, status, role_id, roles(role_name)")
      .order("full_name", { ascending: true });

    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      setUsers(
        (data ?? []).map((u) => ({
          ...u,
          role_name: u.roles?.role_name ?? "",
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}