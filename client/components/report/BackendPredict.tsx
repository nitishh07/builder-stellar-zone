import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getBackendUrl } from "@/lib/backend";

function parseNumber(v: any): number {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function attendanceRisk(x: number) {
  if (x < 50) return "Red" as const;
  if (x < 75 && x > 50) return "Orange" as const;
  return "Green" as const;
}
function marksRisk(x: number) {
  if (x < 40) return "Red" as const;
  if (x < 75 && x > 40) return "Orange" as const;
  return "Green" as const;
}

function normalizeRows(data: any[]): any[] {
  // Flatten common wrappers
  const rows = Array.isArray((data as any).result)
    ? (data as any).result
    : Array.isArray((data as any).students)
      ? (data as any).students
      : Array.isArray(data)
        ? data
        : [];

  const out = rows.map((r: any) => {
    const total = parseNumber(r.total_fee ?? r.fee_total ?? r.total);
    const paid = parseNumber(r.fee_paid ?? r.paid ?? r.amount_paid);
    const remainingRaw = r.fee_remaining ?? r.remaining ?? r.balance ?? (total || paid ? total - paid : 0);
    const attendancePct = parseNumber(
      r.attendance_percentage ?? r.Attendence_percentage ?? r.attendance ?? r.attendance_pct ?? r.att_pct,
    );
    const marksPct = parseNumber(
      r.marks_percentage ?? r.average ?? r.avg ?? r.score_pct ?? r.marks ?? r.score,
    );

    return {
      student_ID: String(
        r.student_id ?? r.studentID ?? r.id ?? r.student ?? r.roll_no ?? r.roll ?? r.ID ?? "",
      ),
      name: String(r.name ?? r.student_name ?? r.full_name ?? "—"),
      class: String(r.class ?? r.section ?? r.grade ?? "—"),
      Attendence_percentage: attendancePct,
      marks_percentage: marksPct,
      fee_remaining: parseNumber(remainingRaw),
      Attendance_risk: r.Attendance_risk ?? attendanceRisk(attendancePct),
      Marks_risk: r.Marks_risk ?? marksRisk(marksPct),
      fee_risk: r.fee_risk ?? "Green",
    };
  });

  // Derive fee_risk bands by relative remaining amount
  const feeMax = Math.max(0, ...out.map((x) => x.fee_remaining || 0));
  if (feeMax > 0) {
    out.forEach((x) => {
      const ratio = (x.fee_remaining || 0) / feeMax;
      x.fee_risk = ratio > 0.6 ? "Red" : ratio > 0.25 ? "Orange" : "Green";
    });
  }

  return out;
}

export function BackendPredict({ onProcessed }: { onProcessed?: (rows: any[]) => void }) {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  const [feesFile, setFeesFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);

  async function sendToBackend() {
    if (!attendanceFile || !gradesFile || !feesFile) {
      toast.error("Please choose all three CSV files: attendance, grades, and fees.");
      return;
    }
    setLoading(true);
    setPreview(null);
    try {
      const url = `${getBackendUrl()}/predict`;
      const fd = new FormData();
      // Append using several common field names for compatibility
      fd.append("attendance", attendanceFile);
      fd.append("grades", gradesFile);
      fd.append("fees", feesFile);
      fd.append("attendance_file", attendanceFile);
      fd.append("grades_file", gradesFile);
      fd.append("fees_file", feesFile);
      fd.append("attendanceFile", attendanceFile);
      fd.append("gradesFile", gradesFile);
      fd.append("feesFile", feesFile);
      const res = await fetch(url, { method: "POST", body: fd });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error (${res.status}): ${text}`);
      }
      const json = await res.json();
      setPreview(json);
      const rows = normalizeRows(json);
      if (!rows.length) {
        toast("Received response, but no rows to display.");
      } else {
        onProcessed?.(rows);
        toast.success(`Loaded ${rows.length} rows from backend.`);
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold">Predict via Backend (Render)</div>
      <p className="mb-3 text-sm text-muted-foreground">
        Upload the three CSVs (attendance, grades, fees) and send them to your Render backend /predict endpoint.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="att-file">Attendance CSV</Label>
          <Input id="att-file" type="file" accept=".csv,text/csv" onChange={(e) => setAttendanceFile(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grades-file">Grades CSV</Label>
          <Input id="grades-file" type="file" accept=".csv,text/csv" onChange={(e) => setGradesFile(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees-file">Fees CSV</Label>
          <Input id="fees-file" type="file" accept=".csv,text/csv" onChange={(e) => setFeesFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button onClick={sendToBackend} disabled={loading}>
          {loading ? "Sending..." : "Send to /predict"}
        </Button>
      </div>
      <Separator className="my-4" />
      {preview ? (
        <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(preview, null, 2)}</pre>
      ) : null}
    </Card>
  );
}
