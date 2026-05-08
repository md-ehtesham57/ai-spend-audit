import { NextRequest, NextResponse } from "next/server";
import { AuditResult } from "@/types";

function buildFallbackSummary(audit: AuditResult): string {
  const { formData, totalMonthlySavings, totalAnnualSavings } = audit;

  if (totalMonthlySavings < 100) {
    return `Your AI stack is well-optimized for a ${formData.teamSize}-person ${formData.useCase} team. You're making smart choices with your current tools and plans — each subscription is appropriately sized for your usage. We'll keep monitoring for new savings opportunities as pricing evolves across the AI landscape. No action needed right now.`;
  }

  if (totalMonthlySavings >= 500) {
    return `Your ${formData.teamSize}-person ${formData.useCase} team is significantly overspending on AI tools. At $${totalMonthlySavings.toFixed(0)}/month in identified savings — $${totalAnnualSavings.toFixed(0)}/year — the opportunity is substantial. The core issue is plan-to-team-size mismatch: you're paying for enterprise features your team size doesn't require. Credex can help you capture additional savings through discounted AI credits with no workflow changes.`;
  }

  return `Based on your audit, your ${formData.teamSize}-person ${formData.useCase} team could save $${totalMonthlySavings.toFixed(0)}/month — that's $${totalAnnualSavings.toFixed(0)}/year — by right-sizing your AI subscriptions. The savings come from switching to plans better matched to your actual team size and use case. These are straightforward changes with zero impact on your day-to-day workflow.`;
}

export async function POST(req: NextRequest) {
  try {
    const audit: AuditResult = await req.json();
    const summary = buildFallbackSummary(audit);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summary generation error:", error);
    return NextResponse.json({ summary: null });
  }
}