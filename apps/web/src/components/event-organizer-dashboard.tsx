import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/types/events';
import { Icons } from '@/components/icons';
import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { CSVDownload } from './ui/csv-download';

interface EventOrganizerDashboardProps {
  event: Event;
}

export function EventOrganizerDashboard({ event }: EventOrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate check-in rate
  const registrations = event.participantsCount || 0;
  const checkIns = event.checkedInParticipants.length || 0;
  const checkInRate = registrations > 0 ? (checkIns / registrations) * 100 : 0;

  // Prepare check-in data for export
  const prepareCheckInData = () => {
    if (!event.checkedInParticipants || event.checkedInParticipants.length === 0) {
      return [['No check-in data available']];
    }

    // Column headers
    const data = [['Name', 'User ID', 'Check-in Time']];

    // Add each participant as a row
    event.checkedInParticipants.forEach((participant) => {
      const checkInTime = format(parseISO(participant.checkedInAt), 'MM/dd/yyyy h:mm a');
      data.push([participant.name, participant.userId, checkInTime]);
    });

    return data;
  };

  // Prepare feedback data for export
  const prepareFeedbackData = () => {
    if (!event.feedback || event.feedback.length === 0) {
      return [['No feedback data available']];
    }

    // Column headers
    const data = [['User ID', 'Rating', 'Comment', 'Submission Time']];

    // Add each feedback as a row
    event.feedback.forEach((item) => {
      const submissionTime = format(parseISO(item.submittedAt), 'MM/dd/yyyy h:mm a');
      data.push([item.userId, item.rating.toString(), item.comment, submissionTime]);
    });

    return data;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Dashboard: {event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <Icons.activity className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="check-ins">
                <Icons.checkCircle className="mr-2 h-4 w-4" />
                Check-ins
              </TabsTrigger>
              <TabsTrigger value="feedback">
                <Icons.star className="mr-2 h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{registrations}</div>
                    <div className="text-sm text-muted-foreground">Total Registrations</div>
                    {event.capacity && (
                      <Progress value={(registrations / event.capacity) * 100} className="mt-2" />
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{checkIns}</div>
                    <div className="text-sm text-muted-foreground">Total Check-ins</div>
                    <Progress value={checkInRate} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {event.averageRating ? event.averageRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Rating ({event.ratingCount || 0} reviews)
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="mb-2 font-semibold">Check-in Code</h4>
                      <div className="flex items-center justify-between rounded-md border p-2">
                        <code className="rounded bg-gray-100 p-1 font-mono text-sm">
                          {event.checkInCode || 'No code set'}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(event.checkInCode || '')}
                          disabled={!event.checkInCode}
                        >
                          <Icons.copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="mb-2 font-semibold">Export Data</h4>
                      <div className="flex flex-col space-y-2">
                        <CSVDownload
                          data={prepareCheckInData()}
                          filename={`${event.title}-check-ins.csv`}
                          buttonText="Export Check-ins"
                        />
                        <CSVDownload
                          data={prepareFeedbackData()}
                          filename={`${event.title}-feedback.csv`}
                          buttonText="Export Feedback"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Check-ins Tab */}
            <TabsContent value="check-ins">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Checked-in Participants ({checkIns}/{registrations})
                </h3>
                <CSVDownload
                  data={prepareCheckInData()}
                  filename={`${event.title}-check-ins.csv`}
                  buttonText="Export as CSV"
                />
              </div>

              {checkIns > 0 ? (
                <div className="space-y-4">
                  {event.checkedInParticipants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10">
                          <Image
                            src={participant.avatar || '/images/avatar-placeholder.png'}
                            alt={participant.name}
                            className="rounded-full object-cover"
                            fill
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Checked in at{' '}
                            {format(parseISO(participant.checkedInAt), 'h:mm a, MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Checked In</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 py-10 text-center">
                  <Icons.checkCircle className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No check-ins yet</h3>
                  <p className="mt-1 text-gray-500">
                    Share your check-in code with attendees to see them here.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Feedback ({event.feedback.length || 0})</h3>
                <CSVDownload
                  data={prepareFeedbackData()}
                  filename={`${event.title}-feedback.csv`}
                  buttonText="Export as CSV"
                />
              </div>

              {event.feedback && event.feedback.length > 0 ? (
                <div className="space-y-4">
                  {event.feedback.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-2 flex justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Icons.star
                              key={i}
                              className={`h-5 w-5 ${
                                i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(item.submittedAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700">{item.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border bg-gray-50 py-10 text-center">
                  <Icons.star className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
                  <p className="mt-1 text-gray-500">
                    Encourage attendees to leave feedback after the event.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
