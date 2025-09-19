import { useState } from "react";
import Papa from "papaparse";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type CsvRow = Record<string, string | number | null | undefined>;

function canonical(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[_\-]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

type FindKeyOpts = { excludes?: string[] };
function findKey(
  obj: Record<string, any>,
  candidates: string[],
  opts: FindKeyOpts = {},
): string | null {
  const keys = Object.keys(obj);
  const canonMap = new Map(keys.map((k) => [canonical(k), k] as const));
  const excludes = new Set((opts.excludes || []).map(canonical));
  // 1) exact canonical match only
  for (const c of candidates) {
    const can = canonical(c);
    if (excludes.has(can)) continue;
    const exact = canonMap.get(can);
    if (exact) return exact;
  }
  // 2) fallback: startsWith (not generic contains), avoid excluded
  for (const c of candidates) {
    const can = canonical(c);
    for (const k of keys) {
      const kc = canonical(k);
      if (excludes.has(kc)) continue;
      if (kc.startsWith(can)) return k;
    }
  }
  return null;
}

function normId(v: any): string {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseNumber(v: any): number {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.\-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function kmeans1D(
  values: number[],
  k = 3,
): { centers: number[]; labels: number[] } {
  if (values.length === 0) return { centers: [], labels: [] };
  const sorted = [...values].sort((a, b) => a - b);
  const centers = Array.from(
    { length: k },
    (_, i) => sorted[Math.floor(((i + 1) / (k + 1)) * (sorted.length - 1))],
  );
  const labels = new Array(values.length).fill(0);
  for (let iter = 0; iter < 100; iter++) {
    let changed = false;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      let best = 0;
      let bestDist = Math.abs(v - centers[0]);
      for (let c = 1; c < k; c++) {
        const d = Math.abs(v - centers[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }
    const sums = new Array(k).fill(0);
    const counts = new Array(k).fill(0);
    for (let i = 0; i < values.length; i++) {
      sums[labels[i]] += values[i];
      counts[labels[i]]++;
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) centers[c] = sums[c] / counts[c];
    }
    if (!changed) break;
  }
  return { centers, labels };
}

export function UploadAndReport({
  onProcessed,
}: {
  onProcessed?: (rows: any[]) => void;
}) {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [feeFile, setFeeFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[] | null>(null);

  async function readCsv(file: File): Promise<CsvRow[]> {
    const text = await file.text();
    const res = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    if (res.errors && res.errors.length) {
      console.warn("CSV parse warnings:", res.errors);
    }
    return res.data as CsvRow[];
  }

  async function process() {
    if (!attendanceFile || !marksFile || !feeFile) {
      toast.error(
        "Please upload all three CSV files: attendance, marks, and fees.",
      );
      return;
    }
    try {
      const [att, marks, fees] = await Promise.all([
        readCsv(attendanceFile),
        readCsv(marksFile),
        readCsv(feeFile),
      ]);

      if (!att.length || !marks.length || !fees.length) {
        toast.error("One or more CSV files are empty.");
        return;
      }

      const attKeys = {
        id: findKey(att[0], [
          "student_ID",
          "student id",
          "studentid",
          "student_id",
          "id",
        ])!,
        attended: findKey(att[0], [
          "Class_attended",
          "classes_attended",
          "attended",
          "present",
          "classespresent",
        ]) || null,
        total: findKey(att[0], [
          "Total_classes",
          "total_classes",
          "total",
          "classes",
          "maxclasses",
        ]) || null,
        percent: findKey(att[0], [
          "attendance_percentage",
          "attendance%",
          "attendancepercent",
          "attendance_pct",
        ]) || null,
        name:
          findKey(att[0], ["name", "student_name", "studentname"]) || undefined,
        klass:
          findKey(att[0], ["class", "section", "std", "grade"], {
            excludes: [
              "totalclasses",
              "classes",
              "classattended",
              "classesattended",
              "classtotal",
              "totalclass",
            ],
          }) || undefined,
      } as const;
      const marksKeys = {
        id: findKey(marks[0], [
          "student_ID",
          "student id",
          "studentid",
          "student_id",
          "id",
        ])!,
        obtained: findKey(marks[0], [
          "marks_obtained",
          "marks",
          "obtained",
          "score",
          "scored",
        ]) || null,
        total: findKey(marks[0], ["total_marks", "total", "max", "maxmarks"]) || null,
        percent: findKey(marks[0], [
          "marks_percentage",
          "percentage",
          "score_percent",
        ]) || null,
        name:
          findKey(marks[0], ["name", "student_name", "studentname"]) ||
          undefined,
        klass:
          findKey(marks[0], ["class", "section", "std", "grade"], {
            excludes: [
              "totalclasses",
              "classes",
              "classattended",
              "classesattended",
              "classtotal",
              "totalclass",
            ],
          }) || undefined,
      } as const;
      const feeKeys = {
        id: findKey(fees[0], [
          "student_ID",
          "student id",
          "studentid",
          "student_id",
          "id",
        ])!,
        total: findKey(fees[0], ["total_fee", "feetotal", "total"]) || null,
        paid: findKey(fees[0], ["fee_paid", "feepaid", "paid", "amount_paid"]) || null,
        status: findKey(fees[0], ["fee_status", "payment_status", "status", "fees_status"]) || null,
        name:
          findKey(fees[0], ["name", "student_name", "studentname"]) ||
          undefined,
        klass:
          findKey(fees[0], ["class", "section", "std", "grade"], {
            excludes: [
              "totalclasses",
              "classes",
              "classattended",
              "classesattended",
              "classtotal",
              "totalclass",
            ],
          }) || undefined,
      } as const;

      if (!attKeys.id || !marksKeys.id || !feeKeys.id) {
        toast.error("Could not detect student ID column in one of the files.");
        return;
      }

      const attendenceMap = new Map<
        string,
        { Attendence_percentage: number }
      >();
      const nameMap = new Map<string, string>();
      const classMap = new Map<string, string>();
      for (const r of att) {
        const id = normId(r[attKeys.id]);
        if (!id) continue;
        let pct = 0;
        if (attKeys.percent && r[attKeys.percent] != null) {
          pct = parseNumber(r[attKeys.percent]);
        } else if (attKeys.attended && attKeys.total) {
          const attended = parseNumber(r[attKeys.attended]);
          const total = parseNumber(r[attKeys.total]);
          pct = (attended / (total || 1)) * 100;
        }
        attendenceMap.set(id, { Attendence_percentage: pct });
        if (attKeys.name && r[attKeys.name] != null)
          nameMap.set(id, String(r[attKeys.name]));
        if (attKeys.klass && r[attKeys.klass] != null)
          classMap.set(id, String(r[attKeys.klass]));
      }

      const marksMap = new Map<string, { marks_percentage: number }>();
      for (const r of marks) {
        const id = normId(r[marksKeys.id]);
        if (!id) continue;
        let pct = 0;
        if (marksKeys.percent && r[marksKeys.percent] != null) {
          pct = parseNumber(r[marksKeys.percent]);
        } else if (marksKeys.obtained && marksKeys.total) {
          const obtained = parseNumber(r[marksKeys.obtained]);
          const total = parseNumber(r[marksKeys.total]);
          pct = (obtained / (total || 1)) * 100;
        }
        marksMap.set(id, { marks_percentage: pct });
        if (marksKeys.name && r[marksKeys.name] != null && !nameMap.has(id))
          nameMap.set(id, String(r[marksKeys.name]));
        if (marksKeys.klass && r[marksKeys.klass] != null && !classMap.has(id))
          classMap.set(id, String(r[marksKeys.klass]));
      }

      const feeMap = new Map<string, { fee_remaining: number }>();
      for (const r of fees) {
        const id = normId(r[feeKeys.id]);
        if (!id) continue;
        let remaining = 0;
        if (feeKeys.total && feeKeys.paid && (r[feeKeys.total] != null || r[feeKeys.paid] != null)) {
          const total = parseNumber(r[feeKeys.total]);
          const paid = parseNumber(r[feeKeys.paid]);
          remaining = total - paid;
        } else if (feeKeys.status && r[feeKeys.status] != null) {
          const s = String(r[feeKeys.status]).toLowerCase();
          if (/(unpaid|pending|overdue|partial|due|late|0)/.test(s)) remaining = 1; else remaining = 0;
        }
        feeMap.set(id, { fee_remaining: remaining });
        if (feeKeys.name && r[feeKeys.name] != null && !nameMap.has(id))
          nameMap.set(id, String(r[feeKeys.name]));
        if (feeKeys.klass && r[feeKeys.klass] != null && !classMap.has(id))
          classMap.set(id, String(r[feeKeys.klass]));
      }

      const allIds = new Set<string>([
        ...Array.from(attendenceMap.keys()),
        ...Array.from(marksMap.keys()),
        ...Array.from(feeMap.keys()),
      ]);

      const merged: any[] = [];
      for (const id of allIds) {
        const a = attendenceMap.get(id);
        const m = marksMap.get(id);
        const f = feeMap.get(id);
        if (!a && !m && !f) continue;
        merged.push({
          student_ID: id,
          name: nameMap.get(id) ?? null,
          class: classMap.get(id) ?? null,
          Attendence_percentage: a?.Attendence_percentage ?? 0,
          marks_percentage: m?.marks_percentage ?? 0,
          fee_remaining: f?.fee_remaining ?? 0,
        });
      }

      const feesVals = merged.map((r) => r.fee_remaining);
      const { labels } = kmeans1D(feesVals, 3);
      const clusterMeans = [0, 1, 2]
        .map((c) => {
          const vals = merged
            .filter((_, i) => labels[i] === c)
            .map((r) => r.fee_remaining);
          const mean = vals.length
            ? vals.reduce((s, v) => s + v, 0) / vals.length
            : 0;
          return { c, mean };
        })
        .sort((a, b) => a.mean - b.mean);
      const order = clusterMeans.map((x) => x.c);
      const clusterMapping: Record<number, "Green" | "Orange" | "Red"> = {
        [order[0]]: "Green",
        [order[1]]: "Orange",
        [order[2]]: "Red",
      } as const;

      function attendanceRisk(x: number) {
        if (x < 50) return "Red";
        if (x < 75 && x > 50) return "Orange";
        return "Green";
      }
      function marksRisk(x: number) {
        if (x < 40) return "Red";
        if (x < 75 && x > 40) return "Orange";
        return "Green";
      }

      for (let i = 0; i < merged.length; i++) {
        const r = merged[i];
        r.fee_cluster = labels[i] ?? 0;
        r.fee_risk = clusterMapping[r.fee_cluster];
        r.Attendance_risk = attendanceRisk(r.Attendence_percentage);
        r.Marks_risk = marksRisk(r.marks_percentage);
      }

      setRows(merged);
      onProcessed?.(merged);
      toast.success(
        `Processed ${merged.length} students. You can download the Excel file now.`,
      );
    } catch (e: any) {
      console.error(e);
      toast.error(
        "Failed to process files. Ensure CSV headers match expected format.",
      );
    }
  }

  async function downloadExcel() {
    if (!rows || !rows.length) {
      toast("Please process files first.");
      return;
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("report");

    const headers = [
      "student_ID",
      "name",
      "class",
      "Attendence_percentage",
      "marks_percentage",
      "fee_remaining",
      "fee_cluster",
      "fee_risk",
      "Attendance_risk",
      "Marks_risk",
    ];
    ws.addRow(headers);
    for (const r of rows) {
      ws.addRow(headers.map((h) => (r as any)[h]));
    }

    const colorMap: Record<string, string> = {
      Red: "FF9999",
      Orange: "FFD580",
      Green: "99FF99",
    };

    const headerRow = ws.getRow(1);
    const feeRiskCol = headerRow.values?.indexOf("fee_risk") || 0;
    const attRiskCol = headerRow.values?.indexOf("Attendance_risk") || 0;
    const marksRiskCol = headerRow.values?.indexOf("Marks_risk") || 0;

    for (let row = 2; row <= ws.rowCount; row++) {
      for (const col of [feeRiskCol, attRiskCol, marksRiskCol]) {
        if (!col) continue;
        const cell = ws.getCell(row, col);
        const c = colorMap[String(cell.value ?? "")];
        if (c) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: c },
          } as any;
        }
      }
    }

    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_risk.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Colored Excel saved as student_risk.xlsx");
  }

  return (
    <Card className="p-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold">
        Upload and Generate Report
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Upload attendance.csv, marks.csv, and fees.csv to generate a combined,
        color-coded Excel report.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="attendance">Attendance CSV</Label>
          <Input
            id="attendance"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setAttendanceFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marks">Marks CSV</Label>
          <Input
            id="marks"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setMarksFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fees">Fees CSV</Label>
          <Input
            id="fees"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFeeFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap gap-2">
        <Button onClick={process}>Process Files</Button>
        <Button
          variant="outline"
          onClick={downloadExcel}
          disabled={!rows?.length}
        >
          Download Excel
        </Button>
      </div>
      {rows?.length ? (
        <div className="mt-3 text-xs text-muted-foreground">
          Processed {rows.length} rows. Columns: student_ID, name, class,
          Attendence_percentage, marks_percentage, fee_remaining, fee_cluster,
          fee_risk, Attendance_risk, Marks_risk
        </div>
      ) : null}
    </Card>
  );
}
