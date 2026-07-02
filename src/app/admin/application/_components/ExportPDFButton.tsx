"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMembershipPaymentRequirement } from "@/lib/membership/paymentRules";
import type { ApplicationWithMembers } from "@/lib/types/application";

interface ExportPDFButtonProps {
  application: ApplicationWithMembers;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const applicationTypeLabels: Record<string, string> = {
  newMember: "New Member",
  renewal: "Renewal",
  updating: "Update Info",
};

const applicationTypeColors: Record<string, string> = {
  newMember: "background:#05966915;color:#059669;border:1px solid #05966950",
  renewal: "background:#ea580c15;color:#ea580c;border:1px solid #ea580c50",
  updating: "background:#2563eb15;color:#2563eb;border:1px solid #2563eb50",
};

const memberTypeColors: Record<string, string> = {
  corporate: "background:#0284c5;color:#f0f9ff",
  personal: "background:#6366f1;color:#f0f9ff",
};

function toTitleCase(value: string): string {
  if (!value || value === "N/A") return value;
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === "approved" || s === "accepted")
    return "background:#05966915;color:#059669;border:1px solid #05966950";
  if (s === "pending" || s === "interview_scheduled")
    return "background:#ea580c15;color:#ea580c;border:1px solid #ea580c50";
  if (s === "rejected")
    return "background:#dc262615;color:#dc2626;border:1px solid #dc262650";
  return "background:#2563eb15;color:#2563eb;border:1px solid #2563eb50";
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

export default function ExportPDFButton({ application }: ExportPDFButtonProps) {
  const handleExport = () => {
    const paymentRequirement = getMembershipPaymentRequirement({
      applicationMemberType: application.applicationMemberType,
      applicationType: application.applicationType,
      previousApplicationMemberType: application.previousApplicationMemberType,
    });

    const generatedOn = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });

    const applicationTypeLabel =
      applicationTypeLabels[application.applicationType] ??
      application.applicationType;
    const applicationTypeStyle =
      applicationTypeColors[application.applicationType] ?? "";
    const memberTypeStyle =
      memberTypeColors[application.applicationMemberType] ?? "";

    const appStatus = application.businessMemberId
      ? "approved"
      : application.applicationStatus;
    const appStatusLabel = toTitleCase(appStatus);
    const appStatusStyle = statusColor(appStatus);

    const paymentStatus = application.paymentStatus ?? "pending";
    const paymentStatusLabel = toTitleCase(paymentStatus);
    const paymentStatusStyle = statusColor(paymentStatus);

    const infoRow = (label: string, value: string) => `
      <tr>
        <td class="info-label">${escapeHtml(label)}</td>
        <td class="info-value">${escapeHtml(value)}</td>
      </tr>`;

    const repCard = (
      member: ApplicationWithMembers["ApplicationMember"][number],
      badgeText: string,
      isPrincipal: boolean,
    ) => {
      const badgeStyle = isPrincipal
        ? "background:#0284c5;color:#f0f9ff"
        : "background:#475569;color:#f8fafc";
      const repFields: [string, string][] = [
        ["Designation", member.companyDesignation ?? "N/A"],
        ["Email Address", member.emailAddress ?? "N/A"],
        ["Mobile Number", member.mobileNumber ?? "N/A"],
        ["Date of Birth", formatDate(member.birthdate)],
        ["Nationality", member.nationality ?? "N/A"],
        ["Sex", escapeHtml(toTitleCase(member.sex ?? "N/A"))],
        ["Mailing Address", member.mailingAddress ?? "N/A"],
      ];
      return `
      <div class="rep-card ${isPrincipal ? "rep-principal" : ""}">
        <div class="rep-header">
          <span class="rep-name">${escapeHtml(`${member.firstName} ${member.lastName}`)}</span>
          <span class="badge" style="${badgeStyle}">${escapeHtml(badgeText)}</span>
        </div>
        <table class="rep-table">
          ${repFields.map(([l, v]) => `<tr><td class="rep-label">${escapeHtml(l)}</td><td class="rep-value">${escapeHtml(v)}</td></tr>`).join("")}
        </table>
      </div>`;
    };

    const principalMembers = application.ApplicationMember.filter(
      (m) => m.companyMemberType === "principal",
    );
    const alternateMembers = application.ApplicationMember.filter(
      (m) => m.companyMemberType === "alternate",
    );

    const allReps = [
      ...principalMembers.map((m) => repCard(m, "Principal", true)),
      ...alternateMembers.map((m, i) =>
        repCard(
          m,
          `Alternate${alternateMembers.length > 1 ? ` ${i + 1}` : ""}`,
          false,
        ),
      ),
    ].join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Application — ${escapeHtml(application.companyName)}</title>
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

    /* Letterhead */
    .letterhead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 32px;
      padding-bottom: 24px;
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

