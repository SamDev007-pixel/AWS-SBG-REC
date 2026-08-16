'use client';

import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  Map,
  MessageSquare,
  GraduationCap,
  QrCode,
  SearchCheck,
  ListTodo,
  ShieldAlert,
  Newspaper,
  Cpu,
  Bell,
} from 'lucide-react';

import AWSSidebarIcon from '@/components/AWSSidebarIcon';

const crewNavItems: NavItem[] = [
  { icon: <AWSSidebarIcon name="events" />, label: 'events', href: '/crew/events' },
  { icon: <AWSSidebarIcon name="news" />, label: 'news', href: '/news' },
  { icon: <AWSSidebarIcon name="roadmap" />, label: 'roadmap', href: '/learn' },
  { icon: <AWSSidebarIcon name="chat" />, label: 'chat', href: '/crew/chat' },
  { icon: <AWSSidebarIcon name="certifications" />, label: 'certifications', href: '/certifications' },
  { icon: <AWSSidebarIcon name="services" />, label: 'services', href: '/services' },
];

const crewBottomNavItems: NavItem[] = [
  { icon: <AWSSidebarIcon name="incidents" />, label: 'incidents', href: '/crew/incidents' },
];
// HMR cache reload trigger: 2

export default function CrewSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Crew Member';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Crew' });

        if (parsed.id) {
          fetch(`/api/auth/permissions/check?userId=${parsed.id}`)
            .then((res) => res.json())
            .then((data) => {
              const perms = data.data?.permissions ?? data.permissions;
              if ((data.success || data.data) && Array.isArray(perms)) {
                setActivePermissions(perms);
              }
            })
            .catch((err) => console.error('Error fetching permissions for crew sidebar:', err));
        }
      }
    } catch { /* ignore */ }
  }, []);

  const navItems = React.useMemo(() => {
    return crewNavItems.map(item => {
      if (item.label === 'events' && activePermissions.includes('create_event')) {
        return { ...item, href: '/core/events' };
      }
      if (item.label === 'chat' && activePermissions.includes('scan_ticket')) {
        return { ...item, href: '/core/chat' };
      }
      if (item.label === 'roadmap' && activePermissions.includes('manage_announcements')) {
        return { ...item, href: '/core/topics' };
      }
      if (item.label === 'services' && activePermissions.includes('edit_event')) {
        return { ...item, href: '/core/services' };
      }
      return item;
    });
  }, [activePermissions]);

  return (
    <SidebarLayout
      navItems={navItems}
      bottomNavItems={crewBottomNavItems}
      user={user}
      brandTitle={user?.name || 'Crew Member'}
      brandSubtitle={user?.badge || 'Crew'}
      homeHref="/crew/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
