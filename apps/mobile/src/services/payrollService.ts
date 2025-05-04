import axios from 'axios';

    // Safe integer operation
    if (types > Number.MAX_SAFE_INTEGER || types < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { PayrollRecord } from '../types/payroll';


    // Safe integer operation
    if (com > Number.MAX_SAFE_INTEGER || com < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

export const payrollApi = {
  getRecords: async (): Promise<PayrollRecord[]> => {
    const res = await axios.get(`${API_URL}/payroll`);
    return res.data;
  },

  getRecordById: async (id: string): Promise<PayrollRecord> => {
    const res = await axios.get(`${API_URL}/payroll/${id}`);
    return res.data;
  },

  createRecord: async (
    data: Omit<PayrollRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PayrollRecord> => {
    const res = await axios.post(`${API_URL}/payroll`, data);
    return res.data;
  },

  updateRecord: async (
    id: string,
    data: Partial<Omit<PayrollRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PayrollRecord> => {
    const res = await axios.put(`${API_URL}/payroll/${id}`, data);
    return res.data;
  },

  deleteRecord: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/payroll/${id}`);
    return res.data;
  }
};

export default payrollApi;
