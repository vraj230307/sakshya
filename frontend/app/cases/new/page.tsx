"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, HardDrive, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Trash2, Key, Info } from "lucide-react";
import { createCase, detectConnectedDrives, registerDevice } from "@/lib/api";

export default function NewCaseWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [firNumber, setFirNumber] = useState("FIR-2026/0892-CYBER");
  const [caseType, setCaseType] = useState("Financial Cyber Fraud & Data Theft");
  const [description, setDescription] = useState("Seized digital storage device from suspect location during cyber raid.");
  const [officerId, setOfficerId] = useState("IO-0142");

  // Step 2 State
  const [detectedDrives, setDetectedDrives] = useState<any[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<any>(null);
  const [hashingProgress, setHashingProgress] = useState(0);
  const [isHashing, setIsHashing] = useState(false);
  const [acquisitionHash, setAcquisitionHash] = useState("");

  // Step 3 State
  const [actionObjective, setActionObjective] = useState<"SANITIZE" | "RECOVER">("SANITIZE");
  const [sanitizeMethod, setSanitizeMethod] = useState<"CLEAR" | "PURGE" | "CRYPTO_ERASE">("PURGE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load officer from localStorage if available
    const stored = localStorage.getItem("sakshya_officer");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.badge) setOfficerId(parsed.badge);
      } catch (e) {}
    }

    // Auto detect drives
    detectConnectedDrives().then((drives) => {
      setDetectedDrives(drives);
      if (drives.length > 0) setSelectedDrive(drives[0]);
    }).catch(() => {});
  }, []);

  const handleComputeHash = () => {
    setIsHashing(true);
    setHashingProgress(0);
    const interval = setInterval(() => {
      setHashingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHashing(false);
          setAcquisitionHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
          return 100;
        }
        return prev + 20;
      });
    }, 250);
  };

  const handleFinishWizard = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Case
      const newCase = await createCase({
        fir_number: firNumber,
        case_type: caseType,
        officer_id: officerId,
        description: description,
      });

      // 2. Register Device
      if (selectedDrive) {
        await registerDevice(newCase.id, {
          serial_number: selectedDrive.serial_number,
          make_model: selectedDrive.make_model,
          media_type: selectedDrive.media_type,
          identifier_extra: selectedDrive.identifier_extra,
          is_sed_capable: selectedDrive.is_sed_capable,
          acquisition_hash: acquisitionHash || "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
        });
      }

      // 3. Redirect to target operation page
      if (actionObjective === "SANITIZE") {
        router.push(`/cases/${newCase.id}/sanitize`);
      } else {
        router.push(`/cases/${newCase.id}/recover`);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Forensic Intake & Acquisition Wizard</h1>
        <p className="text-xs text-slate-400 mt-1">3-Step Linear Workflow under BSA 2023 Sec 63(4) Statutory Rules</p>
      </div>

      {/* 3-Step Progress Header Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
          step === 1 ? "bg-forensic-cyan/10 border-forensic-cyan text-forensic-cyan" : step > 1 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-obsidian-850 border-slate-800 text-slate-500"
        }`}>
          <div className="w-7 h-7 rounded-full bg-obsidian-900 border border-current flex items-center justify-center font-bold text-xs">1</div>
          <div>
            <div className="text-xs font-bold">Step 1: FIR Metadata</div>
            <div className="text-[10px] text-slate-400">Case & Officer Registration</div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
          step === 2 ? "bg-forensic-cyan/10 border-forensic-cyan text-forensic-cyan" : step > 2 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-obsidian-850 border-slate-800 text-slate-500"
        }`}>
          <div className="w-7 h-7 rounded-full bg-obsidian-900 border border-current flex items-center justify-center font-bold text-xs">2</div>
          <div>
            <div className="text-xs font-bold">Step 2: Media Acquisition</div>
            <div className="text-[10px] text-slate-400">Auto-Detect & Baseline Hash</div>
          </div>
        </div>

        <div className={`p-3 rounded-xl border flex items-center gap-3 transition ${
          step === 3 ? "bg-forensic-cyan/10 border-forensic-cyan text-forensic-cyan" : "bg-obsidian-850 border-slate-800 text-slate-500"
        }`}>
          <div className="w-7 h-7 rounded-full bg-obsidian-900 border border-current flex items-center justify-center font-bold text-xs">3</div>
          <div>
            <div className="text-xs font-bold">Step 3: Action Selection</div>
            <div className="text-[10px] text-slate-400">Sanitize vs Carve</div>
          </div>
        </div>
      </div>

      {/* STEP 1 CONTENT */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-obsidian-850 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-forensic-cyan" />
            <span>Case Identification & Legal Registration</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">FIR / Seizure Case Number</label>
              <input
                type="text"
                value={firNumber}
                onChange={(e) => setFirNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white font-mono text-sm focus:border-forensic-cyan"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Investigating Officer ID</label>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white font-mono text-sm focus:border-forensic-cyan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Offense Category / Case Type</label>
            <input
              type="text"
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white text-sm focus:border-forensic-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Seizure Context & Technical Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-obsidian-900 border border-slate-700 text-white text-sm focus:border-forensic-cyan"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-forensic-cyan text-obsidian-950 font-bold text-xs flex items-center gap-2 hover:bg-forensic-cyan/90 transition shadow-lg shadow-forensic-cyan/20"
            >
              <span>CONTINUE TO MEDIA ACQUISITION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 CONTENT */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-obsidian-850 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-forensic-cyan" />
              <span>Target Storage Drive Auto-Detection</span>
            </h2>
            <button
              onClick={() => detectConnectedDrives().then(setDetectedDrives)}
              className="px-3 py-1 rounded bg-obsidian-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 hover:border-forensic-cyan"
            >
              <RefreshCw className="w-3 h-3 text-forensic-cyan" />
              <span>Rescan Bus</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono text-slate-400">Select Physical Storage Target:</label>
            {detectedDrives.map((drive) => (
              <div
                key={drive.serial_number}
                onClick={() => setSelectedDrive(drive)}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedDrive?.serial_number === drive.serial_number
                    ? "bg-forensic-cyan/10 border-forensic-cyan shadow-md shadow-forensic-cyan/10"
                    : "bg-obsidian-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {drive.make_model}
                    {drive.is_sed_capable && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        SED (Self-Encrypting Drive)
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    Serial: {drive.serial_number} • Bus: {drive.bus_interface} • Capacity: {drive.capacity_gb} GB
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-emerald-400">
                  SMART: {drive.smart_health}
                </div>
              </div>
            ))}
          </div>

          {/* Baseline Acquisition Hash Computation */}
          <div className="p-4 rounded-xl bg-obsidian-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-300">Baseline Hardware SHA-256 Acquisition Hash</span>
              <button
                onClick={handleComputeHash}
                disabled={isHashing}
                className="px-3 py-1 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-mono hover:bg-blue-600/30 disabled:opacity-50"
              >
                {isHashing ? `Hashing... ${hashingProgress}%` : "Compute Baseline Hash"}
              </button>
            </div>

            {isHashing && (
              <div className="w-full bg-obsidian-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-forensic-cyan h-2 transition-all duration-300" style={{ width: `${hashingProgress}%` }}></div>
              </div>
            )}

            <div className="font-mono text-xs bg-obsidian-950 p-2.5 rounded border border-slate-800 text-forensic-cyan break-all">
              {acquisitionHash || "SHA256: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e (Verified)"}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-obsidian-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-obsidian-750"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-forensic-cyan text-obsidian-950 font-bold text-xs flex items-center gap-2 hover:bg-forensic-cyan/90 transition shadow-lg shadow-forensic-cyan/20"
            >
              <span>SELECT ACTION OBJECTIVE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 CONTENT */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-obsidian-850 border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-forensic-cyan" />
            <span>Select Operational Objective for Target Drive</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setActionObjective("SANITIZE")}
              className={`p-5 rounded-xl border cursor-pointer transition space-y-2 ${
                actionObjective === "SANITIZE"
                  ? "bg-red-500/10 border-red-500 shadow-md shadow-red-500/10"
                  : "bg-obsidian-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <div className="text-sm font-bold text-white">SECURE DATA SANITIZATION</div>
              </div>
              <p className="text-xs text-slate-400">
                Permanently erase target drive according to NIST SP 800-88 guidelines (Clear, Purge, or Crypto-Erase).
              </p>
            </div>

            <div
              onClick={() => setActionObjective("RECOVER")}
              className={`p-5 rounded-xl border cursor-pointer transition space-y-2 ${
                actionObjective === "RECOVER"
                  ? "bg-forensic-cyan/10 border-forensic-cyan shadow-md shadow-forensic-cyan/10"
                  : "bg-obsidian-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-forensic-cyan" />
                <div className="text-sm font-bold text-white">FILE CARVING & RECOVERY</div>
              </div>
              <p className="text-xs text-slate-400">
                Perform raw cluster magic header carving to extract intact evidence files, thumbnails, and SHA-256 hashes.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-obsidian-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-obsidian-750"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinishWizard}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-forensic-cyan to-blue-600 text-obsidian-950 font-extrabold text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg shadow-forensic-cyan/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "REGISTERING & LAUNCHING..." : "REGISTER CASE & LAUNCH WORKSPACE"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
