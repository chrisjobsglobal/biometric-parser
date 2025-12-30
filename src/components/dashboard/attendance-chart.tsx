"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBiometricStore } from "@/store/biometric-store";
import { getHoursWorkedPerDay } from "@/lib/biometric-parser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

export function AttendanceChart() {
  const { logs } = useBiometricStore();

  const chartData = useMemo(() => {
    if (logs.length === 0) return [];
    const data = getHoursWorkedPerDay(logs);
    return data.slice(-30).map((d) => ({
      ...d,
      displayDate: format(parseISO(d.date), "MMM d"),
    }));
  }, [logs]);

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Average Work Hours (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--border)]" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                className="fill-[var(--muted-foreground)]"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                className="fill-[var(--muted-foreground)]"
                label={{
                  value: "Hours",
                  angle: -90,
                  position: "insideLeft",
                  className: "fill-[var(--muted-foreground)]",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "var(--foreground)" }}
                formatter={(value: number, name: string) => [
                  name === "hours" ? `${value}h` : value,
                  name === "hours" ? "Avg Hours" : "Employees",
                ]}
              />
              <Legend />
              <Bar
                dataKey="hours"
                name="Avg Hours"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="employees"
                name="Employees"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
