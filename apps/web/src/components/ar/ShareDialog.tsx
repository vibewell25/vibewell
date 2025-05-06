import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { SocialShareButtons } from './social-share-buttons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsService } from '@/services/analytics-service';
import { useEngagement } from '@/hooks/use-engagement';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string;
  type: string;
  productName: string;
  userId?: string;
export {};
