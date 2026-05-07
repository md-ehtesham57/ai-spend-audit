"use client";

import { ToolName } from "@/types";

const TOOLS: { value: ToolName; label: string }[] = [
  { value: "cursor", label: "Cursor" },
  { value: "github_copilot", label: "GitHub Copilot" },
  { value: "claude", label: "Claude" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "anthropic_api", label: "Anthropic API" },
  { value: "openai_api", label: "OpenAI API" },
  { value: "gemini", label: "Gemini" },
  { value: "windsurf", label: "Windsurf" },
];

interface Props {
  value: ToolName | "";
  onChange: (value: ToolName) => void;
  usedTools: ToolName[];
}

export default function ToolSelector({ value, onChange, usedTools }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ToolName)}
      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">Select a tool...</option>
      {TOOLS.map((tool) => (
        <option
          key={tool.value}
          value={tool.value}
          disabled={usedTools.includes(tool.value) && value !== tool.value}
        >
          {tool.label}
          {usedTools.includes(tool.value) && value !== tool.value
            ? " (added)"
            : ""}
        </option>
      ))}
    </select>
  );
}