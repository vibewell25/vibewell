import request from 'supertest';
import express from 'express';
import skinAnalysisRouter from '../routes/skinAnalysis';

// Create minimal app for testing only the skinAnalysis route
const app = express();
app.use('/api/skin-analysis', skinAnalysisRouter);

describe('POST /api/skin-analysis', () => {
  it('returns 400 if no file is uploaded', async () => {
    const res = await request(app).post('/api/skin-analysis');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'No file uploaded');
  });

  it('returns 200 and result metrics when photo is provided', async () => {
    const res = await request(app)
      .post('/api/skin-analysis')
      .attach('photo', Buffer.from([0]), 'test.jpg');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
    const { hydration, oiliness, spots } = res.body.results;
    expect(typeof hydration).toBe('number');
    expect(typeof oiliness).toBe('number');
    expect(typeof spots).toBe('number');
  });
});
