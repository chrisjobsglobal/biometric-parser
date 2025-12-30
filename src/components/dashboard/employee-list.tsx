"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBiometricStore } from "@/store/biometric-store";
import { formatDate, formatDuration } from "@/lib/utils";
import { Search, User } from "lucide-react";
import { getDailyAttendance } from "@/lib/biometric-parser";

export function EmployeeList() {
  const { logs, employees, setSelectedEmployee, selectedEmployeeNo, settings } =
    useBiometricStore();
  const [search, setSearch] = useState("");

  const minHoursFullDay = settings.minHoursFullDay;
  const [search, setSearch] = useState("");

  const employeeStats = useMemo(() => {
    return employees.map((emp) => {
      const attendance = getDailyAttendance(logs, emp.employeeNo);
      const totalHours = attendance.reduce((sum, a) => sum + a.totalHours, 0);
      const avgHours = attendance.length > 0 ? totalHours / attendance.length : 0;
      const daysWorked = attendance.filter((a) => a.totalHours > 0).length;

      return {
        ...emp,
        totalHours,
        avgHours,
        daysWorked,
      };
    });
  }, [employees, logs]);

  const filteredEmployees = useMemo(() => {
    if (!search) return employeeStats;
    const searchLower = search.toLowerCase();
    return employeeStats.filter(
      (e) =>
        e.name.toLowerCase().includes(searchLower) ||
        e.employeeNo.toString().includes(search)
    );
  }, [employeeStats, search]);

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Employees ({employees.length})</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-full sm:w-[250px]"
            />
          </div>
        </div>
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
                <TableHead>Total Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow
                  key={emp.employeeNo}
                  className={`cursor-pointer ${
                    selectedEmployeeNo === emp.employeeNo
                      ? "bg-[var(--muted)]"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedEmployee(
                      selectedEmployeeNo === emp.employeeNo
                        ? null
                        : emp.employeeNo
                    )
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                        <User className="h-4 w-4" />
                      </div>
                      {emp.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">#{emp.employeeNo}</Badge>
                  </TableCell>
                  <TableCell>{emp.daysWorked} days</TableCell>
                  <TableCell>{formatDuration(emp.totalHours * 60)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        emp.avgHours >= minHoursFullDay
                          ? "text-green-600 dark:text-green-400"
                          : emp.avgHours >= minHoursFullDay * 0.75
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }
                    >
                      {formatDuration(emp.avgHours * 60)}
                    </span>
                  </TableCell>
                  <TableCell>{emp.totalLogs}</TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-[var(--muted-foreground)]"
                  >
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
