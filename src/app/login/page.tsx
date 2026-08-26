"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Car, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("admin@lrsmotors.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  }

  if (isLoading) {
    return <main className="min-h-screen bg-lrs-light flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-500" /></main>;
  }

  return (
    <main className="min-h-screen bg-lrs-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-lrs-primary text-white p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4"><Car className="w-9 h-9" /></div>
            <h1 className="text-2xl font-bold">LRS Motors</h1>
            <p className="text-sm text-white/80 mt-1">PC Server</p>
          </div>
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-lrs-primary focus:ring-2 focus:ring-lrs-primary/10" placeholder="admin@lrsmotors.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-lrs-primary focus:ring-2 focus:ring-lrs-primary/10" placeholder="Enter your password" />
              </div>
            </div>
            {error && <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-lrs-primary text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</> : <><LockKeyhole className="w-5 h-5" />Sign In</>}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-5">LRS Motors local server • Authorized personnel only</p>
      </div>
    </main>
  );
}
