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
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return; // prevent double click
    setLoading(true);
    try {
      console.log("Signup Started");
      console.log({ email, password, phone });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone },
        },
      });

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // After successful registration, attempt auto-login and redirect to onboarding
        if (data.session) {
          // Session already available (no email confirmation required)
          alert("Account created and logged in.");
          router.replace("/onboarding");
        } else {
          // No session returned – email verification may be required
          alert('Account created. Please verify your email before logging in. Check your inbox for a confirmation link.');
          router.replace('/login');
        }
        setLoading(false);
        return;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-10 flex flex-col gap-4 max-w-md">
        <h1 className="text-2xl font-bold">Signup</h1>

        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="tel"
          placeholder="+91 9876543210"
          className="border p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="bg-black text-white p-2 rounded"
        >
          {loading ? "Creating…" : "Create Account"}
        </button>
      </div>
    </AuthLayout>
  );
}
