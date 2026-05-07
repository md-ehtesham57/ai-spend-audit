import { runAudit } from "@/lib/auditEngine";
import { AuditFormData } from "@/types";

// ─── Test 1: Cursor Business overkill for small team ────────────────────────
test("Cursor Business plan flagged as overkill for team of 2", () => {
  const formData: AuditFormData = {
    tools: [{ tool: "cursor", plan: "Business", monthlySpend: 80, seats: 2 }],
    teamSize: 2,
    useCase: "coding",
  };

  const { toolResults } = runAudit(formData);
  const result = toolResults[0];

  expect(result.recommendedAction).toBe("Downgrade to Pro");
  expect(result.monthlySavings).toBe(40); // 80 - (20*2)
  expect(result.recommendedPlan).toBe("Pro");
});

// ─── Test 2: ChatGPT Team for 2 users is overkill ───────────────────────────
test("ChatGPT Team plan flagged as overkill for 2 users", () => {
  const formData: AuditFormData = {
    tools: [{ tool: "chatgpt", plan: "Team", monthlySpend: 60, seats: 2 }],
    teamSize: 2,
    useCase: "writing",
  };

  const { toolResults } = runAudit(formData);
  const result = toolResults[0];

  expect(result.recommendedAction).toBe("Switch to Plus plans");
  expect(result.monthlySavings).toBe(20); // 60 - (20*2)
});

// ─── Test 3: High Anthropic API spend triggers Credex recommendation ─────────
test("Anthropic API spend over $500 triggers Credex credits recommendation", () => {
  const formData: AuditFormData = {
    tools: [
      {
        tool: "anthropic_api",
        plan: "Pay-as-you-go",
        monthlySpend: 800,
        seats: 1,
      },
    ],
    teamSize: 3,
    useCase: "mixed",
  };

  const { toolResults } = runAudit(formData);
  const result = toolResults[0];

  expect(result.recommendedAction).toBe("Buy discounted credits via Credex");
  expect(result.monthlySavings).toBe(240); // 800 * 0.3
});

// ─── Test 4: Well-configured stack returns zero savings ──────────────────────
test("Optimal stack returns zero total savings", () => {
  const formData: AuditFormData = {
    tools: [
      { tool: "cursor", plan: "Pro", monthlySpend: 20, seats: 1 },
      { tool: "claude", plan: "Pro", monthlySpend: 20, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  };

  const { totalMonthlySavings, totalAnnualSavings } = runAudit(formData);

  expect(totalMonthlySavings).toBe(0);
  expect(totalAnnualSavings).toBe(0);
});

// ─── Test 5: Annual savings is exactly 12x monthly savings ───────────────────
test("Annual savings is exactly 12x monthly savings", () => {
  const formData: AuditFormData = {
    tools: [
      { tool: "cursor", plan: "Business", monthlySpend: 160, seats: 3 },
      { tool: "chatgpt", plan: "Enterprise", monthlySpend: 300, seats: 4 },
    ],
    teamSize: 5,
    useCase: "mixed",
  };

  const { totalMonthlySavings, totalAnnualSavings } = runAudit(formData);

  expect(totalAnnualSavings).toBe(totalMonthlySavings * 12);
  expect(totalMonthlySavings).toBeGreaterThan(0);
});