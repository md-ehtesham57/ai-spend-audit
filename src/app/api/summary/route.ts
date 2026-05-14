import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const auditResultSchema = z.object({
  id: z.string().min(1),
  formData: z.object({
    tools: z.array(z.object({
      tool: z.string().min(1),
      plan: z.string(),
      monthlySpend: z.number(),
      seats: z.number(),
    })),
    teamSize: z.number(),
    useCase: z.string(),
  }),
  toolResults: z.array(z.unknown()),
  totalMonthlySavings: z.number(),
  totalAnnualSavings: z.number(),
  createdAt: z.string(),
});

type AuditResult = z.infer<typeof auditResultSchema>;

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

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return false;
  if (!origin && !referer) return false;
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) return false;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host !== host) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as Record<string, unknown>;
    const parsed = auditResultSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid audit data" },
        { status: 400 }
      );
    }

    const ip = `summary:${getClientIp(req)}`;
    const RATE_LIMIT_WINDOW_MS = 60_000;
    const RATE_LIMIT_MAX = 30;

    const { data: existing } = await supabase
      .from("rate_limits")
      .select("count, last_request")
      .eq("ip", ip)
      .maybeSingle();

    const now = new Date().toISOString();

    if (existing) {
      const elapsed = Date.now() - new Date(existing.last_request).getTime();

      if (elapsed > RATE_LIMIT_WINDOW_MS) {
        await supabase
          .from("rate_limits")
          .update({ count: 1, last_request: now })
          .eq("ip", ip);
      } else if (existing.count >= RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 }
        );
      } else {
        await supabase
          .from("rate_limits")
          .update({ count: existing.count + 1, last_request: now })
          .eq("ip", ip);
      }
    } else {
      const { error: insertErr } = await supabase
        .from("rate_limits")
        .insert({ ip, count: 1, last_request: now });

      if (insertErr && insertErr.code !== "23505") {
        throw insertErr;
      }
    }

    const summary = buildFallbackSummary(parsed.data);
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Summary generation error:", message);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
