import type { RiskLevel } from "@/components/RiskBadge";

export type FeeStatus = "Paid" | "Overdue" | "Pending";

export type Student = {
  id: string;
  name: string;
  class: string;
  attendance: number; // percentage
  avgScore: number; // percentage
  feeStatus: FeeStatus;
  risk: RiskLevel;
  flags: string[];
  contact: { email: string; phone: string; guardian: string; guardianPhone: string };
  attendanceTrend: { date: string; value: number }[];
  assessments: { date: string; subject: string; score: number }[];
};

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function randomTrend(start: number) {
  const out: { date: string; value: number }[] = [];
  let cur = start;
  const today = new Date();
  for (let i = 12; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(today.getMonth() - i);
    cur = Math.max(20, Math.min(100, cur + (Math.random() * 10 - 5)));
    out.push({ date: d.toISOString().slice(0, 10), value: Math.round(cur) });
  }
  return out;
}

const RISK_FLAGS: Record<RiskLevel, string[]> = {
  Low: [],
  Medium: ["Low Attendance"],
  High: ["Low Attendance", "Low Score"],
  Critical: ["Low Attendance", "Low Score", "Fee Overdue"],
};

const CLASSES = ["10-A", "10-B", "11-A", "11-B", "12-A", "12-B"];

export const students: Student[] = range(48).map((i) => {
  const attendance = Math.round(50 + Math.random() * 50);
  const avgScore = Math.round(45 + Math.random() * 55);
  const feeStatus: FeeStatus = Math.random() < 0.7 ? "Paid" : Math.random() < 0.5 ? "Pending" : "Overdue";
  const riskValue = attendance < 60 || avgScore < 55 || feeStatus === "Overdue" ? (attendance < 50 || avgScore < 50 || feeStatus === "Overdue" ? "High" : "Medium") : "Low";
  const critical = attendance < 40 || (avgScore < 45 && feeStatus === "Overdue");
  const risk: RiskLevel = critical ? "Critical" : (riskValue as RiskLevel);
  return {
    id: `S${1000 + i}`,
    name: `Student ${i + 1}`,
    class: CLASSES[i % CLASSES.length],
    attendance,
    avgScore,
    feeStatus,
    risk,
    flags: RISK_FLAGS[risk],
    contact: {
      email: `student${i + 1}@school.edu`,
      phone: `+1-555-010${(i % 10).toString().padStart(2, "0")}`,
      guardian: `Guardian ${i + 1}`,
      guardianPhone: `+1-555-020${(i % 10).toString().padStart(2, "0")}`,
    },
    attendanceTrend: randomTrend(attendance),
    assessments: range(6).map((j) => ({
      date: new Date(Date.now() - j * 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      subject: ["Math", "Science", "English", "History"][j % 4],
      score: Math.round(40 + Math.random() * 60),
    })),
  };
});

export const classes = CLASSES;
