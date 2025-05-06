import { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '@/components/ui';
import { getBeautyEvents, createBeautyEvent, updateBeautyEvent } from '@/lib/api/beauty';
import { EventType } from '@/lib/api/beauty';

const eventTypes: EventType[] = [
  'facial',
  'mask',
  'exfoliation',
  'treatment',
  'dermatologist',
  'spa',
  'routine',
  'other',
];

const repeatOptions = [
  { value: 'none', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function BeautyCalendar() {
  const [events, setEvents] = useState<BeautyEvent[]>([]);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEvent, setNewEvent] = useState<Omit<BeautyEvent, 'id' | 'userId'>>({
    title: '',
    type: 'routine',
    date: new Date().toISOString(),
    duration: 30,
    repeat: 'none',
    notes: '',
    completed: false,
    notification: true,
useEffect(() => {
    loadEvents();
[]);

  const loadEvents = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const beautyEvents = await getBeautyEvents();
      setEvents(beautyEvents);
catch (error) {
      console.error('Error loading events:', error);
const handleSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      await createBeautyEvent(newEvent);
      setShowNewEvent(false);
      setNewEvent({
        title: '',
        type: 'routine',
        date: new Date().toISOString(),
        duration: 30,
        repeat: 'none',
        notes: '',
        completed: false,
        notification: true,
loadEvents();
catch (error) {
      console.error('Error creating event:', error);
const handleToggleComplete = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');eventId: string, completed: boolean) => {
    try {
      await updateBeautyEvent(eventId, { completed });
      loadEvents();
catch (error) {
      console.error('Error updating event:', error);
const getEventsByDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
const generateCalendarDays = () => {
    const days = [];
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      days.push(null);
// Add days of the month
    for (let i = 1; i <= lastDay.getDate(); if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
      days.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i));
return days;
const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
else {
      newDate.setMonth(newDate.getMonth() + 1);
setSelectedDate(newDate);
return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beauty Calendar</h2>
        <Button onClick={() => setShowNewEvent(!showNewEvent)}>
          {showNewEvent ? 'Cancel' : 'New Event'}
        </Button>
      </div>

      {showNewEvent && (
        <Card className="space-y-4 p-6">
          <Input
            label="Event Title"
            value={newEvent.title}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
          />

          <Select
            label="Event Type"
            value={newEvent.type}
            onChange={(e) =>
              setNewEvent((prev) => ({ ...prev, type: e.target.value as EventType }))
options={eventTypes.map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Date & Time"
              value={new Date(newEvent.date).toISOString().slice(0, 16)}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, date: new Date(e.target.value).toISOString() }))
/>
            <Input
              type="number"
              label="Duration (minutes)"
              value={newEvent.duration}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, duration: parseInt(e.target.value) || 30 }))
/>
          </div>

          <Select
            label="Repeat"
            value={newEvent.repeat}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, repeat: e.target.value }))}
            options={repeatOptions}
          />

          <Input
            label="Notes"
            value={newEvent.notes}
            onChange={(e) => setNewEvent((prev) => ({ ...prev, notes: e.target.value }))}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newEvent.notification}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, notification: e.target.checked }))}
            />
            <label className="text-sm">Enable notifications</label>
          </div>

          <Button onClick={handleSubmit}>Create Event</Button>
        </Card>
      )}

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigateMonth('prev')}>
            Previous
          </Button>
          <h3 className="text-xl font-semibold">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <Button variant="outline" onClick={() => navigateMonth('next')}>
            Next
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-medium">
              {day}
            </div>
          ))}
          {generateCalendarDays().map((date, index) => (
            <div
              key={index}
              className={`min-h-[100px] rounded border p-2 ${
                date ? 'hover:bg-gray-50' : 'bg-gray-100'
`}
            >
              {date && (
                <>
                  <div className="text-right text-sm text-gray-600">{date.getDate()}</div>
                  <div className="mt-1 space-y-1">
                    {getEventsByDate(date).map((event) => (
                      <div
                        key={event.id}
                        className={`rounded p-1 text-xs ${
                          event.completed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">Upcoming Events</h3>
        <div className="space-y-4">
          {events
            .filter((event) => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map((event) => (
              <div
                key={event.id}
                className="flex items-start justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={event.completed}
                    onChange={() => handleToggleComplete(event.id, !event.completed)}
                    className="mt-1"
                  />
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleString()} • {event.duration} mins
                    </p>
                    {event.notes && <p className="mt-1 text-sm text-gray-500">{event.notes}</p>}
                  </div>
                </div>
                <Badge>{event.type}</Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
