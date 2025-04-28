import { getPromotionCodes, createPromotionCode, updatePromotionCode, deletePromotionCode, PromotionCode } from '../promotionService';
import { serverBaseUrl } from '../../config';

describe('promotionService', () => {
  beforeEach(() => { global.fetch = jest.fn(); });
  afterEach(() => { jest.resetAllMocks(); });

  it('fetches promotion codes', async () => {
    const mockCodes: PromotionCode[] = [
      { id: '1', code: 'SAVE10', description: 'Test', discount: 10, validFrom: '2025-01-01T00:00:00Z', validTo: '2025-12-31T00:00:00Z' }
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve({ codes: mockCodes }) });
    const codes = await getPromotionCodes();
    expect(global.fetch).toHaveBeenCalledWith(`${serverBaseUrl}/api/promotions`);
    expect(codes).toEqual(mockCodes);
  });

  it('creates a promotion code', async () => {
    const payload = { code: 'NEW', discount: 5 };
    const mockResp: PromotionCode = { id: '2', code: 'NEW', description: '', discount: 5, validFrom: '', validTo: '' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockResp) });
    const result = await createPromotionCode(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      `${serverBaseUrl}/api/promotions`,
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    );
    expect(result).toEqual(mockResp);
  });

  it('updates a promotion code', async () => {
    const id = '1';
    const payload = { discount: 15 };
    const mockResp: PromotionCode = { id: '1', code: '', description: '', discount: 15, validFrom: '', validTo: '' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({ json: () => Promise.resolve(mockResp) });
    const result = await updatePromotionCode(id, payload);
    expect(global.fetch).toHaveBeenCalledWith(
      `${serverBaseUrl}/api/promotions/${id}`,
      expect.objectContaining({ method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    );
    expect(result).toEqual(mockResp);
  });

  it('deletes a promotion code', async () => {
    const id = '1';
    (global.fetch as jest.Mock).mockResolvedValueOnce({});
    await deletePromotionCode(id);
    expect(global.fetch).toHaveBeenCalledWith(
      `${serverBaseUrl}/api/promotions/${id}`,
      { method: 'DELETE' }
    );
  });
});
