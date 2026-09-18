"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FileText, ShieldCheck, Lock, Printer, Download, Eye, CheckCircle2, UserCheck, Key } from "lucide-react";
import { getCaseCertificates, signCertificate, Certificate, API_BASE } from "@/lib/api";

export default function CertificatesPage() {
  const params = useParams();
  const caseId = (params?.id as string) || "c1001-forensic-case-delhi";

  const [activeTab, setActiveTab] = useState<"SANITIZATION" | "EVIDENCE">("SANITIZATION");
  const [evidenceSubTab, setEvidenceSubTab] = useState<"PARTY" | "EXPERT">("PARTY");

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    getCaseCertificates(caseId).then((certs) => {
      setCertificates(certs);
      if (certs.length > 0) setSelectedCert(certs[0]);
    }).catch(() => {});
  }, [caseId]);

  const currentType = activeTab === "SANITIZATION"
    ? "SANITIZATION"
    : evidenceSubTab === "PARTY"
    ? "EVIDENCE_PARTY"
    : "EVIDENCE_EXPERT";

  const activeCert = certificates.find((c) => c.type === currentType) || selectedCert;

  const handleSign = async () => {
    if (!activeCert) return;
    setIsSigning(true);
    try {
      const updated = await signCertificate(activeCert.id, "IO-0142");
      setCertificates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCert(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigning(false);
    }
  };

  const generateCertificateHtml = (cert: Certificate) => {
    const isSanitize = cert.type === "SANITIZATION";
    const isParty = cert.type === "EVIDENCE_PARTY";

    const title = isSanitize
      ? "NIST SP 800-88 REV. 1 MEDIA SANITIZATION CERTIFICATE"
      : isParty
      ? "BHARATIYA SAKSHYA ADHINIYAM 2023 - SEC 63(4) PART A CERTIFICATE"
      : "BHARATIYA SAKSHYA ADHINIYAM 2023 - SEC 63(4) PART B CERTIFICATE";

    const subtitle = isSanitize
      ? "Statutory Data Erasure & Remanence Verification Record"
      : isParty
      ? "Certificate by Person in Lawful Charge of Computer / Device"
      : "Certificate by Technical Expert / In-Charge of System Operations";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Courier New', monospace; background: #0b0f19; color: #e2e8f0; padding: 24px; line-height: 1.5; font-size: 13px; }
    .card { border: 2px solid ${isSanitize ? '#10b981' : isParty ? '#06b6d4' : '#3b82f6'}; border-radius: 12px; padding: 24px; background: #131b2e; }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 16px; font-weight: 900; color: ${isSanitize ? '#10b981' : isParty ? '#06b6d4' : '#3b82f6'}; letter-spacing: 0.5px; }
    .sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .box { background: #0b0f19; border: 1px solid #1e293b; padding: 10px; border-radius: 6px; }
    .lbl { font-size: 10px; color: #64748b; font-weight: bold; }
    .val { font-size: 12px; color: #f8fafc; font-weight: bold; margin-top: 2px; }
    .hash { word-break: break-all; color: #06b6d4; font-size: 11px; }
    .stamp { text-align: center; margin-top: 24px; padding: 12px; border: 2px dashed ${cert.status === 'SIGNED' ? '#10b981' : '#f59e0b'}; border-radius: 8px; color: ${cert.status === 'SIGNED' ? '#34d399' : '#fbbf24'}; }
    .legal-text { font-size: 11px; color: #cbd5e1; margin-top: 16px; font-style: italic; background: #0b0f19; padding: 12px; border-radius: 6px; border-left: 3px solid #06b6d4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">${title}</div>
      <div class="sub">${subtitle}</div>
    </div>
    
    <div class="grid">
      <div class="box"><div class="lbl">CASE / FIR NUMBER</div><div class="val">${caseId}</div></div>
      <div class="box"><div class="lbl">CERTIFICATE ID</div><div class="val">${cert.id}</div></div>
      <div class="box"><div class="lbl">INVESTIGATING OFFICER</div><div class="val">${cert.signed_by || "IO-0142 (Inspector)"}</div></div>
      <div class="box"><div class="lbl">STATUS</div><div class="val">${cert.status}</div></div>
    </div>

    <div class="box" style="margin-bottom: 12px;">
      <div class="lbl">TARGET MEDIA HARDWARE IDENTIFIER</div>
      <div class="val">Samsung NVMe SSD 980 PRO (512GB) • Serial: NVME-SAMSUNG-980PRO-512GB-SN90214</div>
    </div>

    <div class="box" style="margin-bottom: 12px;">
      <div class="lbl">BASELINE SHA-256 ACQUISITION HASH</div>
      <div class="val hash">${cert.signed_hash || "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"}</div>
    </div>

    <div class="legal-text">
      "I hereby certify that the electronic record contained herein was produced by a computer/system owned/operated in the ordinary course of official duty, and all safeguards under BSA 2023 Section 63(4) were strictly maintained without unauthorized alteration."
    </div>

    <div class="stamp">
      ${cert.status === 'SIGNED' ? '✓ CRYPTOGRAPHICALLY SIGNED & OFFICIALLY STAMPED BY INVESTIGATING OFFICER' : '⚠️ PREVIEW DRAFT — AWAITING OFFICIAL STAMP & DIGITAL SIGNATURE'}
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              BSA 2023 SEC 63(4) & NIST SP 800-88
            </span>
            <span className="text-xs font-mono text-slate-400">Case ID: {caseId}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Legally Admissible Certificate Hub</h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-obsidian-850 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 hover:border-forensic-cyan transition"
          >
            <Printer className="w-4 h-4 text-forensic-cyan" />
            <span>Print / Export PDF</span>
          </button>

          {activeCert?.status !== "SIGNED" ? (
            <button
              onClick={handleSign}
              disabled={isSigning}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-extrabold text-obsidian-950 text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSigning ? "SIGNING & LOCKING..." : "STAMP & SIGN CERTIFICATE"}</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SIGNED & CRYPTOGRAPHICALLY LOCKED</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Tabs: NIST Sanitization vs BSA 2023 Evidence */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-bold font-mono">
        <button
          onClick={() => setActiveTab("SANITIZATION")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "SANITIZATION"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. NIST SP 800-88 Sanitization Cert</span>
        </button>

        <button
          onClick={() => setActiveTab("EVIDENCE")}
          className={`pb-3 transition border-b-2 flex items-center gap-2 ${
            activeTab === "EVIDENCE"
              ? "border-forensic-cyan text-forensic-cyan"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. BSA 2023 Sec 63(4) Evidence Certificates (Dual)</span>
        </button>
      </div>

      {/* Sub-Tabs for BSA 2023 Dual Certificates */}
      {activeTab === "EVIDENCE" && (
        <div className="flex gap-3 bg-obsidian-900 p-1.5 rounded-xl border border-slate-800 w-fit text-xs font-mono">
          <button
            onClick={() => setEvidenceSubTab("PARTY")}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              evidenceSubTab === "PARTY"
                ? "bg-forensic-cyan text-obsidian-950 shadow-md shadow-forensic-cyan/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Part A: Party Certificate (IO)</span>
          </button>

          <button
            onClick={() => setEvidenceSubTab("EXPERT")}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-1.5 ${
              evidenceSubTab === "EXPERT"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Part B: Technical Expert Certificate</span>
          </button>
        </div>
      )}

      {/* Preview Before Sign Notice */}
      <div className="p-3 rounded-xl bg-obsidian-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-forensic-cyan" />
          <span>LIVE PREVIEW MODE — Review document before triggering statutory signature lock</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          activeCert?.status === "SIGNED" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
        }`}>
          STATUS: {activeCert?.status || "DRAFT_PREVIEW"}
        </span>
      </div>

      {/* Live Certificate Document Rendering Frame */}
      <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl bg-white min-h-[600px]">
        {activeCert ? (
          <iframe
            srcDoc={generateCertificateHtml(activeCert)}
            className="w-full h-[650px] border-0"
            title="Certificate Live Document Preview"
          />
        ) : (
          <div className="p-12 text-center text-slate-500 font-mono">Loading legal certificate document...</div>
        )}
      </div>
    </div>
  );
}

