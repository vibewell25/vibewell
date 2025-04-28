import axios from 'axios';
import { InventoryItem } from '../types/inventory';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.vibewell.com/v1';

export const inventoryApi = {
  getItems: async (): Promise<InventoryItem[]> => {
    const res = await axios.get(`${API_URL}/inventory`);
    return res.data;
  },

  getItemById: async (id: string): Promise<InventoryItem> => {
    const res = await axios.get(`${API_URL}/inventory/${id}`);
    return res.data;
  },

  createItem: async (
    item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<InventoryItem> => {
    const res = await axios.post(`${API_URL}/inventory`, item);
    return res.data;
  },

  updateItem: async (
    id: string,
    item: Partial<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<InventoryItem> => {
    const res = await axios.put(`${API_URL}/inventory/${id}`, item);
    return res.data;
  },

  deleteItem: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_URL}/inventory/${id}`);
    return res.data;
  }
};

export default inventoryApi;
