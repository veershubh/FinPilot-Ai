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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      console.log('Login attempt:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Supabase auth result:', data, error);
      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error('User not found');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;
      router.replace(profile?.onboarding_completed ? '/dashboard' : '/onboarding');
    } catch (err) {
      const error = err as any;
      // Provide clearer error messages based on Supabase error messages
      if (error?.message?.includes('User not confirmed')) {
        alert('Please verify your email before logging in. Check your inbox for the verification link.');
      } else if (error?.message?.includes('Invalid login credentials')) {
        alert('Invalid email or password. Please try again.');
      } else {
        alert(error?.message || 'An unexpected error occurred');
      }
      alert(error.message);
    } finally {
      setLoading(false);
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
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white p-2 rounded"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

