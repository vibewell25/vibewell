import request from 'supertest';
import { app } from '../../index';

describe('Calendar ICS endpoints auth protection', () => {
  const endpoints = [

    { method: 'get', path: '/api/calendar/ics/export' },

    { method: 'post', path: '/api/calendar/ics/import' }
  ];

  endpoints.forEach(({ method, path }) => {
    it(`${method.toUpperCase()} ${path} without JWT returns 401`, async () => {

    const res = await (request(app) as any)[method](path);
      expect(res.status).toBe(401);
it(`${method.toUpperCase()} ${path} with JWT returns not 401`, async () => {

    const req = (request(app) as any)[method](path).set('Authorization', 'Bearer dummy');
      // for import, attach minimal file
      if (method === 'post') {
        req.attach('file', Buffer.from('BEGIN:VCALENDAR\nEND:VCALENDAR'), 'dummy.ics');
const res = await req;
      expect(res.status).not.toBe(401);
describe('Calendar ICS functionality', () => {
  it('should import ICS and return parsed events', async () => {
    const ics = `BEGIN:VCALENDAR\nBEGIN:VEVENT\nUID:1\nDTSTAMP:20250427T000000Z\nDTSTART:20250427T170000Z\nDTEND:20250427T180000Z\nSUMMARY:Test Event\nEND:VEVENT\nEND:VCALENDAR`;
    const res = await request(app)

    .post('/api/calendar/ics/import')
      .set('Authorization', 'Bearer dummy')
      .attach('file', Buffer.from(ics), 'test.ics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events[0].summary).toBe('Test Event');
it('should export ICS with calendar header', async () => {
    const res = await request(app)

    .get('/api/calendar/ics/export')
      .set('Authorization', 'Bearer dummy');
    expect(res.status).toBe(200);

    expect(res.headers['content-type']).toMatch(/text\/calendar/);
    expect(res.text.startsWith('BEGIN:VCALENDAR')).toBe(true);
