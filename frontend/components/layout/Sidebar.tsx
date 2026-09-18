"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Trash2, HardDrive, FileText, History, KeyRound } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Extract case ID if currently inside /cases/[id]
  const caseMatch = pathname.match(/\/cases\/([^\/]+)/);
  const currentCaseId = caseMatch && caseMatch[1] !== "new" ? caseMatch[1] : "c1001-forensic-case-delhi";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "New Case Intake", href: "/cases/new", icon: PlusCircle, highlight: true },
    { label: "Data Sanitization", href: `/cases/${currentCaseId}/sanitize`, icon: Trash2 },
    { label: "Carving Studio", href: `/cases/${currentCaseId}/recover`, icon: HardDrive },
    { label: "BSA 63(4) Certificates", href: `/cases/${currentCaseId}/certificates`, icon: FileText },
    { label: "Audit Timeline", href: `/cases/${currentCaseId}/timeline`, icon: History },
    { label: "Trust & Signing", href: "/settings/trust", icon: KeyRound },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-obsidian-950 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Forensic Workflow
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes('/cases/') && pathname.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? "bg-forensic-cyan/10 text-forensic-cyan border border-forensic-cyan/30 shadow-md shadow-forensic-cyan/10"
                        : item.highlight
                        ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-obsidian-850"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-forensic-cyan" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Active Case Context Panel */}
        <div className="p-3 rounded-lg bg-obsidian-850/80 border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono">ACTIVE CASE SCOPE</div>
          <div className="text-xs font-bold text-slate-200 truncate mt-1">FIR-2026/0491-CYBER</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">STATUS: IN_PROGRESS</div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
        <p>Sakshya Forensics v2.4</p>
        <p className="font-mono text-[10px]">NTRO SIH26149 Compliance</p>
      </div>
    </aside>
  );
}
