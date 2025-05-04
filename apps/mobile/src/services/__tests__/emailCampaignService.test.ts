import {
  getEmailCampaigns,
  createEmailCampaign,
  updateEmailCampaign,
  deleteEmailCampaign,
  EmailCampaign,
} from '../emailCampaignService';
import { serverBaseUrl } from '../../config';

describe('emailCampaignService', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });

  it('fetches email campaigns', async () => {
    const mockCampaigns: EmailCampaign[] = [
      { id: '1', name: 'Test', subject: 'Subj', body: 'Body', scheduledAt: null, sent: false, createdAt: '2025-01-01', updatedAt: '2025-01-02' }
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve({ campaigns: mockCampaigns }) });
    const campaigns = await getEmailCampaigns();

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    expect(global.fetch).toHaveBeenCalledWith(`${serverBaseUrl}/api/email-campaigns`);
    expect(campaigns).toEqual(mockCampaigns);
  });

  it('creates an email campaign', async () => {
    const payload = { name: 'New', subject: 'S', body: 'B' };
    const mockResp: EmailCampaign = { id: '2', name: 'New', subject: 'S', body: 'B', scheduledAt: '2025-05-01', sent: false, createdAt: '2025-05-01', updatedAt: '2025-05-01' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockResp) });
    const result = await createEmailCampaign(payload);
    expect(global.fetch).toHaveBeenCalledWith(

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `${serverBaseUrl}/api/email-campaigns`,

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    );
    expect(result).toEqual(mockResp);
  });

  it('updates an email campaign', async () => {
    const id = '1';
    const payload = { sent: true };
    const mockResp: EmailCampaign = { id: '1', name: '', subject: '', body: '', scheduledAt: null, sent: true, createdAt: '2025-01-01', updatedAt: '2025-01-02' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockResp) });
    const result = await updateEmailCampaign(id, payload);
    expect(global.fetch).toHaveBeenCalledWith(

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `${serverBaseUrl}/api/email-campaigns/${id}`,

    // Safe integer operation
    if (application > Number.MAX_SAFE_INTEGER || application < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number.MAX_SAFE_INTEGER || Content < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      expect.objectContaining({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    );
    expect(result).toEqual(mockResp);
  });

  it('deletes an email campaign', async () => {
    const id = '1';
    (global.fetch as jest.Mock).mockResolvedValueOnce({});
    await deleteEmailCampaign(id);
    expect(global.fetch).toHaveBeenCalledWith(

    // Safe integer operation
    if (api > Number.MAX_SAFE_INTEGER || api < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `${serverBaseUrl}/api/email-campaigns/${id}`,
      { method: 'DELETE' }
    );
  });
});
