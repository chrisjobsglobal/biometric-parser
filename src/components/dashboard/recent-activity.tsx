"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBiometricStore } from "@/store/biometric-store";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { formatTime } from "@/lib/utils";

export function RecentActivity() {
  const { logs } = useBiometricStore();

  const recentLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()).slice(0, 15);
  }, [logs]);

  if (logs.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "C/In":
        return <Badge variant="success">Clock In</Badge>;
      case "C/Out":
        return <Badge variant="destructive">Clock Out</Badge>;
      case "Out":
        return <Badge variant="warning">Break Out</Badge>;
      case "Out Back":
        return <Badge variant="secondary">Break Back</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 rounded-lg border border-[var(--border)] p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
                <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{log.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    #{log.employeeNo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <span>{log.dateTime.toLocaleDateString()}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span>{formatTime(log.dateTime)}</span>
                </div>
              </div>
              {getStatusBadge(log.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
