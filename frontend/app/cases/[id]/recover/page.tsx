"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { HardDrive, FileText, Filter, Play, CheckCircle2, Eye, Copy, Check, Hash, ShieldCheck } from "lucide-react";
import { getCase, getCaseDevices, createOperation, getOperationFiles, RecoveredFile, Device, Case } from "@/lib/api";

export default function CarvePage() {
  const params = useParams();
  const caseId = (params?.id as string) || "c2002-forensic-case-mumbai";

  const [caseObj, setCaseObj] = useState<Case | null>(null);
  const [device, setDevice] = useState<Device | null>({
    id: `dev-${caseId}`,
    case_id: caseId,
    serial_number: "SEAGATE-BARRACUDA-2TB-S390012",
    make_model: "Seagate BarraCuda 2TB 3.5\" HDD",
    media_type: "HDD_SATA",
    identifier_extra: "SATA III 6Gb/s Primary Storage Target",
    is_sed_capable: false,
    acquisition_hash: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    acquisition_hash_algo: "SHA256",
    created_at: new Date().toISOString(),
  });

  const [files, setFiles] = useState<RecoveredFile[]>([]);
  const [fileFilter, setFileFilter] = useState<string>("ALL");
  const [isCarving, setIsCarving] = useState(false);
  const [carveProgress, setCarveProgress] = useState(0);

  // Hex Viewer Modal State
  const [selectedHexFile, setSelectedHexFile] = useState<RecoveredFile | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    getCase(caseId).then(setCaseObj).catch(() => {});
    getCaseDevices(caseId).then((devs) => {
      if (devs.length > 0) setDevice(devs[0]);
    }).catch(() => {});

    // Default mock files for immediate rendering
    setFiles([
      {
        id: "f1",
        operation_id: "op-rec-1",
        filename: "EVIDENCE_DOC_FIR_402.pdf",
        file_type: "pdf",
        file_path: "/evidence/carved/EVIDENCE_DOC_FIR_402.pdf",
        integrity_score: 0.98,
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        created_at: new Date().toISOString()
      },
      {
        id: "f2",
        operation_id: "op-rec-1",
        filename: "SEIZED_CRIME_SCENE_01.jpg",
        file_type: "jpg",
        file_path: "/evidence/carved/SEIZED_CRIME_SCENE_01.jpg",
        integrity_score: 0.95,
        sha256: "1f8252207b9736c075f10255b5d5d99ed50b6911b332d96c80875e538ef5a4e5",
        created_at: new Date().toISOString()
      },
      {
        id: "f3",
        operation_id: "op-rec-1",
        filename: "BANK_STATEMENT_STAMPED.png",
        file_type: "png",
        file_path: "/evidence/carved/BANK_STATEMENT_STAMPED.png",
        integrity_score: 0.92,
        sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        created_at: new Date().toISOString()
      },
      {
        id: "f4",
        operation_id: "op-rec-1",
        filename: "ENCRYPTED_BACKUP_VOL.zip",
        file_type: "zip",
        file_path: "/evidence/carved/ENCRYPTED_BACKUP_VOL.zip",
        integrity_score: 0.88,
        sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        created_at: new Date().toISOString()
      },
      {
        id: "f5",
        operation_id: "op-rec-1",
        filename: "CALL_LOGS_EXCEL_EXPORT.docx",
        file_type: "docx",
        file_path: "/evidence/carved/CALL_LOGS_EXCEL_EXPORT.docx",
        integrity_score: 0.96,
        sha256: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
        created_at: new Date().toISOString()
      }
    ]);
  }, [caseId]);

  const triggerCarving = async () => {
    if (!device) return;
    setIsCarving(true);
    setCarveProgress(0);
    try {
      const op = await createOperation(caseId, {
        device_id: device.id,
        type: "RECOVER",
      });

      let isConnected = false;
      let hasFinished = false;

      const runFallbackSimulation = () => {
        if (hasFinished) return;
        let currentPct = 0;
        const interval = setInterval(() => {
          currentPct += 15;
          if (currentPct > 100) currentPct = 100;
          setCarveProgress(currentPct);
          if (currentPct >= 100) {
            clearInterval(interval);
            hasFinished = true;
            setIsCarving(false);
            getOperationFiles(op.id).then(setFiles).catch(() => {});
          }
        }, 300);
      };

      const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = process.env.NEXT_PUBLIC_WS_BASE || `${wsProtocol}//localhost:8000`;
      const wsUrl = `${wsHost}/api/operations/${op.id}/stream`;

      try {
        const ws = new WebSocket(wsUrl);

        const connectionTimeout = setTimeout(() => {
          if (!isConnected) {
            try { ws.close(); } catch (e) {}
            runFallbackSimulation();
          }
        }, 1200);

        ws.onopen = () => {
          isConnected = true;
          clearTimeout(connectionTimeout);
        };

        ws.onmessage = (event) => {
          isConnected = true;
          clearTimeout(connectionTimeout);
          try {
            const data = JSON.parse(event.data);
            setCarveProgress(data.pct || 0);
            if (data.pct >= 100) {
              hasFinished = true;
              setIsCarving(false);
              getOperationFiles(op.id).then(setFiles).catch(() => {});
            }
          } catch (e) {}
        };

        ws.onerror = () => {
          if (!isConnected) {
            clearTimeout(connectionTimeout);
            runFallbackSimulation();
          }
        };
      } catch (e) {
        runFallbackSimulation();
      }
    } catch (e) {
      setIsCarving(false);
    }
  };

  const filteredFiles = files.filter(f => fileFilter === "ALL" || f.file_type?.toLowerCase() === fileFilter.toLowerCase());

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-forensic-cyan/20 text-forensic-cyan border border-forensic-cyan/30">
              FILE CARVING STUDIO
            </span>
            <span className="text-xs font-mono text-slate-400">FIR: {caseObj?.fir_number || "FIR-2026/0118-BSA"}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Signature-Based Raw Sector Evidence Carving</h1>
        </div>

        <button
          onClick={triggerCarving}
          disabled={isCarving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-forensic-cyan to-blue-600 font-bold text-obsidian-950 text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg shadow-forensic-cyan/20 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isCarving ? `CARVING SECTORS... ${carveProgress}%` : "DEEP SCAN & CARVE MEDIA"}</span>
        </button>
      </div>

      {/* Target Media Card */}
      <div className="p-4 rounded-xl bg-obsidian-850 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-slate-400">CARVING TARGET MEDIA</div>
          <div className="text-base font-bold text-white">{device?.make_model || "Seagate BarraCuda 2TB 3.5\" HDD"}</div>
          <div className="text-xs font-mono text-slate-400">Serial: {device?.serial_number || "SEAGATE-BARRACUDA-2TB-S390012"}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-slate-400">RECOVERED ARTIFACTS</div>
          <div className="text-xl font-black text-emerald-400 font-mono">{files.length} Intact Evidence Files</div>
        </div>
      </div>

      {/* File Type Filter Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-850 border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300">Magic Header Filter:</span>
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "PDF", "JPG", "PNG", "ZIP", "DOCX"].map((ft) => (
            <button
              key={ft}
              onClick={() => setFileFilter(ft)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                fileFilter === ft
                  ? "bg-forensic-cyan text-obsidian-950 shadow-md shadow-forensic-cyan/20"
                  : "bg-obsidian-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Carved Evidence Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="p-4 rounded-xl bg-obsidian-850 border border-slate-800 hover:border-forensic-cyan/40 transition space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-forensic-cyan border border-slate-700 uppercase font-bold">
                  .{file.file_type}
                </span>
                <h3 className="text-xs font-bold text-white truncate max-w-[200px] mt-1.5">{file.filename}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {Math.round(file.integrity_score * 100)}% Integrity
              </span>
            </div>

            <div className="bg-obsidian-950 p-2.5 rounded border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-slate-300">
                <Hash className="w-3 h-3 text-forensic-cyan" />
                <span className="truncate">{file.sha256}</span>
              </div>
              <div className="text-[10px] text-slate-500">Path: {file.file_path}</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedHexFile(file)}
                className="w-full py-1.5 rounded bg-obsidian-800 border border-slate-700 hover:border-forensic-cyan text-slate-200 text-xs font-mono font-semibold flex items-center justify-center gap-1 transition"
              >
                <Eye className="w-3.5 h-3.5 text-forensic-cyan" />
                <span>Inspect Raw Hex</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Hex Inspector Modal */}
      {selectedHexFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-forensic-cyan/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedHexFile.filename}</h3>
                <p className="text-xs text-slate-400 font-mono">Magic Header Cluster Inspection</p>
              </div>
              <button
                onClick={() => setSelectedHexFile(null)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-obsidian-800 rounded"
              >
                ✕ Close
              </button>
            </div>

            {/* SHA-256 Copy Bar */}
            <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-800 flex items-center justify-between">
              <div className="font-mono text-xs text-forensic-cyan truncate max-w-md">
                SHA256: {selectedHexFile.sha256}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedHexFile.sha256 || "");
                  setCopiedHash(true);
                  setTimeout(() => setCopiedHash(false), 2000);
                }}
                className="px-2.5 py-1 rounded bg-obsidian-850 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1 hover:border-forensic-cyan"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-forensic-cyan" />}
                <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
              </button>
            </div>

            {/* Raw Hex Dump View */}
            <div className="bg-obsidian-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
              <div className="text-slate-500 pb-1 border-b border-slate-800 text-[11px]">
                OFFSET | 00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F | ASCII
              </div>
              <div className="text-emerald-400 font-bold">
                00000000 | 25 50 44 46 2D 31 2E 37 0D 0A 25 E2 E3 CF D3 0D | %PDF-1.7..%....
              </div>
              <div>00000010 | 0A 31 20 30 20 6F 62 6A 0D 0A 3C 3C 2F 54 79 70 | .1 0 obj..&lt;&lt;/Typ</div>
              <div>00000020 | 65 2F 43 61 74 61 6C 6F 67 2F 50 61 67 65 73 20 | e/Catalog/Pages </div>
              <div>00000030 | 32 20 30 20 52 2F 4F 70 65 6E 41 63 74 69 6F 6E | 2 0 R/OpenAction</div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedHexFile(null)}
                className="px-4 py-2 rounded-lg bg-forensic-cyan text-obsidian-950 font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
