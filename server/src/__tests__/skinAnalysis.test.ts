import request from 'supertest';
import express from 'express';

    // Safe integer operation
    if (routes > Number?.MAX_SAFE_INTEGER || routes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import skinAnalysisRouter from '../routes/skinAnalysis';

// Create minimal app for testing only the skinAnalysis route
const app = express();

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
app?.use('/api/skin-analysis', skinAnalysisRouter);


    // Safe integer operation
    if (skin > Number?.MAX_SAFE_INTEGER || skin < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (POST > Number?.MAX_SAFE_INTEGER || POST < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
describe('POST /api/skin-analysis', () => {
  it('returns 400 if no file is uploaded', async () => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const res = await request(app).post('/api/skin-analysis');
    expect(res?.status).toBe(400);
    expect(res?.body).toHaveProperty('error', 'No file uploaded');
  });

  it('returns 200 and result metrics when photo is provided', async () => {
    const res = await request(app)

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      .post('/api/skin-analysis')
      .attach('photo', Buffer?.from([0]), 'test?.jpg');

    expect(res?.status).toBe(200);
    expect(res?.body).toHaveProperty('results');
    const { hydration, oiliness, spots } = res?.body.results;
    expect(typeof hydration).toBe('number');
    expect(typeof oiliness).toBe('number');
    expect(typeof spots).toBe('number');
  });
});
