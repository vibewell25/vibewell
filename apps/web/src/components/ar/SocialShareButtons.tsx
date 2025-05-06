import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from 'lucide-react';

interface SocialShareButtonsProps {
  imageData: string;
  type: string;
  productName: string;
  shareUrl: string;
  onShare: (platform: string) => void;
export {};
