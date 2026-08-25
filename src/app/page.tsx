"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">LRS Motors</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          className="w-full bg-blue-600 text-white rounded-lg p-3"
          onClick={() => login(email || "admin@lrsmotors.com", "1234")}
        >
          Login
        </button>
      </div>
    </div>
  );
}