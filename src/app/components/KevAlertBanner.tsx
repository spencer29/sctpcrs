import React from 'react';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';

export default function KevAlertBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-status-critical-bg border border-status-critical/40 glow-red">
      <AlertTriangle size={16} className="text-status-critical flex-shrink-0 mt-0.5 alert-pulse" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-status-critical uppercase tracking-wider">
            CRITICAL — KEV Alert
          </span>
          <span className="text-2xs font-mono-data bg-status-critical/20 text-status-critical px-1.5 py-0.5 rounded">
            CVE-2024-3094
          </span>
          <span className="text-2xs text-muted-foreground">·</span>
          <span className="text-2xs font-mono-data text-muted-foreground">CVSS 10.0</span>
          <span className="text-2xs text-muted-foreground">·</span>
          <span className="text-2xs text-muted-foreground">XZ Utils — Backdoor</span>
        </div>
        <p className="text-xs text-foreground/80 mt-1">
          <span className="font-semibold text-status-critical">3 vendors</span> in your portfolio have this CISA KEV-listed vulnerability in their registered SBOM components.{' '}
          <span className="text-status-high font-medium">Paystack Integration Ltd</span>,{' '}
          <span className="text-status-high font-medium">Flutterwave SDK Services</span>, and{' '}
          <span className="text-status-high font-medium">CloudPay Africa Ltd</span> require immediate review.{' '}
          <span className="text-status-medium">CBN mandatory notification window: 4h 17m remaining.</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="flex items-center gap-1.5 text-2xs font-semibold text-status-critical bg-status-critical/10 hover:bg-status-critical/20 border border-status-critical/30 px-2.5 py-1.5 rounded transition-all duration-150">
          Review Now
          <ExternalLink size={11} />
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}