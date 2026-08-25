"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTelegram } from "@/providers/TelegramProvider";

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
  director: [
    "view_dashboard",
    "manage_inventory",
    "manage_customers",
    "manage_sales",
    "manage_documents",
    "view_reports",
    "manage_marketing",
    "manage_settings",
    "manage_users",
    "export_data",
  ],
  ceo: [
    "view_dashboard",
    "manage_inventory",
    "manage_customers",
    "manage_sales",
    "manage_documents",
    "view_reports",
    "manage_marketing",
    "manage_settings",
    "export_data",
  ],
  staff: ["view_dashboard", "view_inventory", "manage_customers", "manage_sales"],
  guest: ["view_dashboard", "view_inventory"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: telegramUser } = useTelegram();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("lrs-user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoading(false);
      return;
    }

    if (telegramUser) {
      const tgUser: AuthUser = {
        id: telegramUser.id.toString(),
        name: `${telegramUser.first_name} ${telegramUser.last_name || ""}`.trim(),
        email: telegramUser.username
          ? `${telegramUser.username}@telegram.com`
          : undefined,
        role: "director",
        permissions: ROLE_PERMISSIONS.director,
      };

      setUser(tgUser);
      localStorage.setItem("lrs-user", JSON.stringify(tgUser));
    }

    setIsLoading(false);
  }, [telegramUser]);

  const login = async (email: string, _password: string) => {
    const mockUser: AuthUser = {
      id: "1",
      name: "LRS Motors Admin",
      email,
      role: "director",
      permissions: ROLE_PERMISSIONS.director,
    };

    localStorage.setItem("lrs-user", JSON.stringify(mockUser));
    setUser(mockUser);

    window.location.href = "/dashboard";
  };

  const logout = () => {
    localStorage.removeItem("lrs-user");
    setUser(null);

    window.location.href = "/";
  };

  const hasPermission = (permission: string) => {
    return user?.permissions.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}