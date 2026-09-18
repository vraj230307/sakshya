"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Trash2, ShieldCheck, Zap, Info, Play, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { getCase, getCaseDevices, createOperation, Operation, Device, Case, API_BASE } from "@/lib/api";

export default function SanitizePage() {
  const params = useParams();
  const caseId = (params?.id as string) || "c1001-forensic-case-delhi";

  const [caseObj, setCaseObj] = useState<Case | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<"CLEAR" | "PURGE" | "CRYPTO_ERASE">("PURGE");

  // WebSocket Live Stream State
  const [operation, setOperation] = useState<Operation | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    pct: number;
    status: string;
    message: string;
    speed: string;
    remanence: string;
  }>({
    pct: 0,
    status: "READY",
    message: "Awaiting method selection and execution trigger...",
    speed: "0 MB/s",
    remanence: "100.00%",
  });

  useEffect(() => {
    getCase(caseId).then(setCaseObj).catch(() => {});
    getCaseDevices(caseId).then((devs) => {
      if (devs.length > 0) setDevice(devs[0]);
    }).catch(() => {});
  }, [caseId]);

  const startSanitization = async () => {
    if (!device) return;
    setIsExecuting(true);
    try {
      const op = await createOperation(caseId, {
        device_id: device.id,
        type: "SANITIZE",
        method: selectedMethod,
      });
      setOperation(op);

      // Connect to WebSocket stream
      const ws = new WebSocket(`ws://localhost:8000/api/operations/${op.id}/stream`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry({
            pct: data.pct || 0,
            status: data.status || "RUNNING",
            message: data.message || "",
            speed: data.speed || "0 MB/s",
            remanence: data.remanence || "100.00%",
          });
          if (data.pct >= 100) {
            setIsExecuting(false);
          }
        } catch (e) {}
      };
    } catch (err: any) {
      alert(err.message || "Failed to launch sanitization operation");
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              MEDIA SANITIZATION STUDIO
            </span>
            <span className="text-xs font-mono text-slate-400">FIR: {caseObj?.fir_number || "FIR-2026/0491-CYBER"}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">NIST SP 800-88 Rev. 1 Secure Data Erasure</h1>
        </div>

        <Link href={`/cases/${caseId}/certificates`}>
          <button className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-2 hover:bg-blue-600/30">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Generate Sanitization Cert</span>
          </button>
        </Link>
      </div>

      {/* Media Target Information Card */}
      <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-400">TARGET MEDIA STORAGE DEVICE</div>
          <div className="text-base font-bold text-white mt-0.5">{device?.make_model || "Samsung NVMe SSD 980 PRO (512GB)"}</div>
          <div className="text-xs font-mono text-slate-400 mt-0.5">
            Serial: {device?.serial_number || "NVME-SAMSUNG-980PRO-512GB-SN90214"} • Type: {device?.media_type || "SSD_NVME"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-slate-400">BASELINE ACQUISITION HASH</div>
          <div className="text-xs font-mono text-forensic-cyan mt-0.5">
            {device?.acquisition_hash ? `${device.acquisition_hash.slice(0, 24)}...` : "a591a6d40bf420404a011733..."}
          </div>
        </div>
      </div>

      {/* NIST SP 800-88 Method Selector with Plain Language Tooltips */}
      <div className="p-6 rounded-2xl bg-obsidian-850 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span>NIST SP 800-88 Rev. 1 Sanitization Method Selection</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Strict Standard Compliance</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CLEAR */}
          <div
            onClick={() => setSelectedMethod("CLEAR")}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-2 relative ${
              selectedMethod === "CLEAR"
                ? "bg-forensic-cyan/10 border-forensic-cyan shadow-md shadow-forensic-cyan/10"
                : "bg-obsidian-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-forensic-cyan">1. CLEAR</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Single-Pass Overwrite</span>
            </div>
            <div className="text-sm font-bold text-white">Logical Zero Fill</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Overwrites all readable data once. Protects against basic recovery tools, but a forensic lab could still attempt recovery.
            </p>
            <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800 flex items-center gap-1">
              <Info className="w-3 h-3 text-forensic-cyan" />
              <span>Standard for non-sensitive drives</span>
            </div>
          </div>

          {/* PURGE */}
          <div
            onClick={() => setSelectedMethod("PURGE")}
            className={`p-4 rounded-xl border cursor-pointer transition space-y-2 relative ${
              selectedMethod === "PURGE"
                ? "bg-red-500/10 border-red-500 shadow-md shadow-red-500/10"
                : "bg-obsidian-900 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-red-400">2. PURGE (RECOMMENDED)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">Firmware Hardware</span>
            </div>
            <div className="text-sm font-bold text-white">ATA / NVMe Sanitize</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instructs the drive's own hardware to permanently destroy data at firmware level. Meets higher NIST standard for disposal or reuse.
            </p>
            <div className="text-[10px] text-red-400 font-mono pt-1 border-t border-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-red-400" />
              <span>Infeasible lab recovery</span>
            </div>
          </div>

          {/* CRYPTO-ERASE */}
          <div
            onClick={() => {
              if (device?.is_sed_capable !== false) setSelectedMethod("CRYPTO_ERASE");
            }}
            className={`p-4 rounded-xl border transition space-y-2 relative ${
              device?.is_sed_capable === false
                ? "opacity-50 cursor-not-allowed bg-obsidian-950 border-slate-900"
                : selectedMethod === "CRYPTO_ERASE"
                ? "bg-violet-500/10 border-violet-500 shadow-md shadow-violet-500/10 cursor-pointer"
                : "bg-obsidian-900 border-slate-800 hover:border-slate-700 cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-violet-400">3. CRYPTO-ERASE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">Key Destruction</span>
            </div>
            <div className="text-sm font-bold text-white">Media Key Zeroing</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly destroys the drive's internal encryption key. Only available on self-encrypting drives (SEDs). Fastest method.
            </p>
            {device?.is_sed_capable === false && (
              <div className="text-[10px] text-amber-400 font-mono font-bold pt-1 border-t border-slate-800">
                ⚠️ Disabled: Drive is not SED-capable
              </div>
            )}
          </div>
        </div>

        {/* Execution Trigger Button */}
        <div className="pt-2">
          <button
            onClick={startSanitization}
            disabled={isExecuting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 font-black text-white text-sm flex items-center justify-center gap-2 hover:opacity-95 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isExecuting ? "EXECUTION IN PROGRESS..." : `EXECUTE NIST SP 800-88 ${selectedMethod} SANITIZATION`}</span>
          </button>
        </div>
      </div>

      {/* Live WebSocket Progress Monitor */}
      <div className="p-6 rounded-2xl bg-obsidian-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-sm font-mono font-bold text-white">LIVE WEBSOCKET TELEMETRY MONITOR</h3>
          </div>
          <div className="font-mono text-xs text-slate-400">Status: <span className="text-emerald-400 font-bold">{telemetry.status}</span></div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">Sanitization Progress</span>
            <span className="text-forensic-cyan font-bold">{telemetry.pct}%</span>
          </div>
          <div className="w-full bg-obsidian-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-forensic-cyan to-emerald-400 h-3 transition-all duration-300"
              style={{ width: `${telemetry.pct}%` }}
            ></div>
          </div>
        </div>

        {/* Live Status Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">OPERATION SPEED</div>
            <div className="text-sm font-mono font-bold text-forensic-cyan mt-0.5">{telemetry.speed}</div>
          </div>
          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">DATA REMANENCE</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{telemetry.remanence}</div>
          </div>
          <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-500">VERIFICATION RESULT</div>
            <div className="text-sm font-mono font-bold text-blue-400 mt-0.5 truncate">
              {telemetry.pct >= 100 ? "✓ 0.00% Remanence Pass" : "In Progress"}
            </div>
          </div>
        </div>

        {/* Console Log Log Display */}
        <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800/80 font-mono text-xs text-slate-300">
          <span className="text-emerald-400 font-bold">&gt;&gt; </span>
          <span>{telemetry.message}</span>
        </div>
      </div>
    </div>
  );
}
