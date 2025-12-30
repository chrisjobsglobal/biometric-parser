import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BiometricLog, Employee, DailyAttendance, DashboardStats } from "@/types/biometric";
import {
  parseBiometricCSV,
  getEmployees,
  getDailyAttendance,
  getDashboardStats,
} from "@/lib/biometric-parser";

export interface WorkSettings {
  workStartTime: string; // HH:mm format
  workEndTime: string; // HH:mm format
  lateThresholdMinutes: number;
  minHoursFullDay: number;
}

const defaultSettings: WorkSettings = {
  workStartTime: "08:00",
  workEndTime: "17:45",
  lateThresholdMinutes: 15,
  minHoursFullDay: 9,
};

interface BiometricStore {
  logs: BiometricLog[];
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  selectedEmployeeNo: number | null;
  selectedDate: Date | null;
  settings: WorkSettings;

  // Actions
  loadFromCSV: (csvContent: string) => void;
  updateSettings: (settings: Partial<WorkSettings>) => void;
  setSelectedEmployee: (employeeNo: number | null) => void;
  setSelectedDate: (date: Date | null) => void;
  clearData: () => void;

  // Computed selectors
  getStats: () => DashboardStats;
  getFilteredAttendance: () => DailyAttendance[];
}

export const useBiometricStore = create<BiometricStore>()(
  persist(
    (set, get) => ({
      logs: [],
      employees: [],
      isLoading: false,
      error: null,
      selectedEmployeeNo: null,
      selectedDate: null,
      settings: defaultSettings,

      updateSettings: (newSettings: Partial<WorkSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      loadFromCSV: (csvContent: string) => {
        set({ isLoading: true, error: null });
        try {
          const logs = parseBiometricCSV(csvContent);
          const employees = getEmployees(logs);
          set({ logs, employees, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Failed to parse CSV",
            isLoading: false,
          });
        }
      },

      setSelectedEmployee: (employeeNo) => set({ selectedEmployeeNo: employeeNo }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      clearData: () =>
        set({
          logs: [],
          employees: [],
          selectedEmployeeNo: null,
          selectedDate: null,
          error: null,
        }),

      getStats: () => {
        const { logs } = get();
        return getDashboardStats(logs);
      },

      getFilteredAttendance: () => {
        const { logs, selectedEmployeeNo, selectedDate } = get();
        let attendance = getDailyAttendance(logs, selectedEmployeeNo ?? undefined);

        if (selectedDate) {
          const targetTime = selectedDate.getTime();
          attendance = attendance.filter((a) => a.date.getTime() === targetTime);
        }

        return attendance;
      },
    }),
    {
      name: "biometric-storage",
      partialize: (state) => ({
        logs: state.logs.map((l) => ({
          ...l,
          dateTime: l.dateTime.toISOString(),
        })),
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.logs) {
          state.logs = state.logs.map((l: BiometricLog & { dateTime: string | Date }) => ({
            ...l,
            dateTime: typeof l.dateTime === "string" ? new Date(l.dateTime) : l.dateTime,
          }));
          state.employees = getEmployees(state.logs);
        }
      },
    }
  )
);
