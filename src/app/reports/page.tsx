"use client";

import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useBiometricStore } from "@/store/biometric-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, Clock, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { getDailyAttendance, getEmployees, getHoursWorkedPerDay } from "@/lib/biometric-parser";
import { formatDuration } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ReportsPage() {
  const { logs } = useBiometricStore();

  const reportData = useMemo(() => {
    if (logs.length === 0) return null;

    const employees = getEmployees(logs);
    const dailyAttendances = getDailyAttendance(logs);
    const hoursPerDay = getHoursWorkedPerDay(logs);

    // Employee summary report
    const employeeSummary = employees.map((emp) => {
      const empAttendance = dailyAttendances.filter(
        (a) => a.employeeNo === emp.employeeNo
      );
      const totalHours = empAttendance.reduce((sum, a) => sum + a.totalHours, 0);
      const avgHours = empAttendance.length > 0 ? totalHours / empAttendance.length : 0;
      const daysWorked = empAttendance.filter((a) => a.totalHours > 0).length;
      const lateCount = empAttendance.filter(
        (a) => a.clockIn && a.clockIn.getHours() >= 9
      ).length;
      const totalBreaks = empAttendance.reduce(
        (sum, a) => sum + a.breaks.reduce((s, b) => s + b.duration, 0),
        0
      );

      return {
        name: emp.name,
        employeeNo: emp.employeeNo,
        daysWorked,
        totalHours,
        avgHours,
        lateCount,
        totalBreaks,
      };
    });

    // Overall statistics
    const totalWorkingDays = new Set(hoursPerDay.map((d) => d.date)).size;
    const overallAvgHours =
      hoursPerDay.reduce((sum, d) => sum + d.hours, 0) / (hoursPerDay.length || 1);
    const overallAvgEmployeesPerDay =
      hoursPerDay.reduce((sum, d) => sum + d.employees, 0) / (hoursPerDay.length || 1);

    return {
      employeeSummary,
      totalWorkingDays,
      overallAvgHours,
      overallAvgEmployeesPerDay,
      totalEmployees: employees.length,
    };
  }, [logs]);

  const downloadCSV = () => {
    if (!reportData) return;

    const headers = [
      "Employee Name",
      "Employee No",
      "Days Worked",
      "Total Hours",
      "Avg Hours/Day",
      "Late Arrivals",
      "Total Break Time (min)",
    ];

    const rows = reportData.employeeSummary.map((emp) => [
      emp.name,
      emp.employeeNo,
      emp.daysWorked,
      emp.totalHours.toFixed(2),
      emp.avgHours.toFixed(2),
      emp.lateCount,
      emp.totalBreaks,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (logs.length === 0) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Upload a biometric log CSV file or load sample data to generate reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Report Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Working Days</CardTitle>
              <Calendar className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.totalWorkingDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
              <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData?.overallAvgHours.toFixed(1)}h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Employees/Day</CardTitle>
              <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData?.overallAvgEmployeesPerDay.toFixed(0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <TrendingUp className="h-4 w-4 text-[var(--muted-foreground)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData?.totalEmployees}</div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Summary Report */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employee Summary Report</CardTitle>
              <CardDescription>
                Overview of attendance metrics for each employee
              </CardDescription>
            </div>
            <Button onClick={downloadCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Days Worked</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Avg Hours/Day</TableHead>
                    <TableHead>Late Arrivals</TableHead>
                    <TableHead>Break Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.employeeSummary.map((emp) => (
                    <TableRow key={emp.employeeNo}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>#{emp.employeeNo}</TableCell>
                      <TableCell>{emp.daysWorked}</TableCell>
                      <TableCell>{formatDuration(emp.totalHours * 60)}</TableCell>
                      <TableCell
                        className={
                          emp.avgHours >= 8
                            ? "text-green-600"
                            : emp.avgHours >= 6
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        {formatDuration(emp.avgHours * 60)}
                      </TableCell>
                      <TableCell>
                        {emp.lateCount > 0 ? (
                          <span className="text-red-600">{emp.lateCount}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDuration(emp.totalBreaks)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
