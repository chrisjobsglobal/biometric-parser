"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBiometricStore } from "@/store/biometric-store";
import { toast } from "sonner";
import { Trash2, Database, Clock } from "lucide-react";

export default function SettingsPage() {
  const { logs, clearData } = useBiometricStore();

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      clearData();
      toast.success("All data has been cleared");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Work Hours Settings</CardTitle>
            <CardDescription>
              Configure standard work hours for attendance calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Start Time</label>
                <Input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work End Time</label>
                <Input type="time" defaultValue="17:45" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Late Threshold (minutes)</label>
                <Input type="number" defaultValue="15" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Hours for Full Day</label>
                <Input type="number" defaultValue="9" />
              </div>
            </div>
            <Button className="mt-4">
              <Clock className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your biometric log data storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-[var(--muted-foreground)]" />
                <div>
                  <p className="font-medium">Stored Records</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {logs.length.toLocaleString()} biometric entries
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
              disabled={logs.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Biometric Parser Application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Version:</span> 0.1.0
              </p>
              <p>
                <span className="font-medium">Framework:</span> Next.js 16
              </p>
              <p>
                <span className="font-medium">Description:</span> A modern web application
                for parsing and analyzing biometric attendance logs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
