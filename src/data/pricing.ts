import { ToolName, UseCase } from "@/types";

export interface PlanInfo {
  name: string;
  pricePerSeat: number; // monthly, per seat
  minSeats?: number;
  maxSeats?: number;
  bestFor: UseCase[];
  features: string[];
  sourceUrl: string;
  verifiedDate: string;
}

export interface ToolPricing {
  toolName: ToolName;
  displayName: string;
  plans: PlanInfo[];
}

export const PRICING_DATA: ToolPricing[] = [
  {
    toolName: "cursor",
    displayName: "Cursor",
    plans: [
      {
        name: "Hobby",
        pricePerSeat: 0,
        bestFor: ["coding"],
        features: ["2000 completions/month", "50 slow requests"],
        sourceUrl: "https://cursor.sh/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Pro",
        pricePerSeat: 20,
        bestFor: ["coding"],
        features: ["Unlimited completions", "500 fast requests/month"],
        sourceUrl: "https://cursor.sh/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Business",
        pricePerSeat: 40,
        minSeats: 1,
        bestFor: ["coding"],
        features: ["Everything in Pro", "Admin dashboard", "SSO"],
        sourceUrl: "https://cursor.sh/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "github_copilot",
    displayName: "GitHub Copilot",
    plans: [
      {
        name: "Individual",
        pricePerSeat: 10,
        bestFor: ["coding"],
        features: ["Code suggestions", "Chat in IDE"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Business",
        pricePerSeat: 19,
        minSeats: 1,
        bestFor: ["coding"],
        features: ["Everything in Individual", "Policy management", "Audit logs"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Enterprise",
        pricePerSeat: 39,
        minSeats: 1,
        bestFor: ["coding"],
        features: ["Everything in Business", "Fine-tuned models", "Docset search"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "claude",
    displayName: "Claude",
    plans: [
      {
        name: "Free",
        pricePerSeat: 0,
        bestFor: ["writing", "research", "mixed"],
        features: ["Limited messages", "Claude 3.5 Sonnet"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Pro",
        pricePerSeat: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["5x more usage", "Priority access", "Projects"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Max",
        pricePerSeat: 100,
        bestFor: ["research", "mixed"],
        features: ["20x more usage than Pro", "Highest usage limits"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Team",
        pricePerSeat: 30,
        minSeats: 5,
        bestFor: ["writing", "research", "mixed"],
        features: ["Higher limits than Pro", "Admin console", "Collaboration"],
        sourceUrl: "https://claude.ai/upgrade",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "chatgpt",
    displayName: "ChatGPT",
    plans: [
      {
        name: "Plus",
        pricePerSeat: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["GPT-4o access", "DALL-E", "Advanced data analysis"],
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Team",
        pricePerSeat: 30,
        minSeats: 2,
        bestFor: ["writing", "research", "mixed"],
        features: ["Everything in Plus", "Admin console", "Data not used for training"],
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Enterprise",
        pricePerSeat: 60,
        minSeats: 10,
        bestFor: ["mixed"],
        features: ["Unlimited GPT-4o", "SSO", "Advanced security"],
        sourceUrl: "https://openai.com/chatgpt/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "anthropic_api",
    displayName: "Anthropic API",
    plans: [
      {
        name: "Pay-as-you-go",
        pricePerSeat: 0, // usage based
        bestFor: ["coding", "writing", "data", "research", "mixed"],
        features: ["Claude 3.5 Sonnet: $3/MTok input", "Claude 3 Haiku: $0.25/MTok input"],
        sourceUrl: "https://www.anthropic.com/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "openai_api",
    displayName: "OpenAI API",
    plans: [
      {
        name: "Pay-as-you-go",
        pricePerSeat: 0, // usage based
        bestFor: ["coding", "writing", "data", "research", "mixed"],
        features: ["GPT-4o: $2.50/MTok input", "GPT-4o mini: $0.15/MTok input"],
        sourceUrl: "https://openai.com/api/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "gemini",
    displayName: "Gemini",
    plans: [
      {
        name: "Pro",
        pricePerSeat: 20,
        bestFor: ["writing", "research", "mixed"],
        features: ["Gemini Advanced", "2TB storage", "Google One benefits"],
        sourceUrl: "https://one.google.com/about/plans",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Business",
        pricePerSeat: 24,
        minSeats: 1,
        bestFor: ["writing", "research", "mixed"],
        features: ["Gemini for Workspace", "Admin controls"],
        sourceUrl: "https://workspace.google.com/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
  {
    toolName: "windsurf",
    displayName: "Windsurf",
    plans: [
      {
        name: "Free",
        pricePerSeat: 0,
        bestFor: ["coding"],
        features: ["Limited Flow actions", "Basic autocomplete"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Pro",
        pricePerSeat: 15,
        bestFor: ["coding"],
        features: ["Unlimited autocomplete", "Unlimited Flow actions"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: "2025-05-06",
      },
      {
        name: "Teams",
        pricePerSeat: 35,
        minSeats: 2,
        bestFor: ["coding"],
        features: ["Everything in Pro", "Centralized billing", "Admin dashboard"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedDate: "2025-05-06",
      },
    ],
  },
];

// Helper: get pricing for a specific tool
export function getToolPricing(toolName: ToolName): ToolPricing | undefined {
  return PRICING_DATA.find((t) => t.toolName === toolName);
}

// Helper: get a specific plan
export function getPlanInfo(
  toolName: ToolName,
  planName: string
): PlanInfo | undefined {
  return getToolPricing(toolName)?.plans.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase()
  );
}