import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Link as LinkIcon, 
  Copy, 
  Mail, 
  MessageCircle,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode.react';

interface ShareFeatureProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  productId?: string;
  variant?: 'default' | 'outline' | 'minimal';
  onShare?: (platform: string) => void;
}

/**
 * Enhanced social sharing component with support for multiple platforms and tracking
 */
export function ShareFeature({ 
  url, 
  title, 
  description = '', 
  image = '', 
  productId = '',
  variant = 'default',
  onShare 
}: ShareFeatureProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('social');
  const [customMessage, setCustomMessage] = useState('');

  // Prepare URLs for different platforms
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  // Social share URLs
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
  };

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Track sharing events
  const handleShareClick = (platform: string) => {
    if (onShare) {
      onShare(platform);
    }
    
    // Log analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: productId ? 'product' : 'page',
        item_id: productId || url,
      });
    }
  };

  // Open sharing window
  const openShareWindow = (shareUrl: string, platform: string) => {
    if (platform === 'email' || platform === 'whatsapp') {
      window.location.href = shareUrl;
      return;
    }
    
    window.open(
      shareUrl,
      `Share on ${platform}`,
      'width=600,height=600,location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1'
    );
    
    handleShareClick(platform);
  };

  // Custom message sharing
  const handleCustomShare = () => {
    const customShareUrl = `${shareUrls.twitter}&text=${encodeURIComponent(customMessage)}`;
    openShareWindow(customShareUrl, 'twitter-custom');
  };

  // Render appropriate button based on variant
  const renderTrigger = () => {
    switch(variant) {
      case 'outline':
        return (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        );
      case 'minimal':
        return (
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        );
      default:
        return (
          <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this {productId ? 'product' : 'page'}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => openShareWindow(shareUrls.facebook, 'facebook')}
              >
                <Facebook className="h-8 w-8 text-blue-600" />
                <span className="mt-2 text-xs">Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => openShareWindow(shareUrls.twitter, 'twitter')}
              >
                <Twitter className="h-8 w-8 text-blue-400" />
                <span className="mt-2 text-xs">Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => openShareWindow(shareUrls.linkedin, 'linkedin')}
              >
                <Linkedin className="h-8 w-8 text-blue-700" />
                <span className="mt-2 text-xs">LinkedIn</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => openShareWindow(shareUrls.email, 'email')}
              >
                <Mail className="h-8 w-8 text-gray-600" />
                <span className="mt-2 text-xs">Email</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Copy className="h-8 w-8 text-green-500" />
                ) : (
                  <LinkIcon className="h-8 w-8 text-gray-500" />
                )}
                <span className="mt-2 text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title,
                      text: description,
                      url,
                    }).then(() => {
                      handleShareClick('native-share');
                    }).catch(console.error);
                  }
                }}
                disabled={!navigator.share}
              >
                <Share2 className="h-8 w-8 text-gray-600" />
                <span className="mt-2 text-xs">Native</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="messaging" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={() => openShareWindow(shareUrls.whatsapp, 'whatsapp')}
              >
                <MessageCircle className="h-8 w-8 text-green-500" />
                <span className="mt-2 text-xs">WhatsApp</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4"
                onClick={handleCopyLink}
              >
                <Copy className="h-8 w-8 text-gray-500" />
                <span className="mt-2 text-xs">{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
            
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Add a custom message:</p>
              <div className="flex gap-2">
                <Input 
                  value={customMessage} 
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Check out this awesome look I found!"  
                />
                <Button onClick={handleCustomShare} disabled={!customMessage.trim()}>
                  Share
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="qrcode" className="mt-4">
            <div className="flex flex-col items-center justify-center p-4">
              <QRCode 
                value={url} 
                size={200}
                level="H"
                includeMargin
                className="mb-4"
              />
              <p className="text-sm text-gray-500">Scan this QR code to open this {productId ? 'product' : 'page'}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const image = canvas.toDataURL("image/png");
                    const link = document.createElement('a');
                    link.href = image;
                    link.download = `vibewell-qrcode-${productId || 'share'}.png`;
                    link.click();
                    handleShareClick('qrcode-download');
                  }
                }}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// For TypeScript global window
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
  }
}

export default ShareFeature; 