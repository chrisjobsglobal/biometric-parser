"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBiometricStore } from "@/store/biometric-store";
import { Users, ClipboardList, Clock, Calendar } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

export function StatsCards() {
  const { logs, getStats } = useBiometricStore();

  if (logs.length === 0) {
    return null;
  }

  const stats = getStats();

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toString(),
      description: "Unique employees tracked",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Logs",
      value: stats.totalLogs.toLocaleString(),
      description: "Biometric entries recorded",
      icon: ClipboardList,
      color: "text-green-500",
    },
    {
      title: "Avg. Work Hours",
      value: `${stats.averageWorkHours}h`,
      description: "Average per day per employee",
      icon: Clock,
      color: "text-amber-500",
    },
    {
      title: "Date Range",
      value: `${Math.ceil((stats.dateRange.end.getTime() - stats.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))} days`,
      description: `${formatDate(stats.dateRange.start)} - ${formatDate(stats.dateRange.end)}`,
      icon: Calendar,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
