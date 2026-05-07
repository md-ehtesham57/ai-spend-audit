"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuditResult, ToolAuditResult } from "@/types";
import { PRICING_DATA } from "@/data/pricing";

function getToolDisplayName(toolName: string): string {
  return PRICING_DATA.find((t) => t.toolName === toolName)?.displayName ?? toolName;
}

function SavingsBadge({ savings }: { savings: number }) {
  if (savings <= 0) {
    return (
      <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-sm text-emerald-400">
        ✓ Optimal
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-900/40 px-3 py-1 text-sm text-amber-400">
      Save ${savings.toFixed(0)}/mo
    </span>
  );
}

function ToolCard({ result }: { result: ToolAuditResult }) {
  const isOptimal = result.monthlySavings <= 0;
  return (
    <div
      className={`rounded-xl border p-5 ${
        isOptimal
          ? "border-gray-700 bg-gray-800/40"
          : "border-amber-800/50 bg-amber-900/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">
            {getToolDisplayName(result.tool)}
          </h3>
          <p className="text-sm text-gray-400">
            {result.currentPlan} · ${result.currentSpend}/mo
          </p>
        </div>
        <SavingsBadge savings={result.monthlySavings} />
      </div>

      <div className="mt-3 rounded-lg bg-gray-900/60 px-4 py-3">
        <p className="text-sm font-medium text-gray-200">
          {result.recommendedAction}
        </p>
        <p className="mt-1 text-sm text-gray-400">{result.reason}</p>
      </div>

      {result.monthlySavings > 0 && (
        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-400">
            Recommended spend:{" "}
            <span className="text-white">
              ${result.estimatedSpend.toFixed(0)}/mo
            </span>
          </span>
          <span className="text-emerald-400">
            Save ${result.monthlySavings.toFixed(0)}/mo
          </span>
        </div>
      )}
    </div>
  );
}

export default function AuditResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const stored = localStorage.getItem(`audit_result_${id}`);
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      setNotFound(true);
    }
  }, [params.id]);

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-400">Audit not found.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-500"
          >
            Start a new audit
          </button>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-400">Loading your audit...</p>
      </main>
    );
  }

  const isHighSavings = result.totalMonthlySavings > 500;
  const isOptimal = result.totalMonthlySavings < 100;

  return (
    <main className="min-h-screen bg-gray-900 px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Hero savings block */}
        <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 p-8 text-center">
          {isOptimal ? (
            <>
              <div className="text-5xl">✅</div>
              <h1 className="mt-4 text-3xl font-bold text-white">
                You&apos;re spending well.
              </h1>
              <p className="mt-2 text-gray-400">
                Your AI stack looks well-optimized. We&apos;ll notify you when
                new savings opportunities apply to your tools.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
                Potential Savings Found
              </p>
              <div className="mt-2 text-6xl font-bold text-white">
                ${result.totalMonthlySavings.toFixed(0)}
                <span className="text-3xl text-gray-400">/mo</span>
              </div>
              <div className="mt-1 text-2xl text-emerald-400">
                ${result.totalAnnualSavings.toFixed(0)}/year
              </div>
            </>
          )}
        </div>

        {/* Credex CTA for high savings */}
        {isHighSavings && (
          <div className="rounded-xl border border-blue-800/50 bg-blue-900/20 p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h2 className="font-semibold text-white">
                  Capture even more savings with Credex
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  You&apos;re spending significantly on AI tools. Credex sells
                  discounted AI credits — Cursor, Claude, ChatGPT Enterprise —
                  sourced from companies that overforecast. Get the same tools
                  for less.
                </p>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                  >
                  Book a free Credex consultation →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Per-tool breakdown */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
            Tool-by-Tool Breakdown
          </h2>
          <div className="space-y-3">
            {result.toolResults.map((toolResult, i) => (
              <ToolCard key={i} result={toolResult} />
            ))}
          </div>
        </div>

        {/* Share + new audit */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
            className="flex-1 rounded-xl border border-gray-700 py-3 text-gray-300 hover:border-gray-500 transition-colors"
          >
            🔗 Share this audit
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 rounded-xl bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Run another audit
          </button>
        </div>

      </div>
    </main>
  );
}