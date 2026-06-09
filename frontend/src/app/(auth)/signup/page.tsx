"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AuthLayout from "../layout";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      console.log("[Signup] Starting for:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("[Signup] Response:", {
        user: data?.user?.id,
        session: !!data?.session,
        identities: data?.user?.identities?.length,
        error: error?.message,
      });

      if (error) {
        console.error("[Signup] Error:", error.message);
        setErrorMsg(error.message);
        return;
      }

      // Check for the "fake user" case — Supabase returns a user with
      // empty identities when the email is already registered (security measure).
      if (
        data?.user &&
        (!data.user.identities || data.user.identities.length === 0)
      ) {
        setErrorMsg(
          "An account with this email already exists. Please log in instead, or check your inbox for a verification link."
        );
        return;
      }

      if (data.session) {
        // Session available — email confirmation is NOT required
        setSuccessMsg("Account created! Redirecting to onboarding...");
        setTimeout(() => router.replace("/onboarding"), 500);
      } else {
        // No session — email confirmation IS required
        setSuccessMsg(
          "Account created! Please check your inbox (and spam folder) for a verification link. You must verify your email before logging in."
        );
        // Don't auto-redirect — let the user read the message
      }
    } catch (err: any) {
      console.error("[Signup] Unexpected error:", err);
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
        />

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
        />



        {errorMsg && (
          <div className="p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg text-sm bg-green-500/10 border border-green-500/20 text-green-400">
            {successMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading || !!successMsg}
          className="bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Account"}
        </button>

        <p className="text-sm text-[#64748B]">
          Already have an account?{' '}
          <a href="/login" className="text-[#3B82F6] hover:underline">Log in</a>
        </p>
      </div>
    </AuthLayout>
  );
}
