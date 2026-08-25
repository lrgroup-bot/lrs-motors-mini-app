"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
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
  staff: [
    "view_dashboard",
    "view_inventory",
    "manage_customers",
    "manage_sales",
  ],
  guest: ["view_dashboard", "view_inventory"],
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user: telegramUser } = useTelegram();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (telegramUser) {
      const mockUser: AuthUser = {
        id: telegramUser.id.toString(),
        name: `${telegramUser.first_name} ${
          telegramUser.last_name || ""
        }`.trim(),
        email: telegramUser.username
          ? `${telegramUser.username}@telegram.com`
          : undefined,
        role: "director",
        permissions: ROLE_PERMISSIONS.director,
      };

      setUser(mockUser);
    }

    setIsLoading(false);
  }, [telegramUser]);

  const login = async (email: string, _password: string) => {
    console.log("Login attempt:", email);
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    router.push("/");
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