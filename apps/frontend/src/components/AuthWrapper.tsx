'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Routes that any visitor can view without being logged in
const PUBLIC_PREFIXES = [
  '/certifications',
  '/services',
  '/events',
  '/learn',
  '/roadmap',
  '/chat',
  '/news',
  '/verify',
];

// Dedicated auth landing pages where an already-logged-in user gets redirected to their dashboard
const AUTH_GATEWAY_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/crew',
  '/core',
];

function getHomeForRole(role: string): string {
  if (role === 'core') return '/core/dashboard';
  if (role === 'crew') return '/crew/dashboard';
  return '/events';
}

function getSession(): { id?: string; role: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('aws_sgb_rec_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { 
      id: parsed?.id,
      role: (parsed?.role ?? 'enthusiasts').toLowerCase().trim() 
    };
  } catch {
    localStorage.removeItem('aws_sgb_rec_user');
    return null;
  }
}

function isCrewAllowedCorePath(pathname: string, permissions: string[]): boolean {
  if (
    (pathname.startsWith('/core/events') ||
     pathname.startsWith('/core/registrations') ||
     pathname.startsWith('/core/tickets') ||
     pathname.startsWith('/core/attendance') ||
     pathname.startsWith('/core/announcements')) &&
    permissions.includes('create_event')
  ) {
    return true;
  }
  if (pathname.startsWith('/core/chat') && permissions.includes('scan_ticket')) {
    return true;
  }
  if (
    (pathname.startsWith('/core/services') || 
     pathname.startsWith('/core/manage-regions') || 
     pathname.startsWith('/core/manage-categories')) && 
    permissions.includes('edit_event')
  ) {
    return true;
  }
  if (
    (pathname.startsWith('/core/topics') || 
     pathname.startsWith('/core/module')) && 
    permissions.includes('manage_announcements')
  ) {
    return true;
  }
  if (pathname.startsWith('/core/analytics') && permissions.includes('view_analytics')) {
    return true;
  }
  return false;
}

function isPublicRoute(path: string): boolean {
  if (!path || path === '/') return true;
  return PUBLIC_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + '/'));
}

export function clearSessionCache() {
  // No-op
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isCurrentPublic = isPublicRoute(pathname);
  const [ready, setReady] = useState(isCurrentPublic);
  const [crewPermissions, setCrewPermissions] = useState<string[] | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  useEffect(() => {
    // 1. Root landing page is always public
    if (pathname === '/') {
      setReady(true);
      return;
    }

    // 2. Check if route is a general public route
    if (isPublicRoute(pathname)) {
      setReady(true);
      return;
    }

    const session = getSession();
    const isAuthGateway = AUTH_GATEWAY_ROUTES.includes(pathname);

    // 3. If user is on an Auth Gateway (/login, /signup, etc.)
    if (isAuthGateway) {
      if (session) {
        // If already logged in, redirect to role home
        router.replace(getHomeForRole(session.role));
      }
      setReady(true);
      return;
    }

    // 4. Protected Routes Check
    if (!session) {
      // Not logged in -> send to login
      router.replace('/login');
      setReady(true);
      return;
    }

    const { role, id } = session;
    const isCorePath = pathname.startsWith('/core');
    const isCrewPath = pathname.startsWith('/crew');
    const isEnthusiastDashboard = pathname.startsWith('/enthusiasts');

    // Crew accessing Core routes with specific permissions
    if (role === 'crew' && isCorePath) {
      if (crewPermissions === null) {
        if (!isLoadingPermissions) {
          setIsLoadingPermissions(true);
          fetch(`/api/auth/permissions/check?userId=${id}`)
            .then(res => res.json())
            .then(data => {
              const permissions = data.success ? (data.permissions || []) : [];
              setCrewPermissions(permissions);
              setIsLoadingPermissions(false);
              setReady(true);
            })
            .catch(err => {
              console.error("Failed to fetch crew permissions in AuthWrapper:", err);
              setCrewPermissions([]);
              setIsLoadingPermissions(false);
              setReady(true);
            });
        }
        return;
      }

      if (!isCrewAllowedCorePath(pathname, crewPermissions)) {
        router.replace(getHomeForRole(role));
      }
      setReady(true);
      return;
    }

    // Role boundary checks
    if (isCorePath && role !== 'core') {
      router.replace(getHomeForRole(role));
      setReady(true);
      return;
    }

    if (isCrewPath && role !== 'crew' && role !== 'core') {
      router.replace(getHomeForRole(role));
      setReady(true);
      return;
    }

    if (isEnthusiastDashboard && role !== 'enthusiasts') {
      router.replace(getHomeForRole(role));
      setReady(true);
      return;
    }

    setReady(true);
  }, [pathname, router, crewPermissions, isLoadingPermissions]);

  // Show spinner only for protected routes during authentication / permission loading
  if ((!ready && !isCurrentPublic) || (isLoadingPermissions && !isCurrentPublic)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A222D] z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#FF9900] border-t-transparent rounded-full animate-spin" />
          <div suppressHydrationWarning className="text-[10px] uppercase tracking-widest font-bold text-[#68717A] font-mono">
            Authenticating...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
