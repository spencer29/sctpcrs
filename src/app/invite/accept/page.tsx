'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AcceptInvitePage from './components/AcceptInviteContent';

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0A0E1A' }}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin" style={{ color: '#60A5FA' }} />
            <p className="text-sm" style={{ color: '#94A3B8' }}>Loading invite…</p>
          </div>
        </div>
      }
    >
      <AcceptInvitePage />
    </Suspense>
  );
}
