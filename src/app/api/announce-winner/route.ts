import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { competitionId, competitionTitle, winnerName, winnerTicket } = await req.json();

    // Get all entrants for this competition
    const { data: entries, error } = await supabase
      .from("entries")
      .select("email, name")
      .eq("competition_id", competitionId);

    if (error) throw error;
    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No entries found" }, { status: 400 });
    }

    // Send email to each entrant
    const emails = entries.map((entry) => ({
      from: "Competition Portal <onboarding@resend.dev>",
      to: entry.email,
      subject: `Winner Announced: ${competitionTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111;">We have a winner!</h1>
          <p style="color: #555; margin-top: 8px;">Hi ${entry.name},</p>
          <p style="color: #555;">Thank you for entering <strong>${competitionTitle}</strong>.</p>
          <p style="color: #555;">We are excited to announce that the winning ticket has been drawn.</p>
          <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 24px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #888;">Winner</p>
            <p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #111;">${winnerName}</p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #888;">Ticket #${winnerTicket}</p>
          </div>
          <p style="color: #555;">Better luck next time — keep an eye out for future competitions!</p>
          <p style="color: #aaa; font-size: 12px; margin-top: 32px;">Competition Portal</p>
        </div>
      `,
    }));

    await Promise.all(emails.map((email) => resend.emails.send(email)));

    return NextResponse.json({ success: true, sent: emails.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
