"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Car,
  Database,
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Megaphone,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/inventory", label: "Inventory", icon: Car },
  { href: "/vehicle-data", label: "Vehicle Data", icon: Database },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/sales", label: "Sales", icon: DollarSign },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/reports", label: "Reports", icon: TrendingUp },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lrs-blue rounded-lg flex items-center justify-center"><Car className="w-5 h-5 text-white" /></div>
          <span className="font-bold text-lrs-dark">LRS Motors</span>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <nav className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
          <div className="p-4 space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return <Link key={href} href={href} onClick={() => setIsMobileOpen(false)}><div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-lrs-blue text-white" : "text-gray-700 hover:bg-gray-100"}`}><Icon className="w-5 h-5" /><span className="font-medium">{label}</span></div></Link>;
            })}
          </div>
        </nav>
      )}

      <nav className="hidden md:fixed md:left-0 md:top-0 md:bottom-0 md:w-64 md:bg-white md:border-r md:border-gray-200 md:flex md:flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-lrs-blue rounded-lg flex items-center justify-center"><Car className="w-6 h-6 text-white" /></div><div><h1 className="font-bold text-lrs-dark text-lg">LRS Motors</h1><p className="text-xs text-gray-500 uppercase tracking-wider">Dealership</p></div></div>
        </div>

        {user && <div className="px-6 py-4 border-b border-gray-200 bg-lrs-light"><p className="text-sm font-medium text-gray-900">{user.name}</p><p className="text-xs text-gray-500 mt-1 capitalize">{user.role}</p></div>}

        <div className="flex-1 overflow-y-auto py-4"><div className="space-y-2 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return <Link key={href} href={href}><div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? "bg-lrs-blue text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}`}><Icon className="w-5 h-5" /><span>{label}</span></div></Link>;
          })}
        </div></div>

        <div className="border-t border-gray-200 p-4 text-center text-xs text-gray-500"><p>LRS Motors v0.1.0</p><p className="mt-1">Telegram Mini App</p></div>
      </nav>
    </>
  );
}
