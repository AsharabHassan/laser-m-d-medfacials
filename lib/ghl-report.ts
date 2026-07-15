import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
// Delivers the suitability report PDF into GoHighLevel via the Private
// Integration: uploads the file, upserts the contact (deduped by email), pins a
// note with the link on the contact, and emails the client a copy with the PDF
// attached. No-ops cleanly when the GHL env isn't configured, and never throws —
// report delivery must never block the lead flow.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://services.leadconnectorhq.com";
const VERSION = "2021-07-28";

function creds(): { token: string; locationId: string } | null {
  const token = process.env.GHL_API_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return null;
  if (token.includes("REPLACE") || locationId.includes("REPLACE")) return null;
  return { token, locationId };
}

export interface DeliverInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pdfBase64: string;
  fileName: string;
  subject: string;
  emailHtml: string;
  noteBody: string; // may contain "{url}" placeholder
  /** Optional "From" for the outbound email, e.g. `Med Facials <contact@medfacials.com>`.
   *  When omitted, GHL falls back to the location's default sending identity. The
   *  address/domain must be a verified sender in GHL or the send will fail. */
  emailFrom?: string;
}

export interface DeliverResult {
  ok: boolean;
  skipped?: boolean;
  fileUrl?: string;
  contactId?: string;
  emailed?: boolean;
  noted?: boolean;
  error?: string;
}

export async function deliverReportToGhl(
  input: DeliverInput,
): Promise<DeliverResult> {
  const c = creds();
  if (!c) return { ok: false, skipped: true };

  const auth = {
    Authorization: `Bearer ${c.token}`,
    Version: VERSION,
    Accept: "application/json",
  };

  try {
    // 1 ── upload the PDF to the media library → hosted URL
    const bytes = Buffer.from(input.pdfBase64, "base64");
    const form = new FormData();
    form.append(
      "file",
      new Blob([bytes], { type: "application/pdf" }),
      input.fileName,
    );
    form.append("hosted", "false");
    form.append("name", input.fileName);
    form.append("locationId", c.locationId);
    const up = await fetch(`${BASE}/medias/upload-file`, {
      method: "POST",
      headers: auth, // do NOT set Content-Type — fetch adds the multipart boundary
      body: form,
    });
    const upj = (await up.json().catch(() => ({}))) as { url?: string };
    if (!up.ok || !upj.url) {
      return { ok: false, error: `media-upload ${up.status}` };
    }
    const fileUrl = upj.url;

    // 2 ── upsert the contact (deduped by email) → contactId, and write the report
    // URL into the custom field so downstream GHL automations read it as
    // structured data. Prefer referencing the field by its GHL id (the reliable
    // way on the v2 upsert — GHL silently drops an unknown id/key without error);
    // fall back to the field key. We log what GHL echoes back so a dropped write
    // is visible instead of silently succeeding.
    const fieldId = (process.env.GHL_REPORT_FIELD_ID || "").trim();
    // NB: the GHL field key is spelled "lasemd" (no "r") — it must match the
    // location's field exactly or GHL silently drops the write. Override with
    // GHL_REPORT_FIELD_KEY / GHL_REPORT_FIELD_ID if the field ever changes.
    const fieldKey = (
      process.env.GHL_REPORT_FIELD_KEY || "lasemd_report_pdf"
    ).trim();
    const customField = fieldId
      ? { id: fieldId, field_value: fileUrl }
      : fieldKey
        ? { key: fieldKey, field_value: fileUrl }
        : null;
    const upsertBody: Record<string, unknown> = {
      locationId: c.locationId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    };
    if (customField) {
      upsertBody.customFields = [customField];
    }
    const us = await fetch(`${BASE}/contacts/upsert`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(upsertBody),
    });
    const usj = (await us.json().catch(() => ({}))) as {
      contact?: { id?: string; customFields?: Array<{ id?: string }> };
    };
    const contactId = usj.contact?.id;
    // Make a dropped custom-field write visible: GHL returns the contact's
    // customFields by id, so when we write by id we can confirm it landed.
    if (customField) {
      const echoed = usj.contact?.customFields ?? [];
      const landed = fieldId
        ? echoed.some((f) => f.id === fieldId)
        : "unknown (writing by key — set GHL_REPORT_FIELD_ID to verify)";
      console.log(
        `[api/report] report custom-field write: status=${us.status} ` +
          `ref=${fieldId ? `id:${fieldId}` : `key:${fieldKey}`} ` +
          `landed=${landed} fieldsReturned=${echoed.length}`,
      );
    }
    if (!contactId) {
      return { ok: false, fileUrl, error: `contact-upsert ${us.status}` };
    }

    // 3 ── pin a note with the report link on the contact (always lands)
    let noted = false;
    try {
      const nt = await fetch(`${BASE}/contacts/${contactId}/notes`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ body: input.noteBody.replace("{url}", fileUrl) }),
      });
      noted = nt.ok;
    } catch {
      /* non-fatal */
    }

    // 4 ── email the client a copy with the PDF attached (also logs on the contact)
    let emailed = false;
    try {
      const em = await fetch(`${BASE}/conversations/messages`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "Email",
          contactId,
          ...(input.emailFrom ? { emailFrom: input.emailFrom } : {}),
          subject: input.subject,
          html: input.emailHtml,
          attachments: [fileUrl],
        }),
      });
      emailed = em.ok;
    } catch {
      /* non-fatal — the report is still on the contact via the note + media */
    }

    return { ok: true, fileUrl, contactId, emailed, noted };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ghl-error" };
  }
}
