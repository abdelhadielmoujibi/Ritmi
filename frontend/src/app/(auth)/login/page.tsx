import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/LoginForm";
import { AuthShell } from "@/components/ui/AuthShell";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your adaptive study planning.">
      <LoginForm />
    </AuthShell>
  );
}
