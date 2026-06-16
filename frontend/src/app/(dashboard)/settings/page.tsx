"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Shield,
  LogOut,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  // ── Profile state ─────────────────────────────────────────────────────────
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ── Fetch profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name ?? "");
        setPhone(profile.phone ?? "");
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [supabase, router]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!userId) return;
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          phone: phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (profileLoading) {
    return (
      <PageWrapper title="Settings" subtitle="Manage your account">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-2 border-[#10B981]/30 border-t-[#10B981] animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-2xl space-y-6">
        {/* ── Profile Section ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <p className="text-sm text-[#94A3B8]">
                  Update your personal information
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1F2937] bg-[#0F172A] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1F2937] bg-[#0F172A]/50 text-sm text-[#64748B] cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-[#475569] mt-1">
                  Email cannot be changed from here
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  loading={profileSaving}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Password Section ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Change Password
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Update your account password
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#1F2937] bg-[#0F172A] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1F2937] bg-[#0F172A] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/20 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleChangePassword}
                  loading={passwordSaving}
                  disabled={!newPassword || !confirmPassword}
                >
                  <Lock className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Session</h2>
                <p className="text-sm text-[#94A3B8]">
                  Sign out of your account
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#94A3B8] mb-4">
              This will sign you out of your current session and redirect you to
              the login page.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
