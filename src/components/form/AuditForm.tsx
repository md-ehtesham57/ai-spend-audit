"use client";

import { useEffect, useState } from "react";
import { AuditFormData, ToolEntry, ToolName, UseCase } from "@/types";
import ToolRow from "./ToolRow";
import { useRouter } from "next/navigation";
import { runAudit } from "@/lib/auditEngine";
import { v4 as uuidv4 } from "uuid";

const EMPTY_TOOL: ToolEntry = {
  tool: "" as ToolName,
  plan: "",
  monthlySpend: 0,
  seats: 1,
};

const STORAGE_KEY = "ai_audit_form_data";

const USE_CASES: { value: UseCase; label: string }[] = [
  { value: "coding", label: "💻 Coding" },
  { value: "writing", label: "✍️ Writing" },
  { value: "data", label: "📊 Data Analysis" },
  { value: "research", label: "🔬 Research" },
  { value: "mixed", label: "🔀 Mixed" },
];

export default function AuditForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolEntry[]>([{ ...EMPTY_TOOL }]);
  const [teamSize, setTeamSize] = useState<number>(1);
  const [useCase, setUseCase] = useState<UseCase>("coding");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AuditFormData = JSON.parse(saved);
        setTools(parsed.tools);
        setTeamSize(parsed.teamSize);
        setUseCase(parsed.useCase);
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    const data: AuditFormData = { tools, teamSize, useCase };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [tools, teamSize, useCase]);

  const usedTools = tools.map((t) => t.tool).filter(Boolean) as ToolName[];

  const addTool = () => {
    if (tools.length < 8) {
      setTools([...tools, { ...EMPTY_TOOL }]);
    }
  };

  const updateTool = (index: number, updated: ToolEntry) => {
    const newTools = [...tools];
    newTools[index] = updated;
    setTools(newTools);
  };

  const removeTool = (index: number) => {
    if (tools.length > 1) {
      setTools(tools.filter((_, i) => i !== index));
    }
  };

  const isValid = tools.every(
    (t) => t.tool && t.plan && t.monthlySpend >= 0 && t.seats >= 1
  );

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);

    const formData: AuditFormData = { tools, teamSize, useCase };
    const auditResult = runAudit(formData);
    const id = uuidv4();

    // Store result in localStorage for the results page
    localStorage.setItem(
      `audit_result_${id}`,
      JSON.stringify({ id, formData, ...auditResult, createdAt: new Date().toISOString() })
    );

    router.push(`/audit/${id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">
          AI Spend Audit
        </h1>
        <p className="mt-3 text-lg text-gray-400">
          Find out where you&apos;re overspending on AI tools — in 60 seconds.
        </p>
      </div>

      {/* Tool rows */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Your AI Tools
        </h2>
        {tools.map((entry, index) => (
          <ToolRow
            key={index}
            entry={entry}
            index={index}
            usedTools={usedTools}
            onChange={updateTool}
            onRemove={removeTool}
          />
        ))}
        {tools.length < 8 && (
          <button
            onClick={addTool}
            className="w-full rounded-xl border border-dashed border-gray-600 py-3 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          >
            + Add another tool
          </button>
        )}
      </div>

      {/* Team info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Team Size
          </label>
          <input
            type="number"
            min={1}
            value={teamSize}
            onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Primary Use Case
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {USE_CASES.map((uc) => (
              <button
                key={uc.value}
                onClick={() => setUseCase(uc.value)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  useCase === uc.value
                    ? "border-emerald-500 bg-emerald-900/30 text-emerald-400"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {uc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Analyzing..." : "Run My Free Audit →"}
      </button>

      <p className="text-center text-xs text-gray-500">
        No account required. Results are instant.
      </p>
    </div>
  );
}