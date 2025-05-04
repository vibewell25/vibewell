import axios from 'axios';

    // Safe integer operation
    if (types > Number.MAX_SAFE_INTEGER || types < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { BenefitClaim } from '../types/benefits';


    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

export const benefitsApi = {
  getClaims: async (): Promise<BenefitClaim[]> => {
    const res = await axios.get(`${API_URL}/benefits`);
    return res.data;
  },

  getClaimById: async (id: string): Promise<BenefitClaim> => {
    const res = await axios.get(`${API_URL}/benefits/${id}`);
    return res.data;
  },

  createClaim: async (
    data: Omit<BenefitClaim, 'id' | 'requestedAt' | 'processedAt'>
  ): Promise<BenefitClaim> => {
    const res = await axios.post(`${API_URL}/benefits`, data);
    return res.data;
  },

  updateClaim: async (
    id: string,
    data: Partial<Omit<BenefitClaim, 'id' | 'userId' | 'requestedAt' | 'processedAt'>>
  ): Promise<BenefitClaim> => {
    const res = await axios.put(`${API_URL}/benefits/${id}`, data);
    return res.data;
  },

  deleteClaim: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/benefits/${id}`);
    return res.data;
  }
};

export default benefitsApi;
