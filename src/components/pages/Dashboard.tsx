"use client";

import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/Card";
import {
  TrendingUp,
  Car,
  Lock,
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
} from "lucide-react";

export function Dashboard() {
  return (
    <div className="min-h-screen bg-lrs-light">
      <PageHeader
        title="Dashboard"
        description="Overview of your dealership performance"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Car className="w-6 h-6" />}
            title="Total Vehicles"
            value="48"
            subtitle="In inventory"
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Available"
            value="32"
            subtitle="Ready to sell"
            trend="up"
            trendValue="+5 this week"
            color="green"
          />
          <StatCard
            icon={<Lock className="w-6 h-6" />}
            title="Reserved"
            value="8"
            subtitle="Pending sale"
            color="orange"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Sold This Month"
            value="8"
            subtitle="+3 this week"
            trend="up"
            trendValue="+60%"
            color="green"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Total Sales"
            value="₹28.5L"
            subtitle="This month"
            trend="up"
            trendValue="+12%"
            color="green"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            title="Estimated Profit"
            value="₹4.8L"
            subtitle="This month"
            trend="up"
            trendValue="+8%"
            color="green"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Customer Leads"
            value="12"
            subtitle="Active leads"
            color="purple"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Test Drives"
            value="5"
            subtitle="Scheduled this week"
            color="blue"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    vehicle: "Hyundai i20 2021",
                    price: "₹6.5L",
                    date: "Today",
                    profit: "₹80K",
                  },
                  {
                    vehicle: "Toyota Fortuner 2019",
                    price: "₹12L",
                    date: "Yesterday",
                    profit: "₹1.2L",
                  },
                  {
                    vehicle: "Maruti Swift 2020",
                    price: "₹4.8L",
                    date: "2 days ago",
                    profit: "₹60K",
                  },
                ].map((sale, idx) => (
                  <div key={idx} className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{sale.vehicle}</p>
                      <p className="text-sm text-gray-500">{sale.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{sale.price}</p>
                      <p className="text-sm text-green-600">+{sale.profit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Test Drives</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    customer: "Rajesh Kumar",
                    vehicle: "Hyundai Creta",
                    time: "10:00 AM",
                    status: "Confirmed",
                  },
                  {
                    customer: "Priya Singh",
                    vehicle: "Maruti Vitara",
                    time: "2:30 PM",
                    status: "Confirmed",
                  },
                  {
                    customer: "Amit Patel",
                    vehicle: "Toyota Innova",
                    time: "4:00 PM",
                    status: "Pending",
                  },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-start justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{event.customer}</p>
                      <p className="text-sm text-gray-500">{event.vehicle}</p>
                      <p className="text-xs text-gray-400 mt-1">{event.time}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {event.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Add Vehicle", icon: "➕" },
                { label: "New Customer", icon: "👤" },
                { label: "Schedule Test Drive", icon: "📅" },
                { label: "View Reports", icon: "📊" },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-lrs-light hover:bg-gray-200 transition-colors text-center"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
