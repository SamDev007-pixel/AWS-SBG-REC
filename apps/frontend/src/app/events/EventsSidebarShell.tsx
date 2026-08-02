'use client';

import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  User,
  GraduationCap,
  Map,
  MessageSquare,
  Database,
  Newspaper,
  Cpu,
} from 'lucide-react';

import AWSSidebarIcon from '@/components/AWSSidebarIcon';

const eventsNavItems: NavItem[] = [
  { icon: <AWSSidebarIcon name="events" />, label: 'events', href: '/events' },
  { icon: <AWSSidebarIcon name="news" />, label: 'news', href: '/news' },
  { icon: <AWSSidebarIcon name="roadmap" />, label: 'roadmap', href: '/learn' },
  { icon: <AWSSidebarIcon name="chat" />, label: 'chat', href: '/chat' },
  { icon: <AWSSidebarIcon name="certifications" />, label: 'certifications', href: '/certifications' },
  { icon: <AWSSidebarIcon name="services" />, label: 'services', href: '/services' },
];

export default function EventsSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Attendee';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Enthusiast' });
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <SidebarLayout
      navItems={eventsNavItems}
      user={user}
      brandTitle={user?.name || 'Attendee'}
      brandSubtitle={user?.badge || 'Enthusiast'}
      homeHref="/enthusiasts/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
