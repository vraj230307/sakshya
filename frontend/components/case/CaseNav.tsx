"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft, Trash2, HardDrive, FileText, History, Shield, CheckCircle2 } from "lucide-react";
import { getCase, Case } from "@/lib/api";

export default function CaseNav() {
  const params = useParams();
  const pathname = usePathname();
  const caseId = (params?.id as string) || "c1001-forensic-case-delhi";

  const [caseObj, setCaseObj] = useState<Case | null>(null);

  useEffect(() => {
    getCase(caseId)
      .then(setCaseObj)
      .catch(() => {});
  }, [caseId]);

  const navItems = [
    {
      label: "1. NIST SP 800-88 Sanitization",
      path: `/cases/${caseId}/sanitize`,
      activeMatch: "/sanitize",
      icon: Trash2,
      color: "text-red-400",
      activeBg: "bg-red-500/15 border-red-500/50 text-red-300",
    },
    {
      label: "2. Raw Sector Carving",
      path: `/cases/${caseId}/recover`,
      activeMatch: "/recover",
      icon: HardDrive,
      color: "text-forensic-cyan",
      activeBg: "bg-forensic-cyan/15 border-forensic-cyan/50 text-forensic-cyan",
    },
    {
      label: "3. BSA 2023 Sec 63(4) Certs",
      path: `/cases/${caseId}/certificates`,
      activeMatch: "/certificates",
      icon: FileText,
      color: "text-blue-400",
      activeBg: "bg-blue-500/15 border-blue-500/50 text-blue-300",
    },
    {
      label: "4. Hash Chain Timeline",
      path: `/cases/${caseId}/timeline`,
      activeMatch: "/timeline",
      icon: History,
      color: "text-emerald-400",
      activeBg: "bg-emerald-500/15 border-emerald-500/50 text-emerald-300",
    },
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Top Breadcrumb & Quick Case Meta Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-obsidian-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-2.5 py-1.5 rounded-lg bg-obsidian-800 border border-slate-700 hover:border-forensic-cyan text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-forensic-cyan" />
            <span>Case Registry</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
              <span>{caseObj?.fir_number || "FIR-2026/0491-CYBER"}</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-forensic-cyan/10 border border-forensic-cyan/30 text-forensic-cyan">
                {caseId}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
              {caseObj?.case_type || "Financial Cyber Fraud & Data Theft"} • Assigned to: {caseObj?.officer_id || "IO-0142"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>BSA 63(4) ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Case Sub-Navigation Tab Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.includes(item.activeMatch);

          return (
            <Link key={item.path} href={item.path} className="block">
              <div
                className={`p-3 rounded-xl border font-mono text-xs font-bold transition flex items-center gap-2.5 ${
                  isActive
                    ? item.activeBg + " shadow-md shadow-black/40"
                    : "bg-obsidian-850/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-obsidian-950/80 border border-current" : "bg-obsidian-900 border border-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">{item.label}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
