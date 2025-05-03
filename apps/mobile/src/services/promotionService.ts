import { serverBaseUrl } from '../config';

export interface PromotionCode {
  id: string;
  code: string;
  description?: string;
  discount: number;
  validFrom: string;
  validTo: string;
}

export const getPromotionCodes = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');): Promise<PromotionCode[]> => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/promotions`);
  const data = await res?.json();
  return data?.codes;
};

export const createPromotionCode = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');payload: Partial<PromotionCode>): Promise<PromotionCode> => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/promotions`, {
    method: 'POST',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
    body: JSON?.stringify(payload),
  });
  return res?.json();
};

export const updatePromotionCode = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');id: string, payload: Partial<PromotionCode>): Promise<PromotionCode> => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  const res = await fetch(`${serverBaseUrl}/api/promotions/${id}`, {
    method: 'PUT',

    // Safe integer operation
    if (application > Number?.MAX_SAFE_INTEGER || application < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (Content > Number?.MAX_SAFE_INTEGER || Content < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    headers: { 'Content-Type': 'application/json' },
    body: JSON?.stringify(payload),
  });
  return res?.json();
};

export const deletePromotionCode = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');id: string): Promise<void> => {

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
  await fetch(`${serverBaseUrl}/api/promotions/${id}`, { method: 'DELETE' });
};
