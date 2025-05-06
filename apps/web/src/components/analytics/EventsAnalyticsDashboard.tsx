import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/events';
import { getEvents } from '@/lib/api/events';
import { format, parseISO, subDays } from 'date-fns';
import { CSVDownload } from '@/components/ui/csv-download';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
from 'recharts';

interface EventsAnalyticsDashboardProps {
  initialEvents?: Event[];
export function EventsAnalyticsDashboard({ initialEvents }: EventsAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    async function {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout'); loadEvents() {
      try {
        setLoading(true);
        if (initialEvents && initialEvents.length > 0) {
          setEvents(initialEvents);
else {
          const fetchedEvents = await getEvents();
          setEvents(fetchedEvents);
catch (error) {
        console.error('Error loading events:', error);
finally {
        setLoading(false);
loadEvents();
[initialEvents]);

  // Filter events based on date range and category
  const filteredEvents = events.filter((event) => {
    const eventDate = parseISO(event.startDate);
    const isInDateRange = eventDate >= dateRange.from && eventDate <= dateRange.to;
    const matchesCategory =
      selectedCategoryFilter === 'all' || event.category === selectedCategoryFilter;
    return isInDateRange && matchesCategory;
// Calculate analytics metrics
  const totalEvents = filteredEvents.length;
  const totalParticipants = filteredEvents.reduce(
    (sum, event) => sum + (event.participantsCount || 0),
    0,
const totalCheckIns = filteredEvents.reduce(
    (sum, event) => sum + (event.checkedInParticipants.length || 0),
    0,
const checkInRate = totalParticipants > 0 ? (totalCheckIns / totalParticipants) * 100 : 0;

  const eventsWithFeedback = filteredEvents.filter(
    (event) => event.feedback && event.feedback.length > 0,
const totalFeedback = eventsWithFeedback.reduce(
    (sum, event) => sum + (event.feedback.length || 0),
    0,
const averageRating =
    eventsWithFeedback.length > 0
      ? eventsWithFeedback.reduce((sum, event) => sum + (event.averageRating || 0), 0) /
        eventsWithFeedback.length
      : 0;

  // Data for charts
  const generateEventsByCategory = () => {
    const categoryMap = new Map<string, number>();

    filteredEvents.forEach((event) => {
      const category = event.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
return Array.from(categoryMap.entries()).map(([category, count]) => ({
      name: category,
      value: count,
));
const generateEventsByDate = () => {
    const dateMap = new Map<string, number>();

    filteredEvents.forEach((event) => {
      const date = format(parseISO(event.startDate), 'yyyy-MM-dd');
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date: format(parseISO(date), 'MMM dd'),
        events: count,
));
const generateParticipantsByEvent = () => {
    return filteredEvents
      .sort((a, b) => (b.participantsCount || 0) - (a.participantsCount || 0))
      .slice(0, 10)
      .map((event) => ({
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        participants: event.participantsCount || 0,
        checkIns: event.checkedInParticipants.length || 0,
));
const generateRatingsByEvent = () => {
    return eventsWithFeedback
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10)
      .map((event) => ({
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        rating: event.averageRating || 0,
        reviews: event.feedback.length || 0,
));
// Data for export
  const prepareEventsData = () => {
    if (filteredEvents.length === 0) {
      return [['No events data available']];
// Column headers
    const data = [
      [
        'Event Title',
        'Category',
        'Date',
        'Participants',
        'Check-ins',
        'Average Rating',
        'Feedback Count',
      ],
    ];

    // Add each event as a row
    filteredEvents.forEach((event) => {
      const eventDate = format(parseISO(event.startDate), 'MM/dd/yyyy');
      data.push([
        event.title,
        event.category,
        eventDate,
        event.participantsCount.toString() || '0',
        (event.checkedInParticipants.length || 0).toString(),
        (event.averageRating || 0).toFixed(1),
        (event.feedback.length || 0).toString(),
      ]);
return data;
const prepareCheckInsData = () => {
    if (
      filteredEvents.length === 0 ||
      !filteredEvents.some((e) => e.checkedInParticipants && e.checkedInParticipants.length > 0)
    ) {
      return [['No check-in data available']];
// Column headers
    const data = [['Event Title', 'Event Date', 'User Name', 'User ID', 'Check-in Time']];

    // Add each check-in as a row
    filteredEvents.forEach((event) => {
      if (event.checkedInParticipants && event.checkedInParticipants.length > 0) {
        const eventDate = format(parseISO(event.startDate), 'MM/dd/yyyy');
        event.checkedInParticipants.forEach((participant) => {
          const checkInTime = format(parseISO(participant.checkedInAt), 'MM/dd/yyyy h:mm a');
          data.push([event.title, eventDate, participant.name, participant.userId, checkInTime]);
return data;
const prepareFeedbackData = () => {
    if (eventsWithFeedback.length === 0) {
      return [['No feedback data available']];
// Column headers
    const data = [['Event Title', 'Event Date', 'User ID', 'Rating', 'Comment', 'Submission Time']];

    // Add each feedback as a row
    eventsWithFeedback.forEach((event) => {
      if (event.feedback && event.feedback.length > 0) {
        const eventDate = format(parseISO(event.startDate), 'MM/dd/yyyy');
        event.feedback.forEach((item) => {
          const submissionTime = format(parseISO(item.submittedAt), 'MM/dd/yyyy h:mm a');
          data.push([
            event.title,
            eventDate,
            item.userId,
            item.rating.toString(),
            item.comment,
            submissionTime,
          ]);
return data;
// Get unique categories for the filter
  const categories = Array.from(new Set(events.map((event) => event.category)));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icons.spinner className="text-primary h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold">Events Analytics Dashboard</h1>
        <div className="flex flex-col items-center gap-2 md:flex-row">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CSVDownload
            data={prepareEventsData()}
            filename="events-analytics.csv"
            buttonText="Export Data"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkInRate.toFixed(1)}%</div>
            <Progress value={checkInRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">From {totalFeedback} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <Icons.activity className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="checkins">
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
                <CardDescription>Distribution of events across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={generateEventsByCategory()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateEventsByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Events Timeline</CardTitle>
                <CardDescription>Events distribution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateEventsByDate()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="events" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Events by Participation</CardTitle>
                <CardDescription>Events with the most participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={generateParticipantsByEvent()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="participants" fill="#8884d8" name="Registered" />
                      <Bar dataKey="checkIns" fill="#82ca9d" name="Checked In" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Check-ins Tab */}
        <TabsContent value="checkins">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Check-in Analytics</h3>
            <CSVDownload
              data={prepareCheckInsData()}
              filename="event-checkins.csv"
              buttonText="Export Check-ins"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Check-in Rate</CardTitle>
                <CardDescription>
                  Percentage of registered participants who checked in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Checked In', value: totalCheckIns },
                          { name: 'Not Checked In', value: totalParticipants - totalCheckIns },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#82ca9d" />
                        <Cell fill="#d88884" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
                <CardDescription>Latest check-ins across all events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 space-y-4 overflow-auto">
                  {filteredEvents
                    .flatMap((event) =>
                      (event.checkedInParticipants || []).map((participant) => ({
                        eventTitle: event.title,
                        eventId: event.id,
                        ...participant,
)),
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime(),
                    )
                    .slice(0, 10)
                    .map((checkIn, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div>
                          <p className="font-medium">{checkIn.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Event:{' '}
                            {checkIn.eventTitle.length > 20
                              ? checkIn.eventTitle.substring(0, 20) + '...'
                              : checkIn.eventTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(checkIn.checkedInAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Badge variant="outline">Checked In</Badge>
                      </div>
                    ))}
                  {!filteredEvents.some(
                    (e) => e.checkedInParticipants && e.checkedInParticipants.length > 0,
                  ) && (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No check-in data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Feedback Analytics</h3>
            <CSVDownload
              data={prepareFeedbackData()}
              filename="event-feedback.csv"
              buttonText="Export Feedback"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Highest Rated Events</CardTitle>
                <CardDescription>Events with the best feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={generateRatingsByEvent()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="rating" fill="#FFBB28" name="Average Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Distribution of ratings across all events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {eventsWithFeedback.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            const ratingCounts = [0, 0, 0, 0, 0];
                            eventsWithFeedback.forEach((event) => {
                              event.feedback.forEach((f) => {
                                if (f.rating >= 1 && f.rating <= 5) {
                                  ratingCounts[f.rating - 1]++;
return [
                              { name: '1 Star', value: ratingCounts[0] },
                              { name: '2 Stars', value: ratingCounts[1] },
                              { name: '3 Stars', value: ratingCounts[2] },
                              { name: '4 Stars', value: ratingCounts[3] },
                              { name: '5 Stars', value: ratingCounts[4] },
                            ];
)()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#FF8042" />
                          <Cell fill="#FFBB28" />
                          <Cell fill="#00C49F" />
                          <Cell fill="#0088FE" />
                          <Cell fill="#8884D8" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No feedback data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest feedback from events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 space-y-4 overflow-auto">
                  {eventsWithFeedback
                    .flatMap((event) =>
                      (event.feedback || []).map((feedback) => ({
                        eventTitle: event.title,
                        eventId: event.id,
                        ...feedback,
)),
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
                    )
                    .slice(0, 10)
                    .map((feedback, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-2 flex justify-between">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Icons.star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(feedback.submittedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <p className="mb-1 text-sm text-muted-foreground">
                          Event: {feedback.eventTitle}
                        </p>
                        <p className="text-gray-700">{feedback.comment}</p>
                      </div>
                    ))}
                  {eventsWithFeedback.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No feedback data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
