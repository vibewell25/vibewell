import { serverBaseUrl } from '../config';

export interface PromotionCode {
  id: string;
  code: string;
  description?: string;
  discount: number;
  validFrom: string;
  validTo: string;
}

export const getPromotionCodes = async (): Promise<PromotionCode[]> => {
  const res = await fetch(`${serverBaseUrl}/api/promotions`);
  const data = await res.json();
  return data.codes;
};

export const createPromotionCode = async (payload: Partial<PromotionCode>): Promise<PromotionCode> => {
  const res = await fetch(`${serverBaseUrl}/api/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updatePromotionCode = async (id: string, payload: Partial<PromotionCode>): Promise<PromotionCode> => {
  const res = await fetch(`${serverBaseUrl}/api/promotions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deletePromotionCode = async (id: string): Promise<void> => {
  await fetch(`${serverBaseUrl}/api/promotions/${id}`, { method: 'DELETE' });
};
