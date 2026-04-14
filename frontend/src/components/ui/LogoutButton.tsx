"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
      }
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
