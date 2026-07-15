import { deliverReportToGhl } from "@/lib/ghl-report";
import { CLINIC, BOOKING_URL, VIRTUAL_BOOKING_URL, VOUCHER } from "@/lib/constants";

export const runtime = "nodejs";

interface ReportRequest {
  lead?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  suitabilityLabel?: string;
  score?: number;
  pdfBase64?: string;
}

// POST /api/report — generate-side report PDF arrives here as base64; we upload it
// into GoHighLevel, attach it to the contact (note) and email the client a copy.
// Always returns 200 with a status summary so it never blocks the lead flow.
export async function POST(request: Request): Promise<Response> {
  let body: ReportRequest;
  try {
    body = (await request.json()) as ReportRequest;
  } catch {
    return Response.json({ ok: false, error: "invalid json" });
  }

  const lead = body.lead;
  if (!lead?.email || !body.pdfBase64) {
    return Response.json({ ok: false, skipped: true });
  }

  const first = (lead.firstName ?? "").trim();
  const last = (lead.lastName ?? "").trim();
  const label = body.suitabilityLabel ?? "";
  const score = Number.isFinite(body.score) ? body.score : undefined;

  const safeName = (first || "client").replace(/[^\w-]/g, "");
  const fileName = `LaserMD-Report-${safeName}.pdf`;
  const subject = `${first ? `${first}, your` : "Your"} LaseMD Ultra skin analysis report`;

  const emailHtml = `
    <div style="font-family:Helvetica,Arial,sans-serif;color:#484c4c;line-height:1.6">
      <p>Hi ${first || "there"},</p>
      <p>Thank you for taking the LaseMD Ultra skin analysis at
      <strong>${CLINIC.name}</strong> ${CLINIC.byline}. Your personalised report is
      attached as a PDF.</p>
      <p>It's a guide to help you prepare — your suitability is always confirmed in
      person. Book your free <strong>in-clinic consultation</strong> at our Truro
      clinic and a <strong>${VOUCHER.amount} welcome voucher</strong> is yours —
      redeemable when you sign up for a <strong>course of 3 treatments</strong> at ${CLINIC.name}.</p>
      <p><a href="${BOOKING_URL}" style="color:#c97c4a;font-weight:bold">Book your free in-clinic consultation →</a></p>
      <p style="font-size:13px">📍 Find us: ${CLINIC.name}, ${CLINIC.addressLines.join(", ")} —
      <a href="${CLINIC.mapsUrl}" style="color:#c97c4a">view on Google Maps</a>.</p>
      <p style="font-size:13px">Can't get to Truro just yet?
      <a href="${VIRTUAL_BOOKING_URL}" style="color:#6f8d8c">Book a free online consultation instead</a>.</p>
      <p style="color:#757575">— ${CLINIC.name}, ${CLINIC.tagline}</p>
    </div>`;

  const noteParts = ["📄 LaseMD Ultra skin analysis report"];
  if (label) noteParts.push(`— ${label}`);
  if (score !== undefined) noteParts.push(`(${score}/100)`);
  const noteBody = `${noteParts.join(" ")}: {url}`;

  const result = await deliverReportToGhl({
    firstName: first,
    lastName: last,
    email: lead.email,
    phone: lead.phone ?? "",
    pdfBase64: body.pdfBase64,
    fileName,
    subject,
    emailHtml,
    noteBody,
    // Send from the clinic's contact mailbox with a branded display name, instead
    // of GHL's default reply@ sender. Requires contact@medfacials.com to be a
    // verified sender in GHL.
    emailFrom: `Med Facials <${CLINIC.email}>`,
  });

  // Surface failures in the server log without leaking the PDF.
  if (!result.ok && !result.skipped) {
    console.error("[api/report] GHL delivery failed:", result.error);
  }
  return Response.json(result);
}
