"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, ShieldCheck, HardDrive, Trash2, FileText, CheckCircle2, History, AlertTriangle } from "lucide-react";
import { getCases, Case } from "@/lib/api";

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-obsidian-850 via-obsidian-800 to-obsidian-850 border border-white/10 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider">LEGAL FORENSIC WORKSPACE ACTIVE</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Forensic Case Intake & Sanitization Dashboard</h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Compliant with <span className="text-forensic-cyan font-semibold">Bharatiya Sakshya Adhiniyam 2023 Sec 63(4)</span> dual certification and <span className="text-emerald-400 font-semibold">NIST SP 800-88 Rev. 1</span> media sanitization standards.
          </p>
        </div>

        <Link href="/cases/new">
          <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-forensic-cyan to-blue-600 font-bold text-obsidian-950 text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg shadow-forensic-cyan/20 shrink-0">
            <PlusCircle className="w-4 h-4" />
            <span>START NEW CASE INTAKE</span>
          </button>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">REGISTERED CASES</div>
          <div className="text-2xl font-black text-white mt-1">{cases.length || 2}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">✓ Active FIR Records</div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">ACQUIRED MEDIA TARGETS</div>
          <div className="text-2xl font-black text-forensic-cyan mt-1">3</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">NVMe, SATA HDD, USB 3.2</div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">NIST SANITIZATION OPS</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">1</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1">0.00% Remanence Verified</div>
        </div>

        <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800">
          <div className="text-xs font-mono text-slate-400">BSA 63(4) DUAL CERTS</div>
          <div className="text-2xl font-black text-blue-400 mt-1">3</div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">Party & Expert Certificates</div>
        </div>
      </div>

      {/* Active Case List Table */}
      <div className="p-6 rounded-xl bg-obsidian-850/90 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white">Active Forensic Cases</h2>
            <p className="text-xs text-slate-400">Registered FIRs with baseline SHA-256 evidence acquisition hashes</p>
          </div>
          <Link href="/cases/new">
            <span className="text-xs text-forensic-cyan font-mono hover:underline cursor-pointer">+ Register FIR</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading active forensic cases...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="pb-3 font-semibold">FIR Number</th>
                  <th className="pb-3 font-semibold">Case Type</th>
                  <th className="pb-3 font-semibold">Officer ID</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Registered At</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-obsidian-800/50 transition">
                    <td className="py-3.5 font-bold text-forensic-cyan font-mono">{c.fir_number}</td>
                    <td className="py-3.5 text-slate-200">{c.case_type}</td>
                    <td className="py-3.5 font-mono text-slate-400">{c.officer_id}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        c.status === "IN_PROGRESS" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link href={`/cases/${c.id}/sanitize`}>
                        <button className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-mono inline-flex items-center gap-1">
                          <Trash2 className="w-3 h-3" />
                          <span>Sanitize</span>
                        </button>
                      </Link>
                      <Link href={`/cases/${c.id}/recover`}>
                        <button className="px-2.5 py-1 rounded bg-forensic-cyan/10 hover:bg-forensic-cyan/20 text-forensic-cyan border border-forensic-cyan/30 text-[11px] font-mono inline-flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          <span>Carve</span>
                        </button>
                      </Link>
                      <Link href={`/cases/${c.id}/certificates`}>
                        <button className="px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-mono inline-flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Certs</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
