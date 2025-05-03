import { Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  EventManagement,
  EventOrganizerDashboard,
  EventMaterialsAgenda,
  EventAnalytics,
} from '@/utils/dynamicImports';

interface EventDashboardProps {
  eventId: string;
}

export {};
