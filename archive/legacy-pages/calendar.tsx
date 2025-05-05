import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { ChangeEvent } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type GoogleEvent = { id: string; summary: string; start: { dateTime: string }; };
type OutlookEvent = { id: string; subject: string; start: { dateTime: string }; };
type Booking = { id: string; service: { name: string }; appointmentDate: string; duration: number };

const Calendar: NextPage = () => {
  const [googleEvents, setGoogleEvents] = useState<GoogleEvent[]>([]);
  const [outlookEvents, setOutlookEvents] = useState<OutlookEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expandedGoogle, setExpandedGoogle] = useState<Record<string, boolean>>({});
  const [expandedOutlook, setExpandedOutlook] = useState<Record<string, boolean>>({});
  const [icsFile, setIcsFile] = useState<File | null>(null);
  const [icsEvents, setIcsEvents] = useState<Array<{ uid: string; summary: string; description?: string; start: string; end: string; location?: string }>>([]);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const connectProvider = async (provider: 'google' | 'outlook') => {
    const res = await fetchWithTimeout(`/api/calendar/${provider}/auth/url`);
    const { url } = await res.json();
    if (window && window.location) {
      window.location.href = url;
const fetchEvents = async (provider: 'google' | 'outlook') => {
    const res = await fetchWithTimeout(`/api/calendar/${provider}/events`);
    const data = await res.json();
    if (provider === 'google') setGoogleEvents(data);
    else setOutlookEvents(data);
const fetchBookings = async () => {
    const res = await fetchWithTimeout('/api/bookings');
    const data = await res.json();
    setBookings(data.bookings || []);
const handleAddEvent = async (bookingId: string) => {
    const res = await fetchWithTimeout('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
if (res.ok) {
      alert('Event added to calendars');
      fetchEvents('google');
      fetchEvents('outlook');
else {
      alert('Error adding event');
const toggleGoogleDetails = (id: string) => {
    setExpandedGoogle(prev => ({ ...prev, [id]: !prev[id] }));
const toggleOutlookDetails = (id: string) => {
    setExpandedOutlook(prev => ({ ...prev, [id]: !prev[id] }));
const handleRemoveEvent = async (provider: 'google' | 'outlook', id: string) => {
    if (!confirm('Remove this event?')) return;
    const body: any = {};
    if (provider === 'google') body.googleEventId = id;
    else body.outlookEventId = id;
    const res = await fetchWithTimeout('/api/calendar/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
if (res.ok) {
      fetchEvents(provider);
else {
      alert('Error removing event');
const handleICSFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      setIcsFile(e.target.files[0] || null);
const handleICSImport = async () => {
    if (!icsFile) return alert('Please select an ICS file');
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', icsFile);
      const res = await fetchWithTimeout('/api/calendar/ics/import', { 
        method: 'POST', 
        body: formData 
if (!res.ok) return alert('ICS import failed');
      const data = await res.json();
      setIcsEvents(data.events || []);
finally {
      setImporting(false);
const handleICSExport = async () => {
    setExporting(true);
    try {
      const res = await fetchWithTimeout('/api/calendar/ics/export');
      if (!res.ok) throw new Error('ICS export failed');
      const blob = await res.blob();
      if (window && URL) {
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const filename = `calendar-export-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.ics`;
        
        if (document) {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
catch (e: any) {
      alert(e.message || 'ICS export failed');
finally {
      setExporting(false);
useEffect(() => {
    fetchEvents('google');
    fetchEvents('outlook');
    fetchBookings();
[]);

  return (
    <div>
      <h1>Calendar Integration</h1>
      <div className="flex space-x-4 my-4">
        <Button onClick={() => connectProvider('google')}>Connect Google Calendar</Button>
        <Button onClick={() => connectProvider('outlook')}>Connect Outlook Calendar</Button>
      </div>
      <h2>Google Events</h2>
      {googleEvents.length ? (
        googleEvents.map(e => (
          <Card key={e.id} className="mb-2">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{e.summary}</div>
                <div className="text-gray-600">{new Date(e.start.dateTime).toLocaleString()}</div>
              </div>
              <div className="space-x-2">
                <Button onClick={() => toggleGoogleDetails(e.id)}>Details</Button>
                <Button onClick={() => handleRemoveEvent('google', e.id)}>Remove</Button>
              </div>
            </div>
            {expandedGoogle[e.id] && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p className="font-semibold">Description:</p>
                <p>{(e as any).description || 'No description'}</p>
                <p className="font-semibold mt-2">Ends:</p>
                <p>{new Date((e as any).end.dateTime).toLocaleString()}</p>
              </div>
            )}
          </Card>
        ))
      ) : (
        <p>No Google events.</p>
      )}
      <h2>Outlook Events</h2>
      {outlookEvents.length ? (
        outlookEvents.map(e => (
          <Card key={e.id} className="mb-2">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{e.subject}</div>
                <div className="text-gray-600">{new Date(e.start.dateTime).toLocaleString()}</div>
              </div>
              <div className="space-x-2">
                <Button onClick={() => toggleOutlookDetails(e.id)}>Details</Button>
                <Button onClick={() => handleRemoveEvent('outlook', e.id)}>Remove</Button>
              </div>
            </div>
            {expandedOutlook[e.id] && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p className="font-semibold">Details:</p>
                <div dangerouslySetInnerHTML={{ __html: (e as any).body.content || 'No details' }} />
                <p className="font-semibold mt-2">Ends:</p>
                <p>{new Date((e as any).end.dateTime).toLocaleString()}</p>
              </div>
            )}
          </Card>
        ))
      ) : (
        <p>No Outlook events.</p>
      )}
      <h2 className="text-2xl font-semibold mt-6 mb-2">Import ICS Events</h2>
      <div className="mb-4">
        <input type="file" accept=".ics" onChange={handleICSFileChange} />
        <Button onClick={handleICSImport} disabled={importing}>
          {importing ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Importing…
            </div>
          ) : (
            'Import ICS'
          )}
        </Button>
      </div>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Export ICS File</h2>
      <div className="mb-4">
        <Button onClick={handleICSExport} disabled={exporting}>
          {exporting ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Exporting…
            </div>
          ) : (
            'Export ICS'
          )}
        </Button>
      </div>
      {icsEvents.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Imported ICS Events</h3>
          {icsEvents.map(ev => (
            <Card key={ev.uid} className="mb-2">
              <div className="font-semibold">{ev.summary}</div>
              <div className="text-gray-600">{new Date(ev.start).toLocaleString()} - {new Date(ev.end).toLocaleString()}</div>
              <div>{ev.description}</div>
              <div className="text-sm text-gray-500">{ev.location}</div>
            </Card>
          ))}
        </div>
      )}
      <h2 className="text-2xl font-semibold mt-6 mb-2">Add Booking to Calendar</h2>
      {bookings.length ? (
        bookings.map(b => (
          <Card key={b.id} className="mb-2 flex justify-between items-center">
            <div>
              <div className="font-semibold">{b.service.name}</div>
              <div>{new Date(b.appointmentDate).toLocaleString()}</div>
            </div>
            <Button onClick={() => handleAddEvent(b.id)}>Add to Calendar</Button>
          </Card>
        ))
      ) : (
        <p>No bookings available.</p>
      )}
    </div>
export default Calendar;
