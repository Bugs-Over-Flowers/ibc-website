"use client";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MemberDetailsByBusinessMemberId } from "@/server/members/queries/getMemberDetailsByBusinessMemberId";

interface ExportMemberPDFButtonProps {
  member: MemberDetailsByBusinessMemberId;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toLabel(value?: string | null): string {
  if (!value) return "N/A";
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusColor(status?: string | null): string {
  const s = status?.toLowerCase() ?? "";
  if (s === "paid" || s === "approved" || s === "active") return "#059669";
  if (s === "unpaid" || s === "pending") return "#d97706";
  if (s === "cancelled" || s === "rejected") return "#dc2626";
  return "#475569";
}

export default function ExportMemberPDFButton({
  member,
}: ExportMemberPDFButtonProps) {
  const handleExport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const latestApplication = member.latestApplication;
    const principalRepresentative = latestApplication?.members.find(
      (m) => m.companyMemberType === "principal",
    );
    const alternateRepresentatives =
      latestApplication?.members.filter(
        (m) => m.companyMemberType === "alternate",
      ) ?? [];

    const infoRow = (label: string, value: string) => `
      <tr>
        <td class="info-label">${escapeHtml(label)}</td>
        <td class="info-value">${escapeHtml(value)}</td>
      </tr>`;

    const statusChip = (status?: string | null) => {
      const color = statusColor(status);
      return `<span class="chip" style="background:${color}15;color:${color};border:1px solid ${color}30;">${escapeHtml(toLabel(status))}</span>`;
    };

    const repCard = (
      name: string,
      badgeText: string,
      isPrincipal: boolean,
      fields: [string, string][],
    ) => `
      <div class="rep-card ${isPrincipal ? "rep-principal" : ""}">
        <div class="rep-header">
          <span class="rep-name">${escapeHtml(name)}</span>
          <span class="badge ${isPrincipal ? "badge-principal" : "badge-alternate"}">${escapeHtml(badgeText)}</span>
        </div>
        <table class="rep-table">
          ${fields.map(([l, v]) => `<tr><td class="rep-label">${escapeHtml(l)}</td><td class="rep-value">${escapeHtml(v)}</td></tr>`).join("")}
        </table>
      </div>`;

    const allReps = [
      ...(principalRepresentative
        ? [
            repCard(
              `${principalRepresentative.firstName ?? "N/A"} ${principalRepresentative.lastName ?? ""}`.trim(),
              "Principal Representative",
              true,
              [
                [
                  "Designation",
                  principalRepresentative.companyDesignation ?? "N/A",
                ],
                [
                  "Email Address",
                  principalRepresentative.emailAddress ?? "N/A",
                ],
                [
                  "Mobile Number",
                  principalRepresentative.mobileNumber ?? "N/A",
                ],
                ["Landline", principalRepresentative.landline ?? "N/A"],
                [
                  "Date of Birth",
                  formatDate(principalRepresentative.birthdate),
                ],
                ["Nationality", principalRepresentative.nationality ?? "N/A"],
                ["Sex", toLabel(principalRepresentative.sex)],
                [
                  "Mailing Address",
                  principalRepresentative.mailingAddress ?? "N/A",
                ],
              ],
            ),
          ]
        : []),
      ...alternateRepresentatives.map((m, i) =>
        repCard(
          `${m.firstName ?? "N/A"} ${m.lastName ?? ""}`.trim(),
          `Alternate Representative${alternateRepresentatives.length > 1 ? ` ${i + 1}` : ""}`,
          false,
          [
            ["Designation", m.companyDesignation ?? "N/A"],
            ["Email Address", m.emailAddress ?? "N/A"],
            ["Mobile Number", m.mobileNumber ?? "N/A"],
            ["Landline", m.landline ?? "N/A"],
            ["Date of Birth", formatDate(m.birthdate)],
            ["Nationality", m.nationality ?? "N/A"],
            ["Sex", toLabel(m.sex)],
            ["Mailing Address", m.mailingAddress ?? "N/A"],
          ],
        ),
      ),
    ].join("");

    const generatedOn = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Member Information Record — ${escapeHtml(member.businessName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
      background: #ffffff;
      color: #0f1729;
      font-size: 12px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      max-width: 880px;
      margin: 0 auto;
      padding: 52px 56px;
    }

    /* ── Letterhead ── */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 32px;
      padding-bottom: 24px;
      margin-bottom: 0;
    }
    .letterhead-left { flex: 1; }

    .org-name {
      font-size: 19px;
      font-weight: 800;
      color: #0284c5;
      letter-spacing: -0.03em;
      line-height: 1.15;
    }
    .org-tagline {
      font-size: 10px;
      font-weight: 400;
      color: #64748b;
      font-style: italic;
      margin-top: 4px;
      letter-spacing: 0.01em;
    }
    .org-contact {
      margin-top: 12px;
      font-size: 10.5px;
      font-weight: 400;
      color: #64748b;
      line-height: 1.9;
    }
    .org-contact span { display: block; }
    .org-contact .contact-dot { color: #cbd5e1; margin: 0 5px; }

    .letterhead-seal {
      width: 68px;
      height: 68px;
      border: 2px solid #0284c5;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      gap: 2px;
    }
    .seal-ibc {
      font-size: 13px;
      font-weight: 800;
      color: #0284c5;
      letter-spacing: 0.05em;
      line-height: 1;
    }
    .seal-line {
      width: 36px;
      height: 1px;
      background: #0284c5;
      opacity: 0.5;
    }
    .seal-est {
      font-size: 8px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    /* ── Header rule ── */
    .header-rule {
      height: 3px;
      background: linear-gradient(to right, #0284c5, #38bdf8, #e0f2fe);
      border-radius: 2px;
      margin: 0 0 20px;
    }

    /* ── Doc sub-header ── */
    .sub-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .doc-type-label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.13em;
      color: #94a3b8;
      margin-bottom: 2px;
    }
    .doc-type-value {
      font-size: 14px;
      font-weight: 700;
      color: #0f1729;
      letter-spacing: -0.01em;
    }
    .doc-meta {
      text-align: right;
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.9;
    }
    .doc-meta strong {
      font-weight: 600;
      color: #334155;
    }

    /* ── Section ── */
    .section { margin-bottom: 24px; }

    .section-heading {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #0284c5;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-heading::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    /* ── Info table ── */
    .info-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .info-table { width: 100%; border-collapse: collapse; }
    .info-table tr:not(:last-child) td { border-bottom: 1px solid #f1f5f9; }
    .info-label {
      width: 200px;
      padding: 8.5px 14px;
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      background: #f8fafc;
      vertical-align: top;
      white-space: nowrap;
      border-right: 1px solid #f1f5f9;
    }
    .info-value {
      padding: 8.5px 14px;
      font-size: 11.5px;
      font-weight: 400;
      color: #0f1729;
      word-break: break-word;
    }

    /* ── Chip ── */
    .chip {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
      text-transform: capitalize;
    }

    /* ── Rep cards ── */
    .reps-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .rep-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }
    .rep-card.rep-principal { border-color: #7dd3fc; }
    .rep-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 13px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 8px;
    }
    .rep-principal .rep-header {
      background: #f0f9ff;
      border-bottom-color: #bae6fd;
    }
    .rep-name {
      font-size: 11.5px;
      font-weight: 700;
      color: #0f1729;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      white-space: nowrap;
    }
    .badge-principal { background: #0284c5; color: #f0f9ff; }
    .badge-alternate { background: #475569; color: #f8fafc; }

    .rep-table { width: 100%; border-collapse: collapse; }
    .rep-table tr:not(:last-child) td { border-bottom: 1px solid #f1f5f9; }
    .rep-label {
      width: 118px;
      padding: 6px 13px;
      font-size: 10.5px;
      font-weight: 500;
      color: #64748b;
      background: #fafbfc;
      white-space: nowrap;
      vertical-align: top;
      border-right: 1px solid #f1f5f9;
    }
    .rep-value {
      padding: 6px 13px;
      font-size: 11px;
      color: #0f1729;
      word-break: break-word;
    }

    .empty-state {
      padding: 18px;
      color: #94a3b8;
      font-style: italic;
      text-align: center;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 11.5px;
    }

    /* ── Certification ── */
    .certification {
      margin-top: 8px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #0284c5;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 400;
      color: #64748b;
      font-style: italic;
      line-height: 1.7;
    }

    /* ── Signature ── */
    .signature-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
      margin-bottom: 36px;
    }
    .signature-block { text-align: center; }
    .signature-line {
      width: 210px;
      border-top: 1.5px solid #334155;
      padding-top: 6px;
      margin-top: 40px;
    }
    .sig-name {
      font-size: 11px;
      font-weight: 700;
      color: #0f1729;
    }
    .sig-title {
      font-size: 10px;
      font-weight: 400;
      color: #64748b;
      margin-top: 1px;
    }

    /* ── Footer ── */
    .doc-footer {
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 9.5px;
      color: #94a3b8;
      line-height: 1.9;
    }
    .footer-org {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 1px;
    }
    .footer-right { text-align: right; }

    @media print {
      body { background: #fff; }
      .page { padding: 28px 36px; }
      .rep-card, .info-card, .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Letterhead -->
  <div class="letterhead">
    <div class="letterhead-left">
      <div class="org-name">Iloilo Business Club, Inc.</div>
      <div class="org-tagline">Sustaining the Momentum for Progress since 1990</div>
      <div class="org-contact">
        <span>GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St., Iloilo City 5000</span>
        <span>(033) 337-8341 <span class="contact-dot">&bull;</span> iloilobusinessclub1990@gmail.com</span>
      </div>
    </div>
    <div class="letterhead-seal">
      <div class="seal-ibc">IBC</div>
      <div class="seal-line"></div>
      <div class="seal-est">Est. 1990</div>
    </div>
  </div>

  <div class="header-rule"></div>

  <!-- Sub-header -->
  <div class="sub-header">
    <div>
      <div class="doc-type-label">Document Type</div>
      <div class="doc-type-value">Member Information Record</div>
    </div>
    <div class="doc-meta">
      <div><strong>Date Generated:</strong> ${escapeHtml(generatedOn)}</div>
      <div><strong>Member ID:</strong> ${escapeHtml(member.identifier ?? "N/A")}</div>
    </div>
  </div>

  <!-- I. Member Information -->
  <div class="section">
    <div class="section-heading">I &nbsp; Member Information</div>
    <div class="info-card">
      <table class="info-table">
        ${infoRow("Business Name", member.businessName ?? "N/A")}
        ${infoRow("Member Identifier", member.identifier ?? "N/A")}
        ${infoRow("Industry / Sector", member.sectorName ?? "N/A")}
        ${infoRow("Website", member.websiteURL ?? "N/A")}
        <tr>
          <td class="info-label">Membership Status</td>
          <td class="info-value">${statusChip(member.membershipStatus)}</td>
        </tr>
        ${infoRow("Date of Membership", formatDate(member.joinDate))}
        ${infoRow("Membership Expiry", formatDate(member.membershipExpiryDate))}
      </table>
    </div>
  </div>

  <!-- II. Latest Application -->
  <div class="section">
    <div class="section-heading">II &nbsp; Latest Application Details</div>
    <div class="info-card">
      <table class="info-table">
        ${infoRow("Application Reference No.", latestApplication?.applicationId ?? "N/A")}
        ${infoRow("Date Submitted", formatDate(latestApplication?.applicationDate ?? null))}
        <tr>
          <td class="info-label">Application Status</td>
          <td class="info-value">${statusChip(latestApplication?.applicationStatus)}</td>
        </tr>
        <tr>
          <td class="info-label">Payment Proof Status</td>
          <td class="info-value">${statusChip(latestApplication?.paymentProofStatus)}</td>
        </tr>
        ${infoRow("Company Address", latestApplication?.companyAddress ?? "N/A")}
        ${infoRow("Email Address", latestApplication?.emailAddress ?? "N/A")}
        ${infoRow("Mobile Number", latestApplication?.mobileNumber ?? "N/A")}
        ${infoRow("Landline Number", latestApplication?.landline ?? "N/A")}
      </table>
    </div>
  </div>

  <!-- III. Representatives -->
  <div class="section">
    <div class="section-heading">III &nbsp; Authorized Representatives</div>
    ${
      allReps
        ? `<div class="reps-grid">${allReps}</div>`
        : '<div class="empty-state">No representative records on file.</div>'
    }
  </div>

  <!-- Certification -->
  <div class="certification">
    This document is an official Member Information Record issued by the Iloilo Business Club, Inc.
    The information contained herein is confidential and intended solely for authorized club use.
    Unauthorized reproduction, distribution, or disclosure of this document is strictly prohibited.
  </div>

  <!-- Signature -->
  <div class="signature-row">
    <div class="signature-block">
      <div class="signature-line">
        <div class="sig-name">Authorized Signatory</div>
        <div class="sig-title">Iloilo Business Club, Inc.</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="doc-footer">
    <div>
      <div class="footer-org">Iloilo Business Club, Inc.</div>
      <div>GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St., Iloilo City 5000</div>
      <div>Member Information Record &mdash; Strictly Confidential</div>
    </div>
    <div class="footer-right">
      <div>Generated: ${escapeHtml(generatedOn)}</div>
      <div>Page 1 of 1</div>
    </div>
  </div>

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button
      className="gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      onClick={handleExport}
      size="sm"
      variant="outline"
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
