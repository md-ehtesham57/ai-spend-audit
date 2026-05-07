"use client";

import { ToolEntry, ToolName } from "@/types";
import ToolSelector from "./ToolSelector";
import PlanSelector from "./PlanSelector";

interface Props {
  entry: ToolEntry;
  index: number;
  usedTools: ToolName[];
  onChange: (index: number, updated: ToolEntry) => void;
  onRemove: (index: number) => void;
}

export default function ToolRow({
  entry,
  index,
  usedTools,
  onChange,
  onRemove,
}: Props) {
  const update = (field: keyof ToolEntry, value: string | number) => {
    onChange(index, { ...entry, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-700 bg-gray-800/50 p-4 sm:grid-cols-4">
      {/* Tool */}
      <div>
        <label className="mb-1 block text-xs text-gray-400">Tool</label>
        <ToolSelector
          value={entry.tool}
          onChange={(val) => update("tool", val)}
          usedTools={usedTools}
        />
      </div>

      {/* Plan */}
      <div>
        <label className="mb-1 block text-xs text-gray-400">Plan</label>
        <PlanSelector
          toolName={entry.tool}
          value={entry.plan}
          onChange={(val) => update("plan", val)}
        />
      </div>

      {/* Monthly Spend */}
      <div>
        <label className="mb-1 block text-xs text-gray-400">
          Monthly Spend ($)
        </label>
        <input
          type="number"
          min={0}
          value={entry.monthlySpend}
          onChange={(e) => update("monthlySpend", parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Seats */}
      <div>
        <label className="mb-1 block text-xs text-gray-400">Seats</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            value={entry.seats}
            onChange={(e) => update("seats", parseInt(e.target.value) || 1)}
            placeholder="1"
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => onRemove(index)}
            className="rounded-lg border border-red-800 px-3 py-2 text-red-400 hover:bg-red-900/30 transition-colors"
            title="Remove tool"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}