// ============================================================================
// SUPABASE EDGE FUNCTION: sync-sheet-and-email
// Hardened according to /secure-hybrid-web-architect (Public Web Patch):
// - GOOGLE_SHEET_SECRET_TOKEN and RESEND_API_KEY are stored strictly in
//   Supabase Secrets (Deno.env), NEVER exposed to browser clients.
// ============================================================================

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const payload = await req.json();
    const sheetWebhookUrl = Deno.env.get("GOOGLE_SHEET_WEBHOOK_URL");
    const sheetSecretToken = Deno.env.get("GOOGLE_SHEET_SECRET_TOKEN");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // 1. One-way Server-to-Server Sync to Google Sheet Dashboard
    if (sheetWebhookUrl && sheetSecretToken) {
      await fetch(sheetWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sheetSecretToken,
          record: payload.record,
          eventType: payload.type || "NEW_LEAD_OR_LEARNER"
        })
      });
    }

    // 2. Send Automated Course Material Email to Learner / Notification to Host
    if (resendApiKey && payload.record?.email) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "ThuysTalk Academy <academy@thuystalk.vn>",
          to: [payload.record.email],
          bcc: ["tthuyn@erktransport.com"],
          subject: "[ThuysTalk] Bộ Tài Liệu & Biểu Mẫu Thực Chiến Xuất Nhập Khẩu",
          html: `
            <h2>Xin chào ${payload.record.full_name || "bạn"},</h2>
            <p>Cảm ơn bạn đã học tập và kết nối tại <strong>ThuysTalk (Nguyễn Thị Ngọc Thúy)</strong>.</p>
            <p>Chủ đề bạn quan tâm: <strong>${payload.record.topic || "E-Learning Thực Chiến"}</strong></p>
            <p>Đội ngũ chuyên môn sẽ phản hồi chi tiết qua Email / Zalo của bạn trong vòng 24 giờ.</p>
          `
        })
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
