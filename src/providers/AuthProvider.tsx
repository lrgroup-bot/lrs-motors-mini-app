"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "director" | "ceo" | "staff" | "guest";

interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  director: ["view_dashboard", "manage_inventory", "view_inventory", "manage_customers", "manage_sales", "manage_documents", "view_reports", "manage_marketing", "manage_settings", "manage_users", "export_data"],
  ceo: ["view_dashboard", "manage_inventory", "view_inventory", "manage_customers", "manage_sales", "manage_documents", "view_reports", "manage_marketing", "manage_settings", "export_data"],
  staff: ["view_dashboard", "view_inventory", "manage_customers", "manage_sales"],
  guest: ["view_dashboard", "view_inventory"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem("lrs-user");
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      window.localStorage.removeItem("lrs-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) throw new Error("Email is required");

    const pcUser: AuthUser = {
      id: normalizedEmail,
      name: "LRS Motors Admin",
      email: normalizedEmail,
      role: "director",
      permissions: ROLE_PERMISSIONS.director,
    };

    window.localStorage.setItem("lrs-user", JSON.stringify(pcUser));
    setUser(pcUser);
    window.location.href = "/dashboard";
  };

  const logout = () => {
    window.localStorage.removeItem("lrs-user");
    setUser(null);
    window.location.href = "/login";
  };

  const hasPermission = (permission: string) => user?.permissions.includes(permission) ?? false;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
