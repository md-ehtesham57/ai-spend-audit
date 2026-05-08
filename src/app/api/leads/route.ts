import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAbuse(email: string, honeypot: string): boolean {
  if (honeypot && honeypot.length > 0) return true;
  if (!email.includes("@") || !email.includes(".")) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      auditId,
      email,
      companyName,
      role,
      teamSize,
      totalMonthlySavings,
      totalAnnualSavings,
      useCase,
      tools,
      website = "",
    } = body;

    // Abuse protection
    if (isAbuse(email, website)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    // Rate limit check
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
      audit_id: auditId,
      email,
      company_name: companyName ?? null,
      role: role ?? null,
      team_size: teamSize ?? null,
      total_monthly_savings: totalMonthlySavings,
      total_annual_savings: totalAnnualSavings,
      use_case: useCase,
      tools,
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