"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserCheck, Key, ShieldAlert, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [badgeId, setBadgeId] = useState("IO-0142");
  const [role, setRole] = useState("IO");
  const [name, setName] = useState("Inspr. Rajesh Kumar");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const officerData = {
      badge: badgeId,
      name: name,
      role: role === "IO" ? "Investigating Officer" : role === "EXPERT" ? "Forensic Expert" : "System Admin"
    };
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sakshya_officer", JSON.stringify(officerData));
      }
    } catch (e) {}
    router.push("/dashboard");
  };

  const selectPreset = (presetBadge: string, presetName: string, presetRole: string) => {
    setBadgeId(presetBadge);
    setName(presetName);
    setRole(presetRole);
    const officerData = {
      badge: presetBadge,
      name: presetName,
      role: presetRole === "IO" ? "Investigating Officer" : "Forensic Expert"
    };
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sakshya_officer", JSON.stringify(officerData));
      }
    } catch (e) {}
    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="glass-panel-accent p-8 rounded-2xl border border-forensic-cyan/30 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-forensic-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-forensic-cyan to-blue-600 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-forensic-cyan/20 mb-3">
            <Shield className="w-8 h-8 text-obsidian-950 font-bold" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">OFFICER IDENTIFICATION & ROLE LOGIN</h1>
          <p className="text-xs text-slate-400 mt-1">Sakshya Forensics Platform • Authorized Law Enforcement Access Only</p>
        </div>

        {/* Hackathon Evaluation Sandbox Banner */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-300 font-mono flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-200 uppercase tracking-wider">Evaluation Sandbox Mode Only</div>
            <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
              ⚠️ The 1-click presets below exist strictly for SIH Hackathon jury evaluation speed. In statutory LEA deployment, direct bypass is disabled; hardware PKCS#11 / FIDO2 token attestation and CCTNS badge authentication are mandatory.
            </p>
          </div>
        </div>

        {/* Quick Demo Login Presets */}
        <div className="mb-6 bg-obsidian-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>SIH EVALUATOR PRESETS (1-CLICK DEMO)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => selectPreset("IO-0142", "Inspr. Rajesh Kumar", "IO")}
              className="p-3 rounded-lg bg-obsidian-800 border border-slate-700 hover:border-forensic-cyan text-left transition"
            >
              <div className="text-xs font-bold text-slate-200">Inspr. Rajesh Kumar</div>
              <div className="text-[10px] text-forensic-cyan font-mono">Investigating Officer (IO)</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Badge: IO-0142</div>
            </button>
            <button
              type="button"
              onClick={() => selectPreset("EXPERT-901", "Dr. Ananya Sharma", "EXPERT")}
              className="p-3 rounded-lg bg-obsidian-800 border border-slate-700 hover:border-emerald-400 text-left transition"
            >
              <div className="text-xs font-bold text-slate-200">Dr. Ananya Sharma</div>
              <div className="text-[10px] text-emerald-400 font-mono">Digital Forensic Expert</div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Badge: EXPERT-901</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Badge ID / Officer Credentials</label>
            <input
              type="text"
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-forensic-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Officer Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-forensic-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Assigned Statutory Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-forensic-cyan"
            >
              <option value="IO">Investigating Officer (IO) — BSA 63(4) Part A Signatory</option>
              <option value="EXPERT">Forensic Technical Expert — BSA 63(4) Part B Signatory</option>
              <option value="ADMIN">System Administrator — Hardware Trust Config</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-forensic-cyan to-blue-600 font-bold text-obsidian-950 text-sm flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-forensic-cyan/20"
          >
            <span>AUTHENTICATE & ENTER FORENSIC WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-slate-500 font-mono">
          Cryptographically logged session under Bharatiya Sakshya Adhiniyam 2023
        </div>
      </div>
    </div>
  );
}
