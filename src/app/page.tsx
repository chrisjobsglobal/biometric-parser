"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileUpload } from "@/components/dashboard/file-upload";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useBiometricStore } from "@/store/biometric-store";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function Home() {
  const { logs, loadFromCSV } = useBiometricStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadSampleData = async () => {
    try {
      const response = await fetch("/api/sample-data");
      if (!response.ok) throw new Error("Failed to load sample data");
      const csvContent = await response.text();
      loadFromCSV(csvContent);
      toast.success("Sample data loaded successfully!");
    } catch (error) {
      toast.error("Failed to load sample data");
    }
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 max-w-xl">
            <FileUpload />
          </div>
          {logs.length === 0 && (
            <Button onClick={loadSampleData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Load Data
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Charts and Activity */}
        {logs.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AttendanceChart />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <AttendanceTable />
      </div>
    </DashboardLayout>
  );
}
