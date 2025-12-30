export type BiometricStatus = "C/In" | "C/Out" | "Out" | "Out Back";

export interface BiometricLog {
  id: string;
  name: string;
  employeeNo: number;
  dateTime: Date;
  status: BiometricStatus;
}

export interface ParsedBiometricRow {
  Name: string;
  "No.": string;
  "Date/Time": string;
  Status: string;
}

export interface Employee {
  name: string;
  employeeNo: number;
  totalLogs: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface DailyAttendance {
  date: Date;
  employeeName: string;
  employeeNo: number;
  clockIn: Date | null;
  clockOut: Date | null;
  totalHours: number;
  breaks: { start: Date; end: Date; duration: number }[];
  logs: BiometricLog[];
}

export interface AttendanceSummary {
  totalEmployees: number;
  totalLogs: number;
  dateRange: { start: Date; end: Date };
  averageHoursPerDay: number;
  lateArrivals: number;
  earlyDepartures: number;
}

export interface DashboardStats {
  totalEmployees: number;
  totalLogs: number;
  averageWorkHours: number;
  todayPresent: number;
  dateRange: {
    start: Date;
    end: Date;
  };
}
