"use client";

import { ToolName } from "@/types";
import { getToolPricing } from "@/data/pricing";

interface Props {
  toolName: ToolName | "";
  value: string;
  onChange: (value: string) => void;
}

export default function PlanSelector({ toolName, value, onChange }: Props) {
  if (!toolName) {
    return (
      <select
        disabled
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-500"
      >
        <option>Select tool first...</option>
      </select>
    );
  }

  const toolPricing = getToolPricing(toolName);
  const plans = toolPricing?.plans ?? [];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">Select plan...</option>
      {plans.map((plan) => (
        <option key={plan.name} value={plan.name}>
          {plan.name} — ${plan.pricePerSeat}/seat/mo
        </option>
      ))}
    </select>
  );
}