import { redirect } from "next/navigation";

import { SignupForm } from "@/components/forms/SignupForm";
import { AuthShell } from "@/components/ui/AuthShell";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell title="Create your student account" subtitle="Start with a simple profile, then add goals and weekly tasks.">
      <SignupForm />
    </AuthShell>
  );
}
