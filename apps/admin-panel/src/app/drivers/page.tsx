'use client';
import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import { createNotification } from '@omnigo/api';

type DocumentItem = { name: string; docNumber: string; issuedDate: string; expiryDate: string; status: 'Pending' | 'Verified' | 'Rejected'; notes?: string };
type PartnerRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  pincode: string;
  dob: string;
  emergencyContact: { name: string; relation: string; phone: string };
  aadharNumber: string;
  panNumber: string;
  bankDetails: { accountHolder: string; bankName: string; accountNumber: string; ifsc: string; payoutUpi?: string };
  kycStatus: string;
  verifiedAt?: string;
  verifiedBy?: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleChassis: string;
  vehicleEngine: string;
  vehicleModelYear: string;
  vehicleCapacity: string;
  documents: Record<string, DocumentItem>;
  totalTrips: number;
  acceptanceRate: number;
  cancellationRate: number;
  onlineHours: string;
  rating: number;
  walletBalance: string;
  complaintsCount: number;
  joinedDate: string;
};
export default function PartnerManagementPage() {
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecord | null>(null);
  const [previewPdfPartner, setPreviewPdfPartner] = useState<PartnerRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [notificationModalData, setNotificationModalData] = useState<{
    partner: PartnerRecord;
    smsText: string;
    whatsappText: string;
    pushText: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('API error');
        const { drivers: live } = await res.json();
        if (live && live.length > 0) {
          // Map DB driver shape to PartnerRecord shape for the UI
          const mapped = live.map((d: any): PartnerRecord => ({
            id: d.id || 'N/A',
            name: d.name || 'Unknown',
            phone: d.phone || '',
            email: d.email || '',
            city: d.city || 'Unknown',
            address: d.address || '',
            pincode: d.pincode || '',
            dob: d.dob || '',
            emergencyContact: d.emergencyContact || { name: '', relation: '', phone: '' },
            aadharNumber: d.aadharNumber || '—',
            panNumber: d.panNumber || '',
            bankDetails: d.bankDetails || { accountHolder: '', bankName: '', accountNumber: '', ifsc: '', payoutUpi: '' },
            kycStatus: d.kyc_status === 'verified' ? 'Verified' : d.kyc_status === 'pending' ? 'Pending Review' : d.kyc_status === 'rejected' ? 'Action Required' : (d.kycStatus || 'Pending Review'),
            verifiedAt: d.verifiedAt || undefined,
            verifiedBy: d.verifiedBy || undefined,
            vehicleType: d.vehicleType || d.vehicle_type || 'Unknown',
            vehiclePlate: d.vehiclePlate || d.vehicle_plate || '',
            vehicleChassis: d.vehicleChassis || '',
            vehicleEngine: d.vehicleEngine || '',
            vehicleModelYear: d.vehicleModelYear || '',
            vehicleCapacity: d.vehicleCapacity || '',
            documents: d.documents || {
              dl: { name: 'Commercial Driving License', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              rc: { name: 'Registration Certificate', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              insurance: { name: 'Commercial Insurance', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              fitness: { name: 'Fitness Certificate', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              puc: { name: 'PUC Certificate', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              policeVerification: { name: 'Police Clearance', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
              truckInspection: { name: 'Vehicle Safety Audit', docNumber: '', issuedDate: '', expiryDate: '', status: 'Pending' },
            },
            totalTrips: d.totalTrips || d.total_trips || 0,
            acceptanceRate: d.acceptanceRate || 0,
            cancellationRate: d.cancellationRate || 0,
            onlineHours: d.onlineHours || '0 hrs',
            rating: Number(d.rating || 0),
            walletBalance: d.walletBalance || `₹${Number(d.wallet_balance || 0).toLocaleString('en-IN')}`,
            complaintsCount: d.complaintsCount || 0,
            joinedDate: d.joinedDate || d.joined_date || '',
          }));
          setPartners(mapped);
        }
      } catch (e) {
        console.error('[Drivers]', e);
      }
    }
    load();
  }, []);

  const filteredPartners = partners.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'pending') return p.kycStatus === 'Pending Review';
    if (filter === 'verified') return p.kycStatus === 'Verified';
    if (filter === 'suspended') return p.kycStatus === 'Suspended' || p.kycStatus === 'Action Required';
    return true;
  });

  // Manual Document Status Toggle
  const handleUpdateDocStatus = (docKey: keyof PartnerRecord['documents'], newStatus: 'Verified' | 'Pending' | 'Rejected') => {
    if (!selectedPartner) return;
    const updatedDocs = {
      ...selectedPartner.documents,
      [docKey]: {
        ...selectedPartner.documents[docKey],
        status: newStatus,
      },
    };

    const updatedPartner = {
      ...selectedPartner,
      documents: updatedDocs,
    };

    setSelectedPartner(updatedPartner);
    setPartners(prev => prev.map(p => p.id === updatedPartner.id ? updatedPartner : p));
  };

  // Check if all 7 mandatory documents are manually verified
  const allDocsVerified = (partner: PartnerRecord) => {
    const docs = Object.values(partner.documents);
    return docs.length === 7 && docs.every(d => d.status === 'Verified');
  };

  const getVerifiedDocsCount = (partner: PartnerRecord) => {
    return Object.values(partner.documents).filter(d => d.status === 'Verified').length;
  };

  // Final manual verification approval trigger
  const handleApproveAndNotifyDriver = async (partner: PartnerRecord) => {
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const updated: PartnerRecord = {
      ...partner,
      kycStatus: 'Verified',
      verifiedAt: `${timestamp} IST`,
      verifiedBy: 'SuperAdmin (ID: OMNI-ADM-01)',
    };

    setPartners(prev => prev.map(p => p.id === partner.id ? updated : p));
    setSelectedPartner(updated);

    // Prepare simulated multi-channel dispatch notification
    const smsMessage = `🎉 Welcome to OmniGo Partner Network! Your partner account (${partner.id}) and vehicle (${partner.vehiclePlate}) have been VERIFIED and activated by OmniGo HQ. You can now open the OmniGo Driver App, toggle Online, and start accepting nearby towing jobs to earn!`;
    const whatsappMessage = `🚗 *OmniGo Partner Activation Confirmation*\n\nHello *${partner.name}*,\n\nGreat news! Your KYC documents and vehicle inspection for *${partner.vehicleType} (${partner.vehiclePlate})* have been officially approved by HQ.\n\n✅ *Status:* ACTIVE & VERIFIED\n💰 *Payout Account:* ${partner.bankDetails?.bankName} (A/C: ••••${partner.bankDetails?.accountNumber?.slice?.(-4) || '—'})\n\n👉 Open your OmniGo Driver App and turn ON your Online status to begin receiving dispatch alerts!`;
    const pushMessage = `✅ Account Verified! Your driver profile is now active. Tap here to go online and start earning today.`;

    try {
      await createNotification({ driverId: partner.id, title: 'Account Update', message: pushMessage, type: 'system' });
    } catch (err) {
      console.error(err);
    }

    setNotificationModalData({
      partner: updated,
      smsText: smsMessage,
      whatsappText: whatsappMessage,
      pushText: pushMessage,
    });

    setActionAlert(`Partner ${partner.name} (${partner.id}) has been successfully VERIFIED and activated.`);
    setTimeout(() => setActionAlert(null), 6000);
  };

  const handleToggleSuspend = (partnerId: string, currentStatus: PartnerRecord['kycStatus']) => {
    const newStatus = currentStatus === 'Suspended' ? 'Verified' : 'Suspended';
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, kycStatus: newStatus } : p));
    setActionAlert(`Partner ${partnerId} status updated to: ${newStatus}.`);
    setSelectedPartner(null);
    setTimeout(() => setActionAlert(null), 4000);
  };

  // Generate & Print / Export Driver PDF Dossier (Opens Printable Window with Top Navigation Bar)
  const handlePrintDossierPDF = (partner: PartnerRecord) => {
    try {
      if (typeof window === 'undefined') return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        // If popup is blocked, open full in-app preview sheet modal
        setPreviewPdfPartner(partner);
        return;
      }

      const docEntries = Object.entries(partner.documents);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>OmniGo_Driver_Dossier_${partner.id}.pdf</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              background: #F1F5F9;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .top-nav {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #080C14;
              color: #F8FAFC;
              padding: 14px 28px;
              border-bottom: 1px solid rgba(255,255,255,0.1);
              position: sticky;
              top: 0;
              z-index: 9999;
              box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            }
            .btn-back {
              background: #0284C7;
              color: #FFFFFF;
              border: none;
              padding: 8px 18px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.15s ease;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .btn-back:hover {
              background: #0369A1;
              transform: translateX(-2px);
            }
            .btn-print {
              background: #10B981;
              color: #000000;
              border: none;
              padding: 8px 18px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.15s ease;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }
            .btn-print:hover {
              background: #059669;
            }
            .btn-close {
              background: rgba(255,255,255,0.06);
              color: #94A3B8;
              border: 1px solid rgba(255,255,255,0.15);
              padding: 8px 14px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
            }
            .btn-close:hover {
              background: rgba(255,255,255,0.12);
              color: #FFFFFF;
            }
            .page-container {
              max-width: 820px;
              margin: 24px auto;
              background: #FFFFFF;
              padding: 32px 36px;
              border-radius: 8px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #0EA5E9;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .brand h1 {
              margin: 0;
              font-size: 26px;
              color: #0F172A;
              letter-spacing: -0.5px;
            }
            .brand p {
              margin: 2px 0 0 0;
              color: #0EA5E9;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .dossier-meta {
              text-align: right;
              font-size: 11px;
              color: #64748B;
            }
            .dossier-meta strong {
              color: #0F172A;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              background: ${partner.kycStatus === 'Verified' ? '#DCFCE7' : '#FEF3C7'};
              color: ${partner.kycStatus === 'Verified' ? '#15803D' : '#B45309'};
              border: 1px solid ${partner.kycStatus === 'Verified' ? '#86EFAC' : '#FCD34D'};
              margin-top: 5px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #475569;
              border-bottom: 1px solid #E2E8F0;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .grid-3 {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 12px;
            }
            .info-card {
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 6px;
              padding: 10px 12px;
            }
            .info-card label {
              display: block;
              font-size: 10px;
              font-weight: 600;
              color: #64748B;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .info-card value {
              display: block;
              font-size: 12px;
              font-weight: 600;
              color: #0F172A;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 8px;
            }
            th {
              background: #F1F5F9;
              color: #475569;
              text-align: left;
              padding: 8px 10px;
              font-weight: 600;
              border: 1px solid #E2E8F0;
              text-transform: uppercase;
              font-size: 10px;
            }
            td {
              padding: 8px 10px;
              border: 1px solid #E2E8F0;
              color: #1E293B;
            }
            .doc-status {
              font-weight: 700;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 3px;
              display: inline-block;
            }
            .doc-verified { background: #DCFCE7; color: #15803D; }
            .doc-pending { background: #FEF3C7; color: #B45309; }
            .doc-rejected { background: #FEE2E2; color: #B91C1C; }
            .footer-sign {
              margin-top: 35px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-top: 20px;
              border-top: 1px dashed #CBD5E1;
            }
            .stamp-box {
              border: 2px solid #0EA5E9;
              border-radius: 6px;
              padding: 10px 15px;
              color: #0EA5E9;
              font-weight: 800;
              font-size: 11px;
              text-transform: uppercase;
              text-align: center;
            }
            .signature-line {
              text-align: right;
              font-size: 11px;
              color: #64748B;
            }
            .signature-line strong {
              display: block;
              color: #0F172A;
              margin-top: 30px;
              border-top: 1px solid #0F172A;
              padding-top: 4px;
            }
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                background: #FFFFFF !important;
                padding: 0 !important;
              }
              .page-container {
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <!-- Top Control Bar with Back Button -->
          <div class="top-nav no-print">
            <div style="display: flex; align-items: center; gap: 14px;">
              <button class="btn-back" onclick="if(window.opener && !window.opener.closed){window.opener.focus();window.close();}else{window.location.href='/drivers';}">
                &#8592; Back to Admin Panel
              </button>
              <span style="color: #94A3B8; font-size: 13px; font-weight: 500;">
                Official Dossier: <strong>${partner.name}</strong> (${partner.id})
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn-print" onclick="window.print()">
                &#128424; Print / Save as PDF
              </button>
              <button class="btn-close" onclick="window.close()">
                Close Window &#10005;
              </button>
            </div>
          </div>

          <div class="page-container">
            <div class="header">
              <div class="brand">
                <h1>OmniGo</h1>
                <p>Enterprise Roadside Assistance & Towing Logistics</p>
              </div>
              <div class="dossier-meta">
                <div><strong>PARTNER COMPLIANCE DOSSIER</strong></div>
                <div>Ref: <strong>${partner.id}</strong></div>
                <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div class="status-badge">${partner.kycStatus}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">1. Partner Identification & Personal Information</div>
              <div class="grid-3">
                <div class="info-card">
                  <label>Full Legal Name</label>
                  <value>${partner.name}</value>
                </div>
                <div class="info-card">
                  <label>Mobile Number</label>
                  <value>${partner.phone}</value>
                </div>
                <div class="info-card">
                  <label>Email Address</label>
                  <value>${partner.email}</value>
                </div>
                <div class="info-card">
                  <label>Date of Birth</label>
                  <value>${partner.dob}</value>
                </div>
                <div class="info-card">
                  <label>Aadhar ID (Masked)</label>
                  <value>${partner.aadharNumber}</value>
                </div>
                <div class="info-card">
                  <label>PAN Card Number</label>
                  <value>${partner.panNumber}</value>
                </div>
              </div>
              <div class="grid-2" style="margin-top: 10px;">
                <div class="info-card">
                  <label>Residential / Operating Address</label>
                  <value>${partner.address}, Pincode: ${partner.pincode}</value>
                </div>
                <div class="info-card">
                  <label>Emergency Contact</label>
                  <value>${partner.emergencyContact.name} (${partner.emergencyContact.relation}) · ${partner.emergencyContact.phone}</value>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">2. Commercial Vehicle & Technical Specifications</div>
              <div class="grid-3">
                <div class="info-card">
                  <label>Vehicle Class / Model</label>
                  <value>${partner.vehicleType}</value>
                </div>
                <div class="info-card">
                  <label>Registration Plate</label>
                  <value style="color: #0284C7; font-family: monospace;">${partner.vehiclePlate}</value>
                </div>
                <div class="info-card">
                  <label>Model Year & Capacity</label>
                  <value>${partner.vehicleModelYear} · ${partner.vehicleCapacity}</value>
                </div>
                <div class="info-card">
                  <label>Chassis Number</label>
                  <value style="font-family: monospace;">${partner.vehicleChassis}</value>
                </div>
                <div class="info-card">
                  <label>Engine Number</label>
                  <value style="font-family: monospace;">${partner.vehicleEngine}</value>
                </div>
                <div class="info-card">
                  <label>Operating City / Hub</label>
                  <value>${partner.city} Operations</value>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">3. Official Document Verification Audit Checklist</div>
              <table>
                <thead>
                  <tr>
                    <th>Certificate / Document</th>
                    <th>Document Ref Number</th>
                    <th>Issue Date</th>
                    <th>Valid Till</th>
                    <th>Status</th>
                    <th>Audit Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${docEntries.map(([key, doc]) => `
                    <tr>
                      <td><strong>${doc.name}</strong></td>
                      <td style="font-family: monospace;">${doc.docNumber}</td>
                      <td>${doc.issuedDate}</td>
                      <td>${doc.expiryDate}</td>
                      <td>
                        <span class="doc-status ${doc.status === 'Verified' ? 'doc-verified' : doc.status === 'Rejected' ? 'doc-rejected' : 'doc-pending'}">
                          ${doc.status}
                        </span>
                      </td>
                      <td>${doc.notes || 'Verified against Government National Registry.'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <div class="section-title">4. Financial Ledger & Automated Settlement Account</div>
              <div class="grid-3">
                <div class="info-card">
                  <label>Account Holder Name</label>
                  <value>${partner.bankDetails.accountHolder}</value>
                </div>
                <div class="info-card">
                  <label>Bank Name & IFSC</label>
                  <value>${partner.bankDetails.bankName} (${partner.bankDetails.ifsc})</value>
                </div>
                <div class="info-card">
                  <label>Bank Account Number</label>
                  <value style="font-family: monospace;">${partner.bankDetails.accountNumber}</value>
                </div>
              </div>
            </div>

            <div class="footer-sign">
              <div class="stamp-box">
                OmniGo Verified Partner<br>
                <span style="font-size: 9px; font-weight: 500; color: #475569;">Digital Audit Signature Passed</span>
              </div>
              <div class="signature-line">
                <div>Verification Officer: <strong>${partner.verifiedBy || 'SuperAdmin (ID: OMNI-ADM-01)'}</strong></div>
                <div>Verification Timestamp: <strong>${partner.verifiedAt || 'Pending Authorization'}</strong></div>
                <strong>Authorized Compliance Officer Signature</strong>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err) {
      console.error('Error opening print window:', err);
      setPreviewPdfPartner(partner);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Partner & KYC Compliance Center
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Manual certificate verification, vehicle inspection audits, automated activation notifications, and PDF dossier generation
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search driver, plate, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '230px' }}
          />

          <div style={{ display: 'flex', gap: '0.3rem', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'all', label: `All (${partners.length})` },
              { id: 'pending', label: 'Pending Review' },
              { id: 'verified', label: 'Verified' },
              { id: 'suspended', label: 'Suspended' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: filter === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {actionAlert && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'var(--accent-green-subtle)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: 'var(--accent-green)',
          fontSize: '0.86rem',
          fontWeight: 600,
        }}>
          ✓ {actionAlert}
        </div>
      )}

      {/* Partner Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Partner Dossier</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Commercial Vehicle</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>KYC Compliance</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Manual Verification Audit</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Performance</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No partner drivers found in database.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const verifiedCount = getVerifiedDocsCount(partner);
                  const isAllVerified = allDocsVerified(partner);
                  return (
                  <tr
                    key={partner.id}
                    style={{ borderBottom: '1px solid var(--glass-border-subtle)', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F8FAFC' }}>{partner.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{partner.phone} · {partner.city}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{partner.id}</div>
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 500, color: '#F8FAFC' }}>{partner.vehicleType}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{partner.vehiclePlate}</div>
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <StatusBadge status={partner.kycStatus === 'Verified' ? 'Verified' : partner.kycStatus === 'Pending Review' ? 'Pending' : 'Suspended'} />
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isAllVerified ? 'var(--accent-green)' : 'var(--accent-yellow)',
                        }}>
                          {verifiedCount} / 7 Checked
                        </span>
                      </div>
                      <div style={{ width: '110px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${(verifiedCount / 7) * 100}%`, height: '100%', background: isAllVerified ? 'var(--accent-green)' : 'var(--accent-yellow)' }} />
                      </div>
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ fontSize: '0.84rem', color: '#F8FAFC' }}>Rating {partner.rating} <span style={{ color: 'var(--text-muted)' }}>({partner.totalTrips} trips)</span></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>Wallet: {partner.walletBalance}</div>
                    </td>

                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          style={{
                            padding: '0.4rem 0.85rem',
                            borderRadius: '6px',
                            background: partner.kycStatus === 'Pending Review' ? 'var(--accent-cyan-subtle)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${partner.kycStatus === 'Pending Review' ? 'rgba(56,189,248,0.35)' : 'var(--glass-border)'}`,
                            color: partner.kycStatus === 'Pending Review' ? 'var(--accent-cyan)' : '#F8FAFC',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {partner.kycStatus === 'Pending Review' ? 'Verify KYC' : 'Inspect'}
                        </button>
                        <button
                          onClick={() => setPreviewPdfPartner(partner)}
                          title="View Driver PDF Dossier"
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            background: 'rgba(56, 189, 248, 0.08)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: 'var(--accent-cyan)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>📄</span> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── FULLSCREEN IN-APP PDF DOSSIER PREVIEW MODAL ─── */}
      {previewPdfPartner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2000,
          overflowY: 'auto',
        }}>
          {/* Top Sticky Command Bar with Prominent Back Button */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 2010,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '0.9rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button
                onClick={() => setPreviewPdfPartner(null)}
                style={{
                  padding: '0.55rem 1.25rem',
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  borderRadius: '6px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                }}
              >
                <span>⬅</span> Back to Admin Panel
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  Official Partner Dossier: {previewPdfPartner.name}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>
                  ({previewPdfPartner.id})
                </span>
                <StatusBadge status={previewPdfPartner.kycStatus === 'Verified' ? 'Verified' : previewPdfPartner.kycStatus === 'Pending Review' ? 'Pending' : 'Suspended'} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => handlePrintDossierPDF(previewPdfPartner)}
                style={{
                  padding: '0.55rem 1.2rem',
                  background: 'var(--accent-green)',
                  color: '#000000',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>🖨️</span> Print / Save PDF
              </button>

              <button
                onClick={() => setPreviewPdfPartner(null)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close ✕
              </button>
            </div>
          </div>

          {/* Render Authentic White A4 Printable Paper Dossier */}
          <div style={{ padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '820px',
              background: '#FFFFFF',
              color: '#0F172A',
              padding: '36px 42px',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontSize: '13px',
              lineHeight: 1.5,
            }}>
              {/* Document Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0EA5E9', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: '26px', color: '#0F172A', letterSpacing: '-0.5px', fontWeight: 800 }}>OmniGo</h1>
                  <p style={{ margin: '2px 0 0 0', color: '#0EA5E9', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Enterprise Roadside Assistance & Towing Logistics
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B' }}>
                  <div><strong>PARTNER COMPLIANCE DOSSIER</strong></div>
                  <div>Ref: <strong>{previewPdfPartner.id}</strong></div>
                  <div>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: previewPdfPartner.kycStatus === 'Verified' ? '#DCFCE7' : '#FEF3C7',
                    color: previewPdfPartner.kycStatus === 'Verified' ? '#15803D' : '#B45309',
                    border: `1px solid ${previewPdfPartner.kycStatus === 'Verified' ? '#86EFAC' : '#FCD34D'}`,
                    marginTop: '4px',
                  }}>
                    {previewPdfPartner.kycStatus}
                  </div>
                </div>
              </div>

              {/* Section 1: Partner Identification */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '5px', marginBottom: '10px' }}>
                  1. Partner Identification & Personal Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Full Legal Name</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.name}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Mobile Number</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.phone}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Email Address</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.email}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Date of Birth</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.dob}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Aadhar ID (Masked)</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.aadharNumber}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>PAN Card Number</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.panNumber}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Residential / Operating Address</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.address}, Pincode: {previewPdfPartner.pincode}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Emergency Contact</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.emergencyContact.name} ({previewPdfPartner.emergencyContact.relation}) · {previewPdfPartner.emergencyContact.phone}</div>
                  </div>
                </div>
              </div>

              {/* Section 2: Vehicle & Technical Specs */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '5px', marginBottom: '10px' }}>
                  2. Commercial Vehicle & Technical Specifications
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Vehicle Class / Model</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.vehicleType}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Registration Plate</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', fontFamily: 'monospace' }}>{previewPdfPartner.vehiclePlate}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Model Year & Capacity</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.vehicleModelYear} · {previewPdfPartner.vehicleCapacity}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Chassis Number</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: '#0F172A' }}>{previewPdfPartner.vehicleChassis}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Engine Number</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: '#0F172A' }}>{previewPdfPartner.vehicleEngine}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Operating Hub</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.city} Operations</div>
                  </div>
                </div>
              </div>

              {/* Section 3: Document Verification Checklist */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '5px', marginBottom: '10px' }}>
                  3. Official Document Verification Audit Checklist
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', padding: '6px 8px', border: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '10px' }}>Certificate / Document</th>
                      <th style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', padding: '6px 8px', border: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '10px' }}>Document Ref Number</th>
                      <th style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', padding: '6px 8px', border: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '10px' }}>Valid Till</th>
                      <th style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', padding: '6px 8px', border: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '10px' }}>Status</th>
                      <th style={{ background: '#F1F5F9', color: '#475569', textAlign: 'left', padding: '6px 8px', border: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '10px' }}>Audit Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(previewPdfPartner.documents) as [string, DocumentItem][]).map(([key, doc]) => (
                      <tr key={key}>
                        <td style={{ padding: '6px 8px', border: '1px solid #E2E8F0' }}><strong>{doc.name}</strong></td>
                        <td style={{ padding: '6px 8px', border: '1px solid #E2E8F0', fontFamily: 'monospace' }}>{doc.docNumber}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #E2E8F0' }}>{doc.expiryDate}</td>
                        <td style={{ padding: '6px 8px', border: '1px solid #E2E8F0' }}>
                          <span style={{
                            fontWeight: 700,
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: doc.status === 'Verified' ? '#DCFCE7' : doc.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: doc.status === 'Verified' ? '#15803D' : doc.status === 'Rejected' ? '#B91C1C' : '#B45309',
                          }}>
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #E2E8F0' }}>{doc.notes || 'Verified against Government National Registry.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section 4: Bank Details */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', borderBottom: '1px solid #E2E8F0', paddingBottom: '5px', marginBottom: '10px' }}>
                  4. Financial Ledger & Automated Settlement Account
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Account Holder</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.bankDetails.accountHolder}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Bank & IFSC</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{previewPdfPartner.bankDetails.bankName} ({previewPdfPartner.bankDetails.ifsc})</div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Account Number</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', color: '#0F172A' }}>{previewPdfPartner.bankDetails.accountNumber}</div>
                  </div>
                </div>
              </div>

              {/* Document Seal & Signature Footer */}
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '15px', borderTop: '1px dashed #CBD5E1' }}>
                <div style={{ border: '2px solid #0EA5E9', borderRadius: '6px', padding: '8px 14px', color: '#0EA5E9', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', textAlign: 'center' }}>
                  OmniGo Verified Partner<br />
                  <span style={{ fontSize: '9px', fontWeight: 500, color: '#475569' }}>Digital Audit Signature Passed</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B' }}>
                  <div>Verification Officer: <strong>{previewPdfPartner.verifiedBy || 'SuperAdmin (ID: OMNI-ADM-01)'}</strong></div>
                  <div>Verification Timestamp: <strong>{previewPdfPartner.verifiedAt || 'Pending Authorization'}</strong></div>
                  <strong style={{ display: 'block', color: '#0F172A', marginTop: '24px', borderTop: '1px solid #0F172A', paddingTop: '4px' }}>
                    Authorized Compliance Officer Signature
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MANUAL VERIFICATION & COMPLIANCE DOSSIER INSPECTION MODAL ─── */}
      {selectedPartner && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '740px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            maxHeight: '92vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Partner KYC Audit Inspection
                  </span>
                  <StatusBadge status={selectedPartner.kycStatus === 'Verified' ? 'Verified' : selectedPartner.kycStatus === 'Pending Review' ? 'Pending' : 'Suspended'} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#F8FAFC', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
                  {selectedPartner.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                  ID: {selectedPartner.id} · City: {selectedPartner.city} · Registered: {selectedPartner.joinedDate}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setPreviewPdfPartner(selectedPartner)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: 'var(--accent-cyan)',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View Full PDF Dossier
                </button>
                <button
                  onClick={() => setSelectedPartner(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', padding: '4px 8px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Verification Progress Meter */}
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F8FAFC' }}>
                  Manual Inspection Checklist: {getVerifiedDocsCount(selectedPartner)} of 7 Verified
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: allDocsVerified(selectedPartner) ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                  {allDocsVerified(selectedPartner) ? 'Ready for Activation' : 'Pending Individual Verification'}
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(getVerifiedDocsCount(selectedPartner) / 7) * 100}%`, height: '100%', background: allDocsVerified(selectedPartner) ? 'var(--accent-green)' : 'var(--accent-cyan)', transition: 'all 0.3s ease' }} />
              </div>
            </div>

            {/* Personal & Vehicle Quick Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Aadhar & PAN</div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{selectedPartner.aadharNumber} · {selectedPartner.panNumber}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px' }}>DOB: {selectedPartner.dob}</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Vehicle Hardware</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedPartner.vehicleType}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '2px', fontFamily: 'monospace' }}>{selectedPartner.vehiclePlate} · {selectedPartner.vehicleCapacity}</div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Bank Settlement Details</div>
                <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{selectedPartner.bankDetails.bankName}</div>
                <div style={{ color: 'var(--accent-green)', fontSize: '0.72rem', marginTop: '2px', fontFamily: 'monospace' }}>
                  A/C: ••••{selectedPartner.bankDetails.accountNumber.slice(-4)} ({selectedPartner.bankDetails.ifsc})
                </div>
              </div>
            </div>

            {/* 7 Interactive Manual Document Inspection Rows */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
                Document-by-Document Manual Verification Matrix
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(Object.entries(selectedPartner.documents) as [keyof PartnerRecord['documents'], DocumentItem][]).map(([key, doc]) => {
                  const isVerified = doc.status === 'Verified';
                  const isRejected = doc.status === 'Rejected';
                  const isPending = doc.status === 'Pending';

                  return (
                    <div
                      key={key}
                      style={{
                        padding: '0.75rem 1rem',
                        background: isVerified ? 'rgba(16,185,129,0.03)' : isRejected ? 'rgba(244,63,94,0.03)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '8px',
                        border: isVerified ? '1px solid rgba(16,185,129,0.25)' : isRejected ? '1px solid rgba(244,63,94,0.25)' : '1px solid var(--glass-border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: isVerified ? 'var(--accent-green)' : isRejected ? 'var(--accent-red)' : 'var(--accent-yellow)' }} />
                          <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#F8FAFC' }}>{doc.name}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Ref: <span style={{ fontFamily: 'monospace', color: '#E2E8F0' }}>{doc.docNumber}</span> · Valid: {doc.expiryDate} {doc.notes ? `(${doc.notes})` : ''}
                        </div>
                      </div>

                      {/* Manual Verification Action Buttons for each Document */}
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleUpdateDocStatus(key, 'Verified')}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: isVerified ? '1px solid var(--accent-green)' : '1px solid var(--glass-border)',
                            background: isVerified ? 'var(--accent-green)' : 'rgba(255,255,255,0.03)',
                            color: isVerified ? '#000' : 'var(--text-muted)',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Verified
                        </button>
                        <button
                          onClick={() => handleUpdateDocStatus(key, 'Pending')}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: isPending ? '1px solid var(--accent-yellow)' : '1px solid var(--glass-border)',
                            background: isPending ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                            color: isPending ? 'var(--accent-yellow)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateDocStatus(key, 'Rejected')}
                          style={{
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            border: isRejected ? '1px solid var(--accent-red)' : '1px solid var(--glass-border)',
                            background: isRejected ? 'var(--accent-red)' : 'rgba(255,255,255,0.03)',
                            color: isRejected ? '#fff' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border-subtle)' }}>
              {selectedPartner.kycStatus !== 'Verified' ? (
                <button
                  disabled={!allDocsVerified(selectedPartner)}
                  onClick={() => handleApproveAndNotifyDriver(selectedPartner)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: allDocsVerified(selectedPartner) ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                    color: allDocsVerified(selectedPartner) ? '#000' : 'var(--text-muted)',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: allDocsVerified(selectedPartner) ? 'pointer' : 'not-allowed',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {allDocsVerified(selectedPartner)
                    ? 'Verify & Send Activation Notification ➔'
                    : `Verify All Documents First (${getVerifiedDocsCount(selectedPartner)}/7)`}
                </button>
              ) : (
                <div style={{ flex: 1, padding: '0.65rem 1rem', background: 'var(--accent-green-subtle)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓ Verified & Active · Verified on {selectedPartner.verifiedAt || 'Official Record'}</span>
                </div>
              )}

              <button
                onClick={() => handleToggleSuspend(selectedPartner.id, selectedPartner.kycStatus)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: selectedPartner.kycStatus === 'Suspended' ? 'var(--accent-green-subtle)' : 'var(--accent-red-subtle)',
                  border: `1px solid ${selectedPartner.kycStatus === 'Suspended' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                  color: selectedPartner.kycStatus === 'Suspended' ? 'var(--accent-green)' : 'var(--accent-red)',
                  fontWeight: 600,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                {selectedPartner.kycStatus === 'Suspended' ? 'Reinstate Driver' : 'Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUTOMATED MULTI-CHANNEL DISPATCH NOTIFICATION POPUP ─── */}
      {notificationModalData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(16,185,129,0.35)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '580px',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-green-subtle)', border: '1px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)', fontSize: '1.25rem', fontWeight: 800 }}>
                ✓
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#F8FAFC' }}>Driver Notification Dispatched!</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Multi-channel activation alert sent to {notificationModalData.partner.name} ({notificationModalData.partner.phone})
                </p>
              </div>
            </div>

            {/* Notification Preview Channels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              {/* SMS Alert */}
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>📱 Official SMS Gateway Dispatched</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)' }}>DELIVERED</span>
                </div>
                <div style={{ color: '#E2E8F0', lineHeight: 1.4 }}>{notificationModalData.smsText}</div>
              </div>

              {/* WhatsApp Alert */}
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase' }}>💬 WhatsApp Business Message</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)' }}>DELIVERED</span>
                </div>
                <div style={{ color: '#E2E8F0', whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: '0.78rem' }}>{notificationModalData.whatsappText}</div>
              </div>

              {/* In-App Push */}
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--glass-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase' }}>🔔 Driver Mobile App Push Notification</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-green)' }}>SENT TO FCM TOKEN</span>
                </div>
                <div style={{ color: '#E2E8F0' }}>{notificationModalData.pushText}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setPreviewPdfPartner(notificationModalData.partner)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-cyan)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                }}
              >
                View Driver PDF Dossier
              </button>
              <button
                onClick={() => setNotificationModalData(null)}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  background: 'var(--accent-green)',
                  color: '#000',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  border: 'none',
                  fontSize: '0.82rem',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
