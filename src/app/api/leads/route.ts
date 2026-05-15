import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const leadSchema = z.object({
  auditId: z.string().min(1).max(100),
  email: z.string().email().max(255),
  companyName: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  teamSize: z.number().int().positive().max(100000).optional(),
  totalMonthlySavings: z.number().finite(),
  totalAnnualSavings: z.number().finite(),
  useCase: z.string().max(50),
  tools: z.array(z.unknown()),
  website: z.string().max(0),
});

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

function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

async function checkRateLimit(ip: string, max: number, windowMs: number): Promise<{ allowed: boolean }> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_ip: ip,
    p_max_count: max,
    p_window_ms: windowMs,
  });

  // If RPC fails (function not deployed), fail open — log the error
  if (error) {
    console.error("Rate limit RPC failed, allowing request:", error.message);
    return { allowed: true };
  }

  return { allowed: data?.allowed ?? true };
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

    const ip = `leads:${getClientIp(req)}`;
    const { allowed } = await checkRateLimit(ip, 3, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
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
