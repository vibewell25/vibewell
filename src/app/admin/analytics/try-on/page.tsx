import { Metadata } from 'next';
import TryOnAnalytics from '../try-on';

export const metadata: Metadata = {
  title: 'Try-On Analytics | VibeWell Admin',
  description: 'Analytics for virtual try-on sessions and user feedback',
};

export default function TryOnAnalyticsPage() {
  return <TryOnAnalytics />;
} 