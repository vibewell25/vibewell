import { Icons } from '@/components/icons';
import { useState } from 'react';
import { Event } from '@/types/events';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rating } from '@/components/ui/rating';
interface EventCheckinFeedbackProps {
  event: Event;
  onCheckIn: (code: string) => void;
  onFeedbackSubmit: (rating: number, comment: string) => void;
}
export function EventCheckinFeedback({ event, onCheckIn, onFeedbackSubmit }: EventCheckinFeedbackProps) {
  const [activeTab, setActiveTab] = useState('checkin');
  const [checkInCode, setCheckInCode] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const handleCheckIn = () => {
    if (checkInCode.trim()) {
      onCheckIn(checkInCode);
      setCheckInCode('');
    }
  };
  const handleFeedbackSubmit = async () => {
    if (rating > 0 && feedback.trim()) {
      setSubmitting(true);
      try {
        await onFeedbackSubmit(rating, feedback);
        setRating(0);
        setFeedback('');
      } finally {
        setSubmitting(false);
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="checkin">
              <Icons.CheckCircleIcon className="h-4 w-4 mr-2" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <Icons.StarIcon className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="checkin">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Check-in Code</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter check-in code"
                  value={checkInCode}
                  onChange={(e) => setCheckInCode(e.target.value)}
                />
                <Button onClick={handleCheckIn}>
                  <Icons.CheckCircleIcon className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              </div>
            </div>
            {event.checkInCode && (
              <div className="space-y-2">
                <Label>Event Check-in Code</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Icons.ClipboardIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{event.checkInCode}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(event.checkInCode || '')}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
            {event.checkedInParticipants && event.checkedInParticipants.length > 0 && (
              <div className="space-y-2">
                <Label>Checked-in Participants</Label>
                <div className="space-y-2">
                  {event.checkedInParticipants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Checked in at {format(parseISO(participant.checkedInAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">
                        Checked In
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="feedback">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <Rating
                value={rating}
                onChange={setRating}
                max={5}
                size="lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                placeholder="Share your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleFeedbackSubmit}
              disabled={rating === 0 || !feedback.trim() || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
            {event.averageRating && (
              <div className="space-y-2">
                <Label>Event Rating</Label>
                <div className="flex items-center gap-2">
                  <Rating
                    value={event.averageRating}
                    readOnly
                    max={5}
                    size="lg"
                  />
                  <span className="text-sm text-muted-foreground">
                    ({event.ratingCount} reviews)
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
} 