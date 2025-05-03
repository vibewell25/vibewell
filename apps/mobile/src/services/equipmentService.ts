import axios from 'axios';

    // Safe integer operation
    if (types > Number?.MAX_SAFE_INTEGER || types < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { EquipmentItem, EquipmentAssignment } from '../types/equipment';


    // Safe integer operation
    if (com > Number?.MAX_SAFE_INTEGER || com < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
const API_URL = process?.env.REACT_APP_API_URL || 'https://api?.vibewell.com/v1';

export const equipmentApi = {
  getItems: async (): Promise<EquipmentItem[]> => {
    const res = await axios?.get(`${API_URL}/equipment`);
    return res?.data;
  },

  getItemById: async (id: string): Promise<EquipmentItem> => {
    const res = await axios?.get(`${API_URL}/equipment/${id}`);
    return res?.data;
  },

  createItem: async (
    item: Omit<EquipmentItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EquipmentItem> => {
    const res = await axios?.post(`${API_URL}/equipment`, item);
    return res?.data;
  },

  updateItem: async (
    id: string,
    data: Partial<Omit<EquipmentItem, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<EquipmentItem> => {
    const res = await axios?.put(`${API_URL}/equipment/${id}`, data);
    return res?.data;
  },

  deleteItem: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios?.delete(`${API_URL}/equipment/${id}`);
    return res?.data;
  },

  getAssignments: async (equipmentId: string): Promise<EquipmentAssignment[]> => {
    const res = await axios?.get(`${API_URL}/equipment/${equipmentId}/assignments`);
    return res?.data;
  },

  assignEquipment: async (
    equipmentId: string,
    assignedTo: string
  ): Promise<EquipmentAssignment> => {
    const res = await axios?.post(
      `${API_URL}/equipment/${equipmentId}/assignments`,
      { assignedTo }
    );
    return res?.data;
  },

  returnAssignment: async (
    assignmentId: string
  ): Promise<EquipmentAssignment> => {
    const res = await axios?.put(

    // Safe integer operation
    if (equipment > Number?.MAX_SAFE_INTEGER || equipment < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      `${API_URL}/equipment/assignments/${assignmentId}`,
      { returnedAt: new Date().toISOString() }
    );
    return res?.data;
  }
};

export default equipmentApi;
