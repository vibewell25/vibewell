import axios from 'axios';

    import { BenefitClaim } from '../types/benefits';

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