    .header-rule {
      height: 3px;
      background: linear-gradient(to right, #0284c5, #38bdf8, #e0f2fe);
      border-radius: 2px;
      margin: 0 0 20px;
    }

    /* Sub-header */
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

    /* Identifier block */
    .identifier-block {
      margin-bottom: 28px;
      padding: 14px 16px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .identifier-label {
      font-size: 9px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      color: #0369a1;
      margin-bottom: 3px;
    }
    .identifier-value {
      font-size: 15px;
      font-weight: 800;
      color: #0c4a6e;
      letter-spacing: -0.01em;
    }
    .identifier-tip {
      font-size: 9.5px;
      font-weight: 400;
      color: #0369a1;
      opacity: 0.75;
      margin-top: 2px;
    }

    /* Sections */
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

    /* Info table */
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

    /* Chips and badges */
    .chip {
      display: inline-block;
      padding: 2px 9px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
      text-transform: capitalize;
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
    .badge-type {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    /* Rep cards */
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

    /* Footer */
    .doc-footer {
      margin-top: 36px;
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
        <span>(033) 337-8341 &bull; iloilobusinessclub1990@gmail.com</span>
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
      <div class="doc-type-value">Membership Application</div>
    </div>
    <div class="doc-meta">
      <div><strong>Date Generated:</strong> ${escapeHtml(generatedOn)}</div>
    </div>
  </div>

  <!-- Application Identifier -->
  <div class="identifier-block">
    <div>
      <div class="identifier-label">Application Identifier</div>
      <div class="identifier-value">${escapeHtml(application.identifier)}</div>
      <div class="identifier-tip">Use this to track your application.</div>
    </div>
    <div style="text-align:right;">
      <div class="identifier-label" style="margin-bottom:2px;">Application Type</div>
      <span class="badge-type" style="${applicationTypeStyle}">${escapeHtml(applicationTypeLabel)}</span>
    </div>
  </div>

  <!-- I. Membership Information -->
  <div class="section">
    <div class="section-heading">I &nbsp; Membership Information</div>
    <div class="info-card">
      <table class="info-table">
        ${infoRow("Company Name", application.companyName ?? "N/A")}
        ${infoRow("Sector", application.sectorName ?? "N/A")}
        ${infoRow("Company Address", application.companyAddress ?? "N/A")}
        ${infoRow("Company Profile", application.companyProfileType === "image" || application.companyProfileType === "document" ? `Uploaded ${application.companyProfileType}` : (application.websiteURL ?? "N/A"))}
        <tr>
          <td class="info-label">Member Type</td>
          <td class="info-value"><span class="badge" style="${memberTypeStyle}">${escapeHtml(application.applicationMemberType)}</span></td>
        </tr>
        ${infoRow("Email Address", application.emailAddress ?? "N/A")}
        ${infoRow("Mobile Number", application.mobileNumber ?? "N/A")}
        ${infoRow("Landline", application.landline ?? "N/A")}
        <tr>
          <td class="info-label">Application Status</td>
          <td class="info-value"><span class="badge-type" style="${appStatusStyle}">${escapeHtml(appStatusLabel)}</span></td>
        </tr>
      </table>
    </div>
  </div>

  <!-- II. Authorized Representatives -->
  <div class="section">
    <div class="section-heading">II &nbsp; Authorized Representatives</div>
    ${
      allReps
        ? `<div class="reps-grid">${allReps}</div>`
        : '<div class="empty-state">No representative records on file.</div>'
    }
  </div>

  <!-- III. Payment Information -->
  ${
    paymentRequirement.requiresPayment
      ? `
  <div class="section">
    <div class="section-heading">III &nbsp; Payment Information</div>
    <div class="info-card">
      <table class="info-table">
        ${infoRow("Payment Method", application.paymentMethod ?? "N/A")}
        <tr>
          <td class="info-label">Payment Status</td>
          <td class="info-value"><span class="badge-type" style="${paymentStatusStyle}">${escapeHtml(paymentStatusLabel)}</span></td>
        </tr>
        ${infoRow("Expected Amount", `P${paymentRequirement.expectedAmount.toLocaleString()}`)}
      </table>
    </div>
  </div>
  `
      : ""
  }

  <!-- Footer -->
  <div class="doc-footer">
    <div>
      <div class="footer-org">Iloilo Business Club, Inc.</div>
      <div>GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St., Iloilo City 5000</div>
      <div>Membership Application &mdash; Confidential</div>
    </div>
    <div class="footer-right">
      <div>Generated: ${escapeHtml(generatedOn)}</div>
      <div>Page 1 of 1</div>
    </div>
  </div>

</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = url;
    document.body.appendChild(iframe);

    const cleanup = () => {
      window.removeEventListener("afterprint", cleanup);
      iframe.remove();
      URL.revokeObjectURL(url);
    };

    iframe.onload = () => {
      iframe.contentWindow?.print();
      window.addEventListener("afterprint", cleanup);
    };
  };

  return (
    <Button onClick={handleExport} size="sm" variant="outline">
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
}
