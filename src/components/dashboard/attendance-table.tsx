"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import { formatDate, formatDuration, formatTime } from "@/lib/utils";
import { Search, Clock, Coffee } from "lucide-react";

export function AttendanceTable() {
  const { logs, employees, getFilteredAttendance, setSelectedEmployee, selectedEmployeeNo, settings } =
    useBiometricStore();
  const [search, setSearch] = useState("");

  const attendance = getFilteredAttendance();

  // Parse settings for calculations
  const [startHour, startMinute] = settings.workStartTime.split(":").map(Number);
  const [endHour, endMinute] = settings.workEndTime.split(":").map(Number);
  const lateThresholdMinutes = settings.lateThresholdMinutes;
  const minHoursFullDay = settings.minHoursFullDay;

  const attendance = getFilteredAttendance();

  const filteredAttendance = useMemo(() => {
    if (!search) return attendance;
    const searchLower = search.toLowerCase();
    return attendance.filter(
      (a) =>
        a.employeeName.toLowerCase().includes(searchLower) ||
        a.employeeNo.toString().includes(search)
    );
  }, [attendance, search]);

  const employeeOptions = useMemo(
    () => [
      { value: "", label: "All Employees" },
      ...employees.map((e) => ({
        value: e.employeeNo.toString(),
        label: `${e.name} (#${e.employeeNo})`,
      })),
    ],
    [employees]
  );

  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Attendance Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full sm:w-[200px]"
              />
            </div>
            <Select
              options={employeeOptions}
              value={selectedEmployeeNo?.toString() ?? ""}
              onChange={(e) =>
                setSelectedEmployee(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              className="w-full sm:w-[200px]"
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
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Breaks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.slice(0, 50).map((record, idx) => {
                // Calculate late arrival based on settings
                const isLateArrival = record.clockIn && (() => {
                  const clockInHour = record.clockIn!.getHours();
                  const clockInMinute = record.clockIn!.getMinutes();
                  const clockInTotalMinutes = clockInHour * 60 + clockInMinute;
                  const thresholdTotalMinutes = startHour * 60 + startMinute + lateThresholdMinutes;
                  return clockInTotalMinutes > thresholdTotalMinutes;
                })();

                // Calculate early departure based on settings
                const isEarlyDeparture = record.clockOut && (() => {
                  const clockOutHour = record.clockOut!.getHours();
                  const clockOutMinute = record.clockOut!.getMinutes();
                  const clockOutTotalMinutes = clockOutHour * 60 + clockOutMinute;
                  const endTotalMinutes = endHour * 60 + endMinute;
                  return clockOutTotalMinutes < endTotalMinutes;
                })();

                // Calculate full day based on minHoursFullDay setting
                const isFullDay = record.totalHours >= minHoursFullDay;
                const isPartialDay = record.totalHours > 0 && record.totalHours < minHoursFullDay;

                return (
                  <TableRow key={`${record.employeeNo}-${record.date.getTime()}-${idx}`}>
                    <TableCell className="font-medium">
                      <span>
                        {record.employeeName}{" "}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          #{record.employeeNo}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      {record.clockIn ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(record.clockIn)}
                        </div>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.clockOut ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(record.clockOut)}
                        </div>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatDuration(record.totalHours * 60)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.breaks.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Coffee className="h-3 w-3" />
                          <span>
                            {record.breaks.length} (
                            {formatDuration(
                              record.breaks.reduce((sum, b) => sum + b.duration, 0)
                            )}
                            )
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {isFullDay && (
                          <Badge variant="success">Full Day</Badge>
                        )}
                        {isPartialDay && (
                          <Badge variant="warning">Partial</Badge>
                        )}
                        {isLateArrival && (
                          <Badge variant="destructive">Late</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAttendance.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-[var(--muted-foreground)]"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredAttendance.length > 50 && (
          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            Showing 50 of {filteredAttendance.length} records
          </p>
        )}
      </CardContent>
    </Card>
  );
}
