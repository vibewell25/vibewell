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

    fetch(`${serverBaseUrl}/api/promotions`);
  const data = await res.json();
  return data.codes;
};

export const createPromotionCode = async (payload: Partial<PromotionCode>): Promise<PromotionCode> => {

    fetch(`${serverBaseUrl}/api/promotions`, {
    method: 'POST',

    fetch(`${serverBaseUrl}/api/promotions/${id}`, {
    method: 'PUT',

    fetch(`${serverBaseUrl}/api/promotions/${id}`, { method: 'DELETE' });
};
