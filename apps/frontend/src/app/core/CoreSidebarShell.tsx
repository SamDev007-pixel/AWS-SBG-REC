'use client';

import React, { useEffect, useState } from 'react';
// Force recompile trigger: 2
import SidebarLayout from '@/components/SidebarLayout';
import type { NavItem, SidebarUser } from '@/components/Sidebar';
import {
  CalendarDays,
  Map,
  MessageSquare,
  GraduationCap,
  Users,
  Ticket,
  ClipboardList,
  Newspaper,
  Bell,
  Cpu,
  KeyRound,
} from 'lucide-react';

import AWSSidebarIcon from '@/components/AWSSidebarIcon';

const coreNavItems: NavItem[] = [
  { icon: <AWSSidebarIcon name="events" />, label: 'events', href: '/core/events' },
  { icon: <AWSSidebarIcon name="news" />, label: 'news', href: '/news' },
  { icon: <AWSSidebarIcon name="roadmap" />, label: 'roadmap builder', href: '/core/topics' },
  { icon: <AWSSidebarIcon name="chat" />, label: 'chat', href: '/core/chat' },
  { icon: <AWSSidebarIcon name="certifications" />, label: 'certifications', href: '/core/certifications' },
  { icon: <AWSSidebarIcon name="services" />, label: 'services', href: '/services' },
  { icon: <AWSSidebarIcon name="access-control" className="w-[28px] h-[28px]" />, label: 'access control', href: '/core/access-control' },
];

const coreBottomNavItems: NavItem[] = [
  { icon: <AWSSidebarIcon name="announcements" className="w-[28px] h-[28px]" />, label: 'announcements', href: '/core/announcements' },
];

export default function CoreSidebarShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SidebarUser | undefined>();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name: string = parsed.fullName || parsed.email || 'Admin';
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUser({ name, initials, badge: 'Core Admin' });
      }
    } catch { /* ignore */ }
  }, []);

  console.log('CoreSidebarShell render: coreNavItems length =', coreNavItems.length, 'items =', coreNavItems.map(item => item.label));

  return (
    <SidebarLayout
      navItems={coreNavItems}
      bottomNavItems={coreBottomNavItems}
      user={user}
      brandTitle={user?.name || 'Admin'}
      brandSubtitle={user?.badge || 'Core Admin'}
      homeHref="/core/dashboard"
    >
      {children}
    </SidebarLayout>
  );
}
