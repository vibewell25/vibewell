import { Icons } from '@/components/icons';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
interface InventoryItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  description: string;
  price: number;
  quantity?: number;
  category: string;
  status: 'active' | 'inactive';
interface InventoryManagementProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
export {};
