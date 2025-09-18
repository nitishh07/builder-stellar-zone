import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RiskBadge } from "@/components/RiskBadge";
import type { Student } from "@/data/students";
import { Phone, CalendarCheck, CheckCircle, XCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { toast } from "sonner";

export function StudentDetailModal({ open, onOpenChange, student }: { open: boolean; onOpenChange: (v: boolean) => void; student: Student | null }) {
  if (!student) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{student.id} • Class {student.class}</div>
              <div className="mt-1 text-xl font-semibold leading-tight">{student.name}</div>
            </div>
            <RiskBadge level={student.risk} />
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium">Attendance trend</div>
            <ChartContainer config={{ attendance: { label: "Attendance", color: "hsl(var(--brand-500))" } }}>
              <LineChart data={student.attendanceTrend}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" hide tickLine axisLine />
                <YAxis domain={[0, 100]} hide tickLine axisLine />
                <Line type="monotone" dataKey="value" stroke="var(--color-attendance)" strokeWidth={2} dot={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              </LineChart>
            </ChartContainer>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium">Contact</div>
            <div className="space-y-1 text-sm">
              <div>Email: <span className="font-medium">{student.contact.email}</span></div>
              <div>Phone: <span className="font-medium">{student.contact.phone}</span></div>
              <div>Guardian: <span className="font-medium">{student.contact.guardian}</span></div>
              <div>Guardian Phone: <span className="font-medium">{student.contact.guardianPhone}</span></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => toast("Calling guardian (prototype)")}> <Phone className="mr-2 size-4"/> Call Guardian</Button>
              <Button variant="secondary" onClick={() => toast.success("Counselling scheduled (prototype)")}> <CalendarCheck className="mr-2 size-4"/> Schedule Counselling</Button>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 text-sm font-medium">Assessment history</div>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Score</th>
                </tr>
              </thead>
              <tbody>
                {student.assessments.map((a, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{a.date}</td>
                    <td className="px-3 py-2">{a.subject}</td>
                    <td className="px-3 py-2 font-mono">{a.score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium">Triggered risk flags</div>
            <div className="flex flex-wrap gap-2">
              {student.flags.length ? (
                student.flags.map((f, i) => <Badge key={i} variant="secondary">{f}</Badge>)
              ) : (
                <Badge variant="secondary">No flags</Badge>
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="mb-2 text-sm font-medium">Recommended actions</div>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>Call Guardian</li>
              <li>Schedule Counselling</li>
              <li>Share study plan and monitor weekly</li>
            </ul>
            <Separator className="my-3" />
            <div className="flex gap-2">
              <Button onClick={() => toast.success("Intervention marked done")}> <CheckCircle className="mr-2 size-4"/> Mark Intervention Done</Button>
              <Button variant="outline" onClick={() => toast("Marked as false positive")}> <XCircle className="mr-2 size-4"/> Mark as False Positive</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
