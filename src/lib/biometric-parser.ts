import Papa from "papaparse";
import {
  BiometricLog,
  BiometricStatus,
  ParsedBiometricRow,
  Employee,
  DailyAttendance,
  DashboardStats,
} from "@/types/biometric";
import { format, startOfDay, differenceInMinutes, parseISO } from "date-fns";

function parseDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr) return null;

  // Handle format: "24/11/2025 7:59:43 AM"
  const parts = dateTimeStr.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?/i
  );

  if (parts) {
    const [, day, month, year, hours, minutes, seconds, period] = parts;
    let hour = parseInt(hours, 10);

    if (period) {
      if (period.toUpperCase() === "PM" && hour !== 12) {
        hour += 12;
      } else if (period.toUpperCase() === "AM" && hour === 12) {
        hour = 0;
      }
    }

    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour,
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    );
  }

  return null;
}

function normalizeStatus(status: string): BiometricStatus | null {
  const normalized = status?.trim();
  if (normalized === "C/In") return "C/In";
  if (normalized === "C/Out") return "C/Out";
  if (normalized === "Out") return "Out";
  if (normalized === "Out Back") return "Out Back";
  return null;
}

export function parseBiometricCSV(csvContent: string): BiometricLog[] {
  const result = Papa.parse<ParsedBiometricRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const logs: BiometricLog[] = [];

  result.data.forEach((row, index) => {
    const name = row.Name?.trim();
    const employeeNo = parseInt(row["No."], 10);
    const dateTime = parseDateTime(row["Date/Time"]);
    const status = normalizeStatus(row.Status);

    if (name && !isNaN(employeeNo) && dateTime && status) {
      logs.push({
        id: `${employeeNo}-${dateTime.getTime()}-${index}`,
        name: name.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
        employeeNo,
        dateTime,
        status,
      });
    }
  });

  return logs.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
}

export function getEmployees(logs: BiometricLog[]): Employee[] {
  const employeeMap = new Map<number, Employee>();

  logs.forEach((log) => {
    const existing = employeeMap.get(log.employeeNo);
    if (existing) {
      existing.totalLogs++;
      if (log.dateTime < existing.firstSeen) {
        existing.firstSeen = log.dateTime;
      }
      if (log.dateTime > existing.lastSeen) {
        existing.lastSeen = log.dateTime;
      }
    } else {
      employeeMap.set(log.employeeNo, {
        name: log.name,
        employeeNo: log.employeeNo,
        totalLogs: 1,
        firstSeen: log.dateTime,
        lastSeen: log.dateTime,
      });
    }
  });

  return Array.from(employeeMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function getDailyAttendance(
  logs: BiometricLog[],
  employeeNo?: number
): DailyAttendance[] {
  const filteredLogs = employeeNo
    ? logs.filter((l) => l.employeeNo === employeeNo)
    : logs;

  const groupedByEmployeeDate = new Map<string, BiometricLog[]>();

  filteredLogs.forEach((log) => {
    const dateKey = format(log.dateTime, "yyyy-MM-dd");
    const key = `${log.employeeNo}-${dateKey}`;
    const existing = groupedByEmployeeDate.get(key) || [];
    existing.push(log);
    groupedByEmployeeDate.set(key, existing);
  });

  const attendances: DailyAttendance[] = [];

  groupedByEmployeeDate.forEach((dayLogs, key) => {
    const sorted = dayLogs.sort(
      (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
    );
    const firstLog = sorted[0];
    const lastLog = sorted[sorted.length - 1];

    // Find first clock in and last clock out
    const clockIn = sorted.find(
      (l) => l.status === "C/In" || l.status === "Out Back"
    )?.dateTime ?? null;
    const clockOut =
      [...sorted]
        .reverse()
        .find((l) => l.status === "C/Out" || l.status === "Out")?.dateTime ??
      null;

    // Calculate breaks
    const breaks: { start: Date; end: Date; duration: number }[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (
        (current.status === "C/Out" || current.status === "Out") &&
        (next.status === "C/In" || next.status === "Out Back")
      ) {
        breaks.push({
          start: current.dateTime,
          end: next.dateTime,
          duration: differenceInMinutes(next.dateTime, current.dateTime),
        });
      }
    }

    const totalBreakMinutes = breaks.reduce((sum, b) => sum + b.duration, 0);
    const totalMinutes =
      clockIn && clockOut ? differenceInMinutes(clockOut, clockIn) : 0;
    const workingMinutes = Math.max(0, totalMinutes - totalBreakMinutes);

    attendances.push({
      date: startOfDay(firstLog.dateTime),
      employeeName: firstLog.name,
      employeeNo: firstLog.employeeNo,
      clockIn,
      clockOut,
      totalHours: workingMinutes / 60,
      breaks,
      logs: sorted,
    });
  });

  return attendances.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getDashboardStats(logs: BiometricLog[]): DashboardStats {
  const employees = getEmployees(logs);
  const dailyAttendances = getDailyAttendance(logs);

  const validWorkDays = dailyAttendances.filter((d) => d.totalHours > 0);
  const averageWorkHours =
    validWorkDays.length > 0
      ? validWorkDays.reduce((sum, d) => sum + d.totalHours, 0) /
        validWorkDays.length
      : 0;

  const dates = logs.map((l) => l.dateTime);
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date();

  // Today's present count
  const today = startOfDay(new Date());
  const todayLogs = logs.filter(
    (l) => startOfDay(l.dateTime).getTime() === today.getTime()
  );
  const todayPresent = new Set(todayLogs.map((l) => l.employeeNo)).size;

  return {
    totalEmployees: employees.length,
    totalLogs: logs.length,
    averageWorkHours: Math.round(averageWorkHours * 10) / 10,
    todayPresent,
    dateRange: {
      start: minDate,
      end: maxDate,
    },
  };
}

export function getAttendanceByDate(
  logs: BiometricLog[],
  date: Date
): DailyAttendance[] {
  const targetDate = startOfDay(date);
  return getDailyAttendance(logs).filter(
    (a) => a.date.getTime() === targetDate.getTime()
  );
}

export function getEmployeeAttendance(
  logs: BiometricLog[],
  employeeNo: number
): DailyAttendance[] {
  return getDailyAttendance(logs, employeeNo);
}

export function getHoursWorkedPerDay(logs: BiometricLog[]): { date: string; hours: number; employees: number }[] {
  const dailyAttendances = getDailyAttendance(logs);
  const grouped = new Map<string, DailyAttendance[]>();

  dailyAttendances.forEach((a) => {
    const dateKey = format(a.date, "yyyy-MM-dd");
    const existing = grouped.get(dateKey) || [];
    existing.push(a);
    grouped.set(dateKey, existing);
  });

  return Array.from(grouped.entries())
    .map(([date, attendances]) => ({
      date,
      hours: Math.round(
        (attendances.reduce((sum, a) => sum + a.totalHours, 0) /
          attendances.length) *
          10
      ) / 10,
      employees: attendances.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
