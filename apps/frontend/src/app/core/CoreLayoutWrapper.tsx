'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import CoreSidebarShell from './CoreSidebarShell';
import CrewSidebarShell from '@/app/crew/(admin)/CrewSidebarShell';

export default function CoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/core' || pathname === '/core/';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (!raw) {
        window.location.replace('/login');
        return;
      }

      const parsed = JSON.parse(raw);
      const userRole = (parsed.role || 'enthusiasts').toLowerCase();
      setRole(userRole);

      if (userRole === 'enthusiasts' || userRole === 'enthusiast') {
        window.location.replace('/events');
        return;
      }

      setChecking(false);
    } catch {
      localStorage.removeItem('aws_sgb_rec_user');
      window.location.replace('/login');
    }
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

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

  if (role === 'crew') {
    return <CrewSidebarShell>{children}</CrewSidebarShell>;
  }

  return <CoreSidebarShell>{children}</CoreSidebarShell>;
}
