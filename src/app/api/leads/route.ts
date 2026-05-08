import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface LeadPayload {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  useCase: string;
  tools: object;
}

// Basic honeypot + rate limit check
function isAbuse(body: Record<string, string>, ip: string): boolean {
  // Honeypot field — bots fill this, humans don't see it
  if (body.website && body.website.length > 0) return true;
  // Block obviously fake emails
  if (!body.email.includes("@") || !body.email.includes(".")) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as LeadPayload & { website?: string };
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    // Abuse protection
    if (isAbuse(body as unknown as Record<string, string>, ip)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Rate limit: max 3 submissions per IP
    const { data: rateData } = await supabase
      .from("rate_limits")
      .select("count")
      .eq("ip", ip)
      .single();

    if (rateData && rateData.count >= 3) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // Upsert rate limit
    await supabase.from("rate_limits").upsert({
      ip,
      count: rateData ? rateData.count + 1 : 1,
      last_request: new Date().toISOString(),
    });

    // Save lead
    const { error } = await supabase.from("leads").insert({
      audit_id: body.auditId,
      email: body.email,
      company_name: body.companyName ?? null,
      role: body.role ?? null,
      team_size: body.teamSize ?? null,
      total_monthly_savings: body.totalMonthlySavings,
      total_annual_savings: body.totalAnnualSavings,
      use_case: body.useCase,
      tools: body.tools,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    );
  }
}