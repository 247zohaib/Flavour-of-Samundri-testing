import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Lock, ArrowRight } from "lucide-react";
import { DoodleCup, DoodleSwirl } from "../components/Doodles";

const formatErr = (detail) => {
  if (!detail) return "Login failed.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e.msg || JSON.stringify(e)).join(" ");
  return String(detail);
};

const AdminLogin = () => {
  const { user, login, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <p className="font-heading text-3xl text-white/70">Brewing…</p>
      </div>
    );
  }

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Please enter email and password.");
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success("Welcome back, Owner.");
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(formatErr(err.response?.data?.detail) || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] chalk-bg chalk-noise flex items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        <DoodleSwirl className="absolute -top-12 -left-10 text-white/15 hidden sm:block" size={180} />
        <DoodleCup className="absolute -top-10 -right-6 text-white/20 -rotate-12 hidden sm:block" size={70} />
        <form
          onSubmit={submit}
          data-testid="admin-login-form"
          className="chalk-card p-8 space-y-6 relative"
        >
          <div className="text-center">
            <Lock className="mx-auto text-[#D97706]" size={28} />
            <div className="section-eyebrow mt-3">Owner Portal</div>
            <h1 className="font-heading text-5xl text-white chalk-text mt-1">
              Sign in
            </h1>
            <p className="font-body text-white/60 text-sm mt-2">Private dashboard for restaurant staff.</p>
          </div>
          <div>
            <label className="section-eyebrow block mb-2">Email</label>
            <input
              data-testid="admin-login-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="chalk-input"
              placeholder="owner@flavorsofsamundri.com"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="section-eyebrow block mb-2">Password</label>
            <input
              data-testid="admin-login-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="chalk-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={submitting}
            className="btn-chalk-primary w-full disabled:opacity-50"
          >
            {submitting ? "Signing in…" : (<>Enter Dashboard <ArrowRight size={16} /></>)}
          </button>
          <p className="text-center font-body text-xs text-white/40">
            Authorized personnel only.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
