"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ShieldCheck, Key, UserCheck, AlertTriangle } from "lucide-react";
import { getTrustStatus } from "@/lib/api";

export default function Navbar() {
  const [officer, setOfficer] = useState({ badge: "IO-0142", name: "Inspr. Rajesh Kumar", role: "Investigating Officer" });
  const [trustStatus, setTrustStatus] = useState<any>(null);

  useEffect(() => {
    // Check officer session or default
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("sakshya_officer");
        if (stored) {
          setOfficer(JSON.parse(stored));
        }
      }
    } catch (e) {}
    getTrustStatus().then(setTrustStatus).catch(() => {});
  }, []);

  return (
    <header className="h-16 border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Platform Emblem */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forensic-cyan to-blue-600 flex items-center justify-center shadow-lg shadow-forensic-cyan/20">
          <Shield className="w-6 h-6 text-obsidian-950 font-extrabold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-wider text-white">SAKSHYA <span className="text-forensic-cyan font-mono text-xs font-semibold px-2 py-0.5 rounded bg-forensic-cyan/10 border border-forensic-cyan/30">સાક્ષ્ય</span></h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">SIH26149</span>
          </div>
          <p className="text-xs text-slate-400">National Forensic Data Erasure & Carving Workspace</p>
        </div>
      </div>

      {/* Center Statutory Trust Badges */}
      <div className="hidden md:flex items-center gap-3 text-xs">
        <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">BSA 2023 Sec 63(4) Certified</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 flex items-center gap-2">
          <Key className="w-4 h-4 text-forensic-cyan" />
          <span className="text-slate-300">NIST SP 800-88 Rev. 1 Compliant</span>
        </div>
      </div>

      {/* Right Officer Badge & Trust Status */}
      <div className="flex items-center gap-4">
        {/* Hardware Trust Indicator */}
        <Link href="/settings/trust">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-emerald-500/30 hover:border-emerald-400 transition cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-300 font-medium hidden lg:inline">
              HW Trust: {trustStatus?.current_method || "STUB_HMAC_ED25519"}
            </span>
          </div>
        </Link>

        {/* Officer Badge Dropdown */}
        <Link href="/login">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-obsidian-850 border border-slate-700 hover:border-slate-500 transition cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 text-xs font-bold">
              {officer.badge.slice(0, 2)}
            </div>
            <div className="text-left text-xs">
              <div className="text-slate-200 font-semibold flex items-center gap-1">
                {officer.name}
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-slate-400 text-[10px] font-mono">{officer.badge} • {officer.role}</div>
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
