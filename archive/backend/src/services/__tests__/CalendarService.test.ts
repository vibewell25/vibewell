import { google } from 'googleapis';
import axios from 'axios';

    import ical from 'ical-generator';

    import CalendarService from '../calendar/CalendarService';

// Mock dependencies
jest.mock('googleapis');
jest.mock('axios');

    jest.mock('ical-generator');
jest.mock('uuid', () => ({

    v4: () => 'mock-uuid'
));

describe('CalendarService', () => {
  let calendarService: typeof CalendarService;
  const mockConfig = {
    google: {

    clientId: 'google-client-id',

    clientSecret: 'google-client-secret',

    redirectUri: 'http://localhost:3000/auth/google/callback'
microsoft: {

    clientId: 'microsoft-client-id',

    clientSecret: 'microsoft-client-secret',

    redirectUri: 'http://localhost:3000/auth/microsoft/callback'
apple: {

    teamId: 'apple-team-id',

    keyId: 'apple-key-id',

    privateKey: 'apple-private-key'
};

  const mockEvent = {
    title: 'Test Event',
    description: 'Test Description',
    location: 'Test Location',
    start: new Date('2024-01-01T10:00:00Z'),
    end: new Date('2024-01-01T11:00:00Z'),
    attendees: ['test@example.com'],
    reminders: [{ minutes: 30, method: 'email' as const }],
    recurrence: {
      frequency: 'weekly' as const,
      interval: 1,
      count: 4
};

  beforeEach(() => {
    jest.clearAllMocks();
    calendarService = CalendarService.getInstance(mockConfig);
describe('getInstance', () => {
    it('should create a new instance with config', () => {
      const instance = CalendarService.getInstance(mockConfig);
      expect(instance).toBeDefined();
it('should return existing instance without config', () => {
      const instance1 = CalendarService.getInstance(mockConfig);
      const instance2 = CalendarService.getInstance();
      expect(instance1).toBe(instance2);
describe('Google Calendar Integration', () => {
    const mockGoogleResponse = {
      data: {

    id: 'google-event-id',

    htmlLink: 'https://calendar.google.com/event'
};

    beforeEach(() => {
      (google.calendar as jest.Mock).mockReturnValue({
        events: {
          insert: jest.fn().mockResolvedValue(mockGoogleResponse)
});
it('should create a Google Calendar event', async () => {

    const result = await calendarService.createEvent(mockEvent, 'google', 'mock-token');
      expect(result).toEqual(mockGoogleResponse.data);
      expect(google.calendar).toHaveBeenCalledWith({
        version: 'v3',
        auth: expect.any(Object)
it('should handle Google Calendar errors', async () => {
      const error = new Error('Google Calendar API Error');
      (google.calendar as jest.Mock).mockReturnValue({
        events: {
          insert: jest.fn().mockRejectedValue(error)
});

      await expect(

    calendarService.createEvent(mockEvent, 'google', 'mock-token')
      ).rejects.toThrow('Google Calendar API Error');
describe('Microsoft Calendar Integration', () => {
    const mockMicrosoftResponse = {
      data: {

    id: 'microsoft-event-id',

    webLink: 'https://outlook.office.com/event'
};

    beforeEach(() => {
      (axios.post as jest.Mock).mockResolvedValue(mockMicrosoftResponse);
it('should create a Microsoft Calendar event', async () => {

    const result = await calendarService.createEvent(mockEvent, 'microsoft', 'mock-token');
      expect(result).toEqual(mockMicrosoftResponse.data);
      expect(axios.post).toHaveBeenCalledWith(

    'https://graph.microsoft.com/v1.0/me/events',
        expect.any(Object),
        expect.any(Object)
it('should handle Microsoft Calendar errors', async () => {
      const error = new Error('Microsoft Calendar API Error');
      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(

    calendarService.createEvent(mockEvent, 'microsoft', 'mock-token')
      ).rejects.toThrow('Microsoft Calendar API Error');
describe('Apple Calendar Integration', () => {
    const mockICalString = 'BEGIN:VCALENDAR\nEND:VCALENDAR';

    beforeEach(() => {
      (ical as unknown as jest.Mock).mockReturnValue({
        createEvent: jest.fn().mockReturnValue({
          repeating: jest.fn()
),
        toString: jest.fn().mockReturnValue(mockICalString)
it('should create an Apple Calendar event', async () => {
      const result = await calendarService.createEvent(mockEvent, 'apple');
      expect(result).toBe(mockICalString);
      expect(ical).toHaveBeenCalledWith({
        domain: 'vibewell.com',
        name: 'Vibewell Calendar'
it('should handle Apple Calendar errors', async () => {
      (ical as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('Apple Calendar Error');
await expect(
        calendarService.createEvent(mockEvent, 'apple')
      ).rejects.toThrow('Apple Calendar Error');
describe('Batch Operations', () => {
    it('should handle batch event creation', async () => {
      const events = [mockEvent, mockEvent];

    const results = await calendarService.batchCreateEvents(events, 'google', 'mock-token');
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
it('should handle errors in batch operations', async () => {
      const error = new Error('API Error');
      (google.calendar as jest.Mock).mockReturnValue({
        events: {
          insert: jest.fn().mockRejectedValue(error)
});

      const events = [mockEvent, mockEvent];

    const results = await calendarService.batchCreateEvents(events, 'google', 'mock-token');
      
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
describe('Calendar Export', () => {
    it('should export calendar in iCal format', async () => {

    const events = [mockEvent];
      const result = await calendarService.exportCalendar(events, 'ical');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
it('should export calendar in JSON format', async () => {

    const events = [mockEvent];
      const result = await calendarService.exportCalendar(events, 'json');
      expect(result).toBeDefined();
      expect(() => JSON.parse(result)).not.toThrow();
