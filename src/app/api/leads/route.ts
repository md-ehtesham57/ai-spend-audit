import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const leadSchema = z.object({
  auditId: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.number().optional(),
  totalMonthlySavings: z.number(),
  totalAnnualSavings: z.number(),
  useCase: z.string(),
  tools: z.array(z.unknown()),
  website: z.string(),
});

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return false;
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

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json() as Record<string, unknown>;
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const { website } = parsed.data;

    // Honeypot check: website must be present and exactly empty string
    if (website !== "") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const RATE_LIMIT_WINDOW_MS = 60_000;
    const RATE_LIMIT_MAX = 3;

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

    const { error } = await supabase.from("leads").insert({
      audit_id: parsed.data.auditId,
      email: parsed.data.email,
      company_name: parsed.data.companyName ?? null,
      role: parsed.data.role ?? null,
      team_size: parsed.data.teamSize ?? null,
      total_monthly_savings: parsed.data.totalMonthlySavings,
      total_annual_savings: parsed.data.totalAnnualSavings,
      use_case: parsed.data.useCase,
      tools: parsed.data.tools,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
