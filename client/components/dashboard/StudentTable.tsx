import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download } from "lucide-react";
import { RiskBadge, RiskLevel } from "@/components/RiskBadge";
import type { Student } from "@/data/students";
import { classes } from "@/data/students";

export function StudentTable({ data, onRowClick }: { data: Student[]; onRowClick: (s: Student) => void }) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [sortKey, setSortKey] = useState<keyof Student | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let out = data.filter((s) =>
      `${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase()),
    );
    if (classFilter !== "All") out = out.filter((s) => s.class === classFilter);
    if (riskFilter !== "All") out = out.filter((s) => s.risk === riskFilter);
    if (sortKey) {
      out = [...out].sort((a, b) => {
        const av = a[sortKey] as any;
        const bv = b[sortKey] as any;
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return out;
  }, [data, query, classFilter, riskFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: keyof Student) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function exportCsv() {
    const headers = ["Name","ID","Class","Attendance %","Avg Score","Fee Status","Risk","Flags"];
    const rows = filtered.map((s) => [s.name, s.id, s.class, s.attendance, s.avgScore, s.feeStatus, s.risk, s.flags.join(";")]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_risk_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or ID"
            className="w-full sm:max-w-xs"
            aria-label="Search students"
          />
          <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setPage(1); }}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={(v) => { setRiskFilter(v as any); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {(["Low","Medium","High","Critical"] as RiskLevel[]).map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="mr-2 size-4" /> Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>Name <ChevronDown className="ml-1 inline size-3" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("id")}>ID <ChevronDown className="ml-1 inline size-3" /></TableHead>
            <TableHead>Class</TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("attendance")}>Attendance % <ChevronDown className="ml-1 inline size-3" /></TableHead>
            <TableHead className="cursor-pointer" onClick={() => toggleSort("avgScore")}>Avg Score <ChevronDown className="ml-1 inline size-3" /></TableHead>
            <TableHead>Fee Status</TableHead>
            <TableHead>Risk Category</TableHead>
            <TableHead>Flags</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((s) => (
            <TableRow key={s.id} className="cursor-pointer" onClick={() => onRowClick(s)}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell className="text-muted-foreground">{s.id}</TableCell>
              <TableCell>{s.class}</TableCell>
              <TableCell className={s.attendance < 60 ? "text-risk-high-foreground" : ""}>{s.attendance}%</TableCell>
              <TableCell>{s.avgScore}%</TableCell>
              <TableCell>
                <Badge variant={s.feeStatus === "Overdue" ? "destructive" : s.feeStatus === "Pending" ? "secondary" : "default"}>{s.feeStatus}</Badge>
              </TableCell>
              <TableCell><RiskBadge level={s.risk} /></TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {s.flags.map((f, i) => (
                    <Badge key={i} variant="secondary">{f}</Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
