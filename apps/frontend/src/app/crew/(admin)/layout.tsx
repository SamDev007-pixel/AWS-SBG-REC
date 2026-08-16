'use client';

import React, { useEffect, useState } from 'react';
import CrewSidebarShell from './CrewSidebarShell';

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (!raw) {
        window.location.replace('/login');
        return;
      }

      const parsed = JSON.parse(raw);
      const userRole = (parsed.role || 'enthusiasts').toLowerCase();

      if (userRole === 'enthusiasts' || userRole === 'enthusiast') {
        window.location.replace('/events');
        return;
      }

      setChecking(false);
    } catch {
      localStorage.removeItem('aws_sgb_rec_user');
      window.location.replace('/login');
    }
  }, []);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#161d26] text-white font-mono text-sm z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs uppercase tracking-widest font-bold text-[#68717A]">
            Verifying Access...
          </div>
        </div>
      </div>
    );
  }

  return <CrewSidebarShell>{children}</CrewSidebarShell>;
}
