import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { StudentDetailModal } from "@/components/dashboard/StudentDetailModal";
import { UploadAndReport } from "@/components/report/UploadAndReport";
import { BackendPredict } from "@/components/report/BackendPredict";
import { students } from "@/data/students";
import type { Student, FeeStatus } from "@/data/students";
import { BellRing } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const [selected, setSelected] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<any[] | null>(null);

  function toFeeStatus(remaining: number): FeeStatus {
    if (remaining <= 0) return "Paid";
    return "Overdue";
  }
  function toRisk(att: string, marks: string, fee: string) {
    const score = (r: string) => (r === "Red" ? 2 : r === "Orange" ? 1 : 0);
    const s = score(att) + score(marks) + score(fee);
    if (s >= 4) return "Critical" as const;
    if (s >= 2) return "High" as const;
    if (s === 1) return "Medium" as const;
    return "Low" as const;
  }

  const tableData: Student[] = useMemo(() => {
    if (!csvRows?.length) return students;
    return csvRows.map((r: any, i: number) => ({
      id: String(r.student_ID ?? `CSV${i}`),
      name: String(r.name ?? r.student_ID ?? `Student ${i + 1}`),
      class: String(r.class ?? "—"),
      attendance: Math.round(Number(r.Attendence_percentage ?? 0)),
      avgScore: Math.round(Number(r.marks_percentage ?? 0)),
      feeStatus: toFeeStatus(Number(r.fee_remaining ?? 0)),
      risk: toRisk(String(r.Attendance_risk ?? "Green"), String(r.Marks_risk ?? "Green"), String(r.fee_risk ?? "Green")),
      flags: [
        Number(r.Attendence_percentage ?? 100) < 60 ? "Low Attendance" : null,
        Number(r.marks_percentage ?? 100) < 50 ? "Low Score" : null,
        Number(r.fee_remaining ?? 0) > 0 ? "Fee Overdue" : null,
      ].filter(Boolean) as string[],
      contact: { email: "—", phone: "—", guardian: "—", guardianPhone: "—" },
      attendanceTrend: [],
      assessments: [],
    }));
  }, [csvRows]);

  const { user } = useAuth();
  const displayName = (user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User") as string;

  return (
    <AppShell>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="space-y-4">
          <Card className="p-4 shadow-sm">
            <div className="text-sm font-semibold">Filters</div>
            <Separator className="my-3" />
            <div className="space-y-3 text-sm">
              <div className="text-muted-foreground">Use the controls above the table to filter by Class, Risk, and search by name/ID.</div>
              <div className="rounded-md bg-muted/50 p-3 text-xs">Color legend: <span className="ml-2 rounded-sm bg-risk-low px-1 py-0.5">Low</span> <span className="ml-1 rounded-sm bg-risk-medium px-1 py-0.5">Medium</span> <span className="ml-1 rounded-sm bg-risk-high px-1 py-0.5">High</span> <span className="ml-1 rounded-sm bg-risk-critical px-1 py-0.5">Critical</span></div>
            </div>
          </Card>
          <Card className="p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><BellRing className="size-4"/> Notifications</div>
            <Separator className="my-3" />
            <ul className="space-y-2 text-sm">
              <li>3 new students moved to High Risk</li>
              <li>ETL: Last Data Sync: Sep 18, 2025</li>
            </ul>
            <Button variant="outline" className="mt-3 w-full">View all</Button>
          </Card>
        </aside>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-lg font-semibold leading-tight">Welcome, {displayName}</h1>
                <p className="text-sm text-muted-foreground">Identify and act on at-risk students quickly.</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <UploadAndReport onProcessed={setCsvRows} />
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold">Or fetch predictions from backend</div>
            <Separator className="my-3" />
            {/* Backend uploader */}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore next-line - component lives in report folder */}
            {/* Imported below */}
            <BackendPredict onProcessed={setCsvRows} />
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            {csvRows?.length ? (
              <div className="mb-2 text-xs text-muted-foreground">Showing processed CSV data ({csvRows.length} students)</div>
            ) : null}
            <StudentTable
              data={tableData}
              onRowClick={(s) => {
                setSelected(s);
                setOpen(true);
              }}
            />
          </div>
        </div>
      </section>
      <StudentDetailModal open={open} onOpenChange={setOpen} student={selected} />
    </AppShell>
  );
}
