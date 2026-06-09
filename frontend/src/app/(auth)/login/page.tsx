'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import AuthLayout from '../layout';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setErrorMsg(null);
    setShowResend(false);

    try {
      setLoading(true);
      console.log('[Login] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('[Login] Anon key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length ?? 0);
      console.log('[Login] Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      console.log('[Login] Auth response:', { user: data?.user?.id, session: !!data?.session, error: error?.message });

      if (error) {
        console.error('[Login] Auth error:', error.message, error.status);

        // Supabase returns "Invalid login credentials" for BOTH wrong passwords
        // AND unconfirmed emails. We need to check if the user might be unconfirmed.
        if (error.message.includes('Invalid login credentials')) {
          // Try to determine if this is an unconfirmed email issue:
          // Attempt a signup with the same email — if the user exists, signUp
          // returns a user with empty identities (no error).
          const { data: checkData } = await supabase.auth.signUp({
            email,
            password,
            options: { data: {} },
          });

          const isExistingUser =
            checkData?.user &&
            (!checkData.user.identities || checkData.user.identities.length === 0);

          if (isExistingUser) {
            // User exists but login failed — most likely unconfirmed email
            setErrorMsg(
              'Your email has not been verified yet. Please check your inbox (and spam folder) for the confirmation link, or click "Resend" below.'
            );
            setShowResend(true);
          } else {
            setErrorMsg('Invalid email or password. Please check your credentials and try again.');
          }
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg(
            'Your email has not been verified. Please check your inbox for the confirmation link.'
          );
          setShowResend(true);
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      const user = data.user;
      if (!user) {
        setErrorMsg('Login succeeded but no user was returned. Please try again.');
        return;
      }

      console.log('[Login] Success — user:', user.id);

      // Check onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('[Login] Profile fetch failed:', profileError.message);
        // Profile might not exist yet — send to onboarding
        router.replace('/onboarding');
        return;
      }

      router.replace(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
    } catch (err: any) {
      console.error('[Login] Unexpected error:', err);
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        setErrorMsg(`Failed to resend: ${error.message}`);
      } else {
        setErrorMsg('Verification email sent! Please check your inbox and spam folder.');
        setShowResend(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
          />

          {errorMsg && (
            <div className={`p-3 rounded-lg text-sm ${
              errorMsg.includes('sent!') 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {errorMsg}
            </div>
          )}

          {showResend && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="text-sm text-[#3B82F6] hover:text-[#60A5FA] underline underline-offset-2 text-left transition-colors"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-sm text-[#64748B]">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#3B82F6] hover:underline">Sign up</a>
        </p>
      </div>
    </AuthLayout>
  );
}
