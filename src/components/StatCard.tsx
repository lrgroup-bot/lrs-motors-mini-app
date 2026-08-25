import React from "react";
import { Card, CardContent } from "./Card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "orange" | "red" | "purple";
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  purple: "bg-purple-50 text-purple-700",
};

export function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = "blue",
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
            {trendValue && (
              <p
                className={`text-xs font-medium mt-2 ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
