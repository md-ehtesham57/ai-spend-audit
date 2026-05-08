"use client";

import { useState } from "react";
import { AuditResult } from "@/types";

interface Props {
  auditResult: AuditResult;
  isHighSavings: boolean;
}

export default function LeadCaptureForm({ auditResult, isHighSavings }: Props) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: auditResult.id,
          email,
          companyName,
          role,
          teamSize: auditResult.formData.teamSize,
          totalMonthlySavings: auditResult.totalMonthlySavings,
          totalAnnualSavings: auditResult.totalAnnualSavings,
          useCase: auditResult.formData.useCase,
          tools: auditResult.formData.tools,
          website: "", // honeypot — always empty for real users
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/20 p-6 text-center">
        <div className="text-3xl">✅</div>
        <h3 className="mt-2 font-semibold text-white">
          {isHighSavings
            ? "We'll be in touch about your savings!"
            : "You're on the list!"}
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          {isHighSavings
            ? "A Credex advisor will reach out within 1 business day."
            : "We'll notify you when new optimizations apply to your stack."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-6">
      <h3 className="font-semibold text-white">
        {isHighSavings
          ? "📬 Get your full report + book a free Credex consultation"
          : "📬 Get notified when new savings apply to your stack"}
      </h3>
      <p className="mt-1 text-sm text-gray-400">
        No spam. One email with your audit report.
      </p>

      <div className="mt-4 space-y-3">
        {/* Honeypot — hidden from real users */}
        <input
          type="text"
          name="website"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          readOnly
          value=""
        />

        <input
          type="email"
          placeholder="your@email.com *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Your role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!email || loading}
          className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Send me the report →"}
        </button>
      </div>
    </div>
  );
}