import { useState } from 'react';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { 
  ChartBarIcon, 
  CalendarIcon,
  VideoCameraIcon,
  CreditCardIcon,
  EnvelopeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface EventAnalyticsIntegrationsProps {
  event: Event;
  onCalendarSync: (provider: 'google' | 'outlook' | 'apple') => void;
  onVideoSetup: (provider: 'zoom' | 'teams' | 'google-meet') => void;
  onPaymentSetup: (provider: 'stripe' | 'paypal') => void;
  onEmailSetup: () => void;
  onSocialShare: (platform: 'facebook' | 'linkedin' | 'twitter') => void;
}

export function EventAnalyticsIntegrations({ 
  event, 
  onCalendarSync, 
  onVideoSetup, 
  onPaymentSetup,
  onEmailSetup,
  onSocialShare
}: EventAnalyticsIntegrationsProps) {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analytics">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <ShareIcon className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <TabsContent value="analytics">
          <div className="space-y-6">
            {event.analytics && (
              <>
                <div className="space-y-2">
                  <Label>Event Performance</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">Views</p>
                      <p className="text-2xl font-semibold">{event.analytics.views}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.analytics.uniqueViews} unique views
                      </p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground">Shares</p>
                      <p className="text-2xl font-semibold">{event.analytics.shares}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Attendance</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Registrations</span>
                      <span>{event.analytics.registrations}</span>
                    </div>
                    <Progress value={(event.analytics.registrations / event.capacity) * 100} />
                    <div className="flex justify-between text-sm">
                      <span>Check-ins</span>
                      <span>{event.analytics.checkIns}</span>
                    </div>
                    <Progress value={(event.analytics.checkIns / event.analytics.registrations) * 100} />
                  </div>
                </div>

                {event.analytics.revenue && (
                  <div className="space-y-2">
                    <Label>Revenue</Label>
                    <div className="p-4 border rounded-md">
                      <p className="text-2xl font-semibold">
                        ${event.analytics.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {event.analytics.averageRating && (
                  <div className="space-y-2">
                    <Label>Feedback</Label>
                    <div className="p-4 border rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold">
                          {event.analytics.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({event.analytics.feedbackCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Calendar Integration</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onCalendarSync('google')}
                  disabled={!!event.integrations?.calendar?.googleCalendarId}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCalendarSync('outlook')}
                  disabled={!!event.integrations?.calendar?.outlookCalendarId}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Outlook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCalendarSync('apple')}
                  disabled={!!event.integrations?.calendar?.appleCalendarId}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Apple
                </Button>
              </div>
            </div>

            {event.location.virtual && (
              <div className="space-y-2">
                <Label>Video Conferencing</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onVideoSetup('zoom')}
                    disabled={!!event.integrations?.video?.meetingId}
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Zoom
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onVideoSetup('teams')}
                    disabled={!!event.integrations?.video?.meetingId}
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Teams
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onVideoSetup('google-meet')}
                    disabled={!!event.integrations?.video?.meetingId}
                  >
                    <VideoCameraIcon className="h-4 w-4 mr-2" />
                    Meet
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Payment Processing</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onPaymentSetup('stripe')}
                  disabled={!!event.integrations?.payment?.productId}
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Stripe
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onPaymentSetup('paypal')}
                  disabled={!!event.integrations?.payment?.productId}
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  PayPal
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Marketing</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={onEmailSetup}
                disabled={!!event.integrations?.email?.templateId}
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Set Up Email Campaign
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Social Media</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onSocialShare('facebook')}
                  disabled={!!event.integrations?.social?.facebookEventId}
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSocialShare('linkedin')}
                  disabled={!!event.integrations?.social?.linkedinEventId}
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSocialShare('twitter')}
                  disabled={!!event.integrations?.social?.twitterEventId}
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
} 