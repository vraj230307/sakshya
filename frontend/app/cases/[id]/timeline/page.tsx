"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { History, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, Lock, ArrowDown } from "lucide-react";
import { getCaseTimeline, verifyCaseTimeline, AuditEvent } from "@/lib/api";

export default function TimelinePage() {
  const params = useParams();
  const caseId = (params?.id as string) || "c1001-forensic-case-delhi";

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = () => {
    setLoading(true);
    Promise.all([getCaseTimeline(caseId), verifyCaseTimeline(caseId)])
      .then(([evts, ver]) => {
        setEvents(evts);
        setVerification(ver);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, [caseId]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-forensic-cyan/20 text-forensic-cyan border border-forensic-cyan/30">
              TAMPER-EVIDENT AUDIT TRAIL
            </span>
            <span className="text-xs font-mono text-slate-400">Case ID: {caseId}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Cryptographic Audit Chain & Legal Narrative</h1>
        </div>

        <button
          onClick={fetchTimeline}
          className="px-4 py-2 rounded-xl bg-obsidian-850 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 hover:border-forensic-cyan transition"
        >
          <RefreshCw className="w-4 h-4 text-forensic-cyan" />
          <span>Re-Verify Hash Chain</span>
        </button>
      </div>

      {/* Cryptographic Chain Integrity Verification Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        verification?.is_valid
          ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
          : "bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/10"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            verification?.is_valid ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}>
            {verification?.is_valid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-sm font-bold text-white font-mono">
              CRYPTOGRAPHIC CHAIN INTEGRITY: {verification?.status || "VERIFIED_INTACT"}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {verification?.is_valid
                ? `All ${verification?.event_count || events.length} audit events verified against SHA-256 genesis anchor. Zero hash drift detected.`
                : "WARNING: Hash chain drift detected! Unauthorized event alteration suspected."}
            </p>
          </div>
        </div>

        <div className="text-right font-mono text-xs hidden md:block">
          <div className="text-slate-500">LATEST TIP HASH</div>
          <div className="text-forensic-cyan font-bold">{verification?.latest_hash ? `${verification.latest_hash.slice(0, 16)}...` : "GENESIS"}</div>
        </div>
      </div>

      {/* Human-Readable Vertical Timeline */}
      <div className="p-6 rounded-2xl bg-obsidian-850 border border-slate-800 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-forensic-cyan" />
          <span>Sequential Narrative of Investigatory Actions</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-mono">Verifying SHA-256 hash signatures...</div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">No audit events recorded for this case yet.</div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {events.map((evt, idx) => (
              <div key={evt.id} className="relative group">
                {/* Timeline Dot Node */}
                <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-obsidian-900 border-2 border-forensic-cyan shadow-md shadow-forensic-cyan/20 group-hover:scale-125 transition"></div>

                <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-forensic-cyan px-2 py-0.5 rounded bg-forensic-cyan/10 border border-forensic-cyan/30">
                      {evt.event_type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {evt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Actor ID:</span> <span className="text-slate-300">{evt.actor_id || "SYSTEM"}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-500">This Hash:</span> <span className="text-emerald-400">{evt.this_hash.slice(0, 16)}...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
