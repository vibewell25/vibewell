import { ShareData } from '@/lib/api/share';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { SocialShareButtons } from './social-share-buttons';

interface ShareViewProps {
  shareData: ShareData;
}

export function ShareView({ shareData }: ShareViewProps) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareData.id}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          My {shareData.type} try-on look
          {shareData.productName ? ` with ${shareData.productName}` : ''}
        </h1>
        <div className="aspect-square relative mb-4">
          <img
            src={shareData.imageData}
            alt={`Shared ${shareData.type} try-on`}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type: <span className="capitalize">{shareData.type}</span>
            </p>
            {shareData.productName && (
              <p className="text-sm text-muted-foreground">Product: {shareData.productName}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Shared on: {format(new Date(shareData.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>

          <div className="pt-4 border-t">
            <h2 className="text-lg font-semibold mb-2">Share this look</h2>
            <SocialShareButtons
              imageData={shareData.imageData}
              type={shareData.type}
              productName={shareData.productName}
              shareUrl={shareUrl}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
