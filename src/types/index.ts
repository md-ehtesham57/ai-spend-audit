// All AI tools we support
export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

// Use cases
export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

// A single tool entry filled by the user
export interface ToolEntry {
  tool: ToolName | "";
  plan: string;
  monthlySpend: number;
  seats: number;
}

export function isValidToolName(value: string): value is ToolName {
  const valid: ToolName[] = ["cursor", "github_copilot", "claude", "chatgpt", "anthropic_api", "openai_api", "gemini", "windsurf"];
  return valid.includes(value as ToolName);
}

export function validateToolName(value: string): ToolName {
  if (!isValidToolName(value)) {
    return "cursor";
  }
  return value;
}

// The full form data
export interface AuditFormData {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
  email?: string;
  companyName?: string;
  role?: string;
}

// A single tool's audit result
export interface ToolAuditResult {
  tool: ToolName;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;
  recommendedPlan?: string;
  estimatedSpend: number;
  monthlySavings: number;
  reason: string;
}

// The full audit result
export interface AuditResult {
  id: string;
  formData: AuditFormData;
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary?: string;
  createdAt: string;
}