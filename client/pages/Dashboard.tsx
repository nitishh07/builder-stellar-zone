import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StudentTable } from "@/components/dashboard/StudentTable";
import { StudentDetailModal } from "@/components/dashboard/StudentDetailModal";
import { students } from "@/data/students";
import type { Student } from "@/data/students";
import { BellRing } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [selected, setSelected] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);

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
                <h1 className="text-lg font-semibold leading-tight">Mentor Dashboard</h1>
                <p className="text-sm text-muted-foreground">Identify and act on at-risk students quickly.</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <StudentTable
              data={students}
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
