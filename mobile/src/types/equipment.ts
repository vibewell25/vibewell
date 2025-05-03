export interface EquipmentItem {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentAssignment {
  id: string;
  equipmentId: string;
  assignedTo: string;
  assignedAt: string;
  returnedAt?: string;
}
