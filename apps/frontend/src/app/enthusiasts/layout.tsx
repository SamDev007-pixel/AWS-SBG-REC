import type { Metadata } from 'next';
import EventsSidebarShell from '../events/EventsSidebarShell';

export const metadata: Metadata = {
  title: 'Cloud Enthusiast Dashboard - AWS SBG REC',
  description: 'Track your ranks, cloud achievements, upcoming events, and announcements.',
};

export default function EnthusiastsLayout({ children }: { children: React.ReactNode }) {
  return <EventsSidebarShell>{children}</EventsSidebarShell>;
}
