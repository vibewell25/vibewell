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
}
interface InventoryManagementProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}
export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    type: 'product',
    description: '',
    price: 0,
    quantity: 0,
    category: '',
    status: 'active',
  });
  const handleAddItem = async () => {
    try {
      await onAddItem(newItem);
      setIsAddModalOpen(false);
      setNewItem({
        name: '',
        type: 'product',
        description: '',
        price: 0,
        quantity: 0,
        category: '',
        status: 'active',
      });
      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };
  const handleUpdateItem = async () => {
    if (!editingItem) return;
    try {
      await onUpdateItem(editingItem.id, editingItem);
      setEditingItem(null);
      toast.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await onDeleteItem(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center">
          <Icons.PlusIcon className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.type === 'product'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.quantity || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Icons.PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Icons.TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add New Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newItem.type}
                  onChange={e =>
                    setNewItem({ ...newItem, type: e.target.value as 'product' | 'service' })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {newItem.type === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddItem} className="btn-primary">
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={editingItem.type}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      type: e.target.value as 'product' | 'service',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={e =>
                    setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {editingItem.type === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    value={editingItem.quantity}
                    onChange={e =>
                      setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editingItem.status}
                  onChange={e =>
                    setEditingItem({
                      ...editingItem,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setEditingItem(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleUpdateItem} className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
