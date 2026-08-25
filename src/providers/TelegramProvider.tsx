"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

interface TelegramContextType {
  initData: TelegramInitData | null;
  user: TelegramUser | null;
  isLoading: boolean;
  error: string | null;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        webApp.ready();
        
        const initDataRaw = webApp.initData;
        if (initDataRaw) {
          const params = new URLSearchParams(initDataRaw);
          const initData: TelegramInitData = {
            auth_date: parseInt(params.get("auth_date") || "0"),
            hash: params.get("hash") || "",
          };
          
          const userStr = params.get("user");
          if (userStr) {
            try {
              initData.user = JSON.parse(userStr);
            } catch (e) {
              console.error("Failed to parse Telegram user", e);
            }
          }
          
          setInitData(initData);
        }
      } else {
        setInitData({
          user: {
            id: 123456789,
            is_bot: false,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
          },
          auth_date: Math.floor(Date.now() / 1000),
          hash: "test_hash_dev",
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Telegram initialization error:", err);
      setError("Failed to initialize Telegram");
      setIsLoading(false);
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        initData,
        user: initData?.user || null,
        isLoading,
        error,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: Record<string, unknown>;
      };
    };
  }
}
