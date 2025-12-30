"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EmployeeList } from "@/components/dashboard/employee-list";
import { useBiometricStore } from "@/store/biometric-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function EmployeesPage() {
  const { logs } = useBiometricStore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {logs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                Upload a biometric log CSV file or load sample data to view employees.
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
        ) : (
          <EmployeeList />
        )}
      </div>
    </DashboardLayout>
  );
}
