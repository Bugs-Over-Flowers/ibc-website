"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApplicationWithMembers } from "@/lib/types/application";

interface ExportPDFButtonProps {
  application: ApplicationWithMembers;
}

export default function ExportPDFButton({ application }: ExportPDFButtonProps) {
  const handleExport = () => {
    // Create a printable version of the application
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Application - ${application.companyName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #1a1a1a;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            h2 {
              color: #333;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 200px 1fr;
              gap: 10px;
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              color: #666;
            }
            .value {
              color: #1a1a1a;
            }
            .member-card {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 4px;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              background: #e5e7eb;
              border-radius: 4px;
              font-size: 12px;
              text-transform: uppercase;
            }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Membership Application</h1>
          
          <div class="info-grid">
            <div class="label">Application ID:</div>
            <div class="value">${application.applicationId}</div>
            
            <div class="label">Application Date:</div>
            <div class="value">${new Date(application.applicationDate).toLocaleDateString()}</div>
            
            <div class="label">Status:</div>
            <div class="value">${application.businessMemberId ? "Approved" : "Pending"}</div>
          </div>

          <h2>Company Information</h2>
          <div class="info-grid">
            <div class="label">Company Name:</div>
            <div class="value">${application.companyName}</div>
            
            <div class="label">Sector:</div>
            <div class="value">${application.Sector?.sectorName || "N/A"}</div>
            
            <div class="label">Website:</div>
            <div class="value">${application.websiteURL}</div>
            
            <div class="label">Address:</div>
            <div class="value">${application.companyAddress}</div>
            
            <div class="label">Application Type:</div>
            <div class="value">${application.applicationType}</div>
            
            <div class="label">Member Type:</div>
            <div class="value">${application.applicationMemberType}</div>
          </div>

          <h2>Contact Information</h2>
          <div class="info-grid">
            <div class="label">Email:</div>
            <div class="value">${application.emailAddress}</div>
            
            <div class="label">Mobile:</div>
            <div class="value">${application.mobileNumber}</div>
            
            <div class="label">Landline:</div>
            <div class="value">${application.landline}</div>
            
            <div class="label">Fax:</div>
            <div class="value">${application.faxNumber}</div>
          </div>

          <h2>Company Representatives</h2>
          ${application.ApplicationMember.map(
            (member) => `
            <div class="member-card">
              <h3>${member.firstName} ${member.lastName} <span class="badge">${member.companyMemberType}</span></h3>
              <div class="info-grid">
                <div class="label">Designation:</div>
                <div class="value">${member.companyDesignation}</div>
                
                <div class="label">Email:</div>
                <div class="value">${member.emailAddress}</div>
                
                <div class="label">Mobile:</div>
                <div class="value">${member.mobileNumber}</div>
                
                <div class="label">Birthdate:</div>
                <div class="value">${new Date(member.birthdate).toLocaleDateString()}</div>
                
                <div class="label">Nationality:</div>
                <div class="value">${member.nationality}</div>
                
                <div class="label">Sex:</div>
                <div class="value">${member.sex}</div>
                
                <div class="label">Mailing Address:</div>
                <div class="value">${member.mailingAddress}</div>
              </div>
            </div>
          `,
          ).join("")}

          <h2>Payment Information</h2>
          <div class="info-grid">
            <div class="label">Payment Method:</div>
            <div class="value">${application.paymentMethod}</div>
            
            <div class="label">Payment Status:</div>
            <div class="value">${application.paymentStatus}</div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
            <p>Iloilo Business Club - Membership Application</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Button onClick={handleExport} size="sm" variant="outline">
      <FileDown className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
}
