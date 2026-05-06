import { ToolEntry, ToolAuditResult, AuditFormData, UseCase } from "@/types";
import { getToolPricing, getPlanInfo } from "@/data/pricing";

// Helpers

function isPlanSuitableForUseCase(
  bestFor: UseCase[],
  useCase: UseCase
): boolean {
  return bestFor.includes(useCase) || bestFor.includes("mixed");
}

// per-tool autdit logic

function auditTool(entry: ToolEntry, formData: AuditFormData): ToolAuditResult {
  const { tool, plan, monthlySpend, seats } = entry;
  const { teamSize, useCase } = formData;
  const toolPricing = getToolPricing(tool);

  // Fallback if tool not found
  if (!toolPricing) {
    return {
      tool,
      currentPlan: plan,
      currentSpend: monthlySpend,
      recommendedAction: "No data available for this tool.",
      estimatedSpend: monthlySpend,
      monthlySavings: 0,
      reason: "Tool not found in pricing database.",
    };
  }

  const currentPlanInfo = getPlanInfo(tool, plan);
  const expectedSpend = currentPlanInfo
    ? currentPlanInfo.pricePerSeat * seats
    : monthlySpend;

  // Cursor 
  if (tool === "cursor") {
    // Business plan overkill for small teams without SSO needs
    if (plan === "Business" && seats <= 3 && useCase === "coding") {
      const proSpend = 20 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Downgrade to Pro",
        recommendedPlan: "Pro",
        estimatedSpend: proSpend,
        monthlySavings: monthlySpend - proSpend,
        reason: `Business plan adds SSO and admin controls — unnecessary for a ${seats}-person team. Pro gives the same coding features at $20/seat.`,
      };
    }
    // Overpaying vs expected price
    if (monthlySpend > expectedSpend * 1.1) {
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Audit your seat count",
        estimatedSpend: expectedSpend,
        monthlySavings: monthlySpend - expectedSpend,
        reason: `You're paying $${monthlySpend}/mo but ${seats} seats on ${plan} should cost $${expectedSpend}/mo. Check for unused seats.`,
      };
    }
  }

  // GitHub Copilot
  if (tool === "github_copilot") {
    // Enterprise overkill unless large team
    if (plan === "Enterprise" && seats < 20) {
      const businessSpend = 19 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Downgrade to Business",
        recommendedPlan: "Business",
        estimatedSpend: businessSpend,
        monthlySavings: monthlySpend - businessSpend,
        reason: `Enterprise adds fine-tuned models and docset search — only valuable at 20+ seats. Business plan covers all core features for your team size.`,
      };
    }
    // Suggest Cursor if primary use case is coding
    if (useCase === "coding" && plan === "Individual") {
      const cursorProSpend = 20 * seats;
      if (cursorProSpend <= monthlySpend * 1.1) {
        return {
          tool,
          currentPlan: plan,
          currentSpend: monthlySpend,
          recommendedAction: "Consider switching to Cursor Pro",
          recommendedPlan: "Cursor Pro",
          estimatedSpend: cursorProSpend,
          monthlySavings: monthlySpend - cursorProSpend,
          reason: `Cursor Pro offers deeper codebase context and agent-mode coding at a similar price. Better fit for coding-first teams.`,
        };
      }
    }
  }

  // Claude
  if (tool === "claude") {
    // Team plan minimum is 5 seats — overkill for small teams
    if (plan === "Team" && seats < 5) {
      const proSpend = 20 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Switch to individual Pro plans",
        recommendedPlan: "Pro",
        estimatedSpend: proSpend,
        monthlySavings: monthlySpend - proSpend,
        reason: `Claude Team requires a 5-seat minimum at $30/seat. For ${seats} users, individual Pro plans at $20/seat saves money with similar usage limits.`,
      };
    }
    // Max plan overkill unless heavy research
    if (plan === "Max" && useCase !== "research" && seats > 1) {
      const proSpend = 20 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Downgrade to Pro",
        recommendedPlan: "Pro",
        estimatedSpend: proSpend,
        monthlySavings: monthlySpend - proSpend,
        reason: `Claude Max is designed for extremely heavy research workloads. For ${useCase} use cases, Pro's limits are sufficient for most teams.`,
      };
    }
  }

  // ChatGPT
  if (tool === "chatgpt") {
    // Team for 2 users is overkill
    if (plan === "Team" && seats <= 2) {
      const plusSpend = 20 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Switch to Plus plans",
        recommendedPlan: "Plus",
        estimatedSpend: plusSpend,
        monthlySavings: monthlySpend - plusSpend,
        reason: `ChatGPT Team adds admin controls and data privacy — valuable at 5+ users. For ${seats} users, individual Plus plans are more cost-effective.`,
      };
    }
    // Enterprise for small team
    if (plan === "Enterprise" && seats < 10) {
      const teamSpend = 30 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Downgrade to Team",
        recommendedPlan: "Team",
        estimatedSpend: teamSpend,
        monthlySavings: monthlySpend - teamSpend,
        reason: `ChatGPT Enterprise is designed for 10+ seat organizations with compliance needs. Team plan covers all features your size requires.`,
      };
    }
  }

  // API tools (Anthropic / OpenAI)
  if (tool === "anthropic_api" || tool === "openai_api") {
    // High API spend — suggest credits
    if (monthlySpend > 500) {
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Buy discounted credits via Credex",
        estimatedSpend: monthlySpend * 0.7,
        monthlySavings: monthlySpend * 0.3,
        reason: `At $${monthlySpend}/mo in API spend, purchasing discounted credits through Credex can reduce costs by ~30% with no change to your workflow.`,
      };
    }
  }

  // Gemini
  if (tool === "gemini") {
    if (plan === "Business" && useCase !== "mixed" && seats <= 3) {
      const proSpend = 20 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Downgrade to Pro",
        recommendedPlan: "Pro",
        estimatedSpend: proSpend,
        monthlySavings: monthlySpend - proSpend,
        reason: `Gemini Business adds Workspace admin controls — only valuable if you're using Google Workspace deeply. Individual Pro plans are sufficient for your use case.`,
      };
    }
  }

  // Windsurf
  if (tool === "windsurf") {
    if (plan === "Teams" && seats <= 2) {
      const proSpend = 15 * seats;
      return {
        tool,
        currentPlan: plan,
        currentSpend: monthlySpend,
        recommendedAction: "Switch to individual Pro plans",
        recommendedPlan: "Pro",
        estimatedSpend: proSpend,
        monthlySavings: monthlySpend - proSpend,
        reason: `Windsurf Teams adds centralized billing and admin controls — unnecessary for ${seats} users. Individual Pro plans provide the same coding features.`,
      };
    }
  }

  // Default: already optimal
  return {
    tool,
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction: "No changes needed",
    estimatedSpend: monthlySpend,
    monthlySavings: 0,
    reason: `Your ${toolPricing.displayName} ${plan} plan looks well-matched to your team size and use case.`,
  };
}

// Main audit function

export function runAudit(formData: AuditFormData): {
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
} {
  const toolResults = formData.tools.map((entry) =>
    auditTool(entry, formData)
  );

  const totalMonthlySavings = toolResults.reduce(
    (sum, r) => sum + Math.max(0, r.monthlySavings),
    0
  );

  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
  };
}