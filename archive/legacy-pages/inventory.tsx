import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import type { FormEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type InventoryItem = { id: string; name: string; description: string; quantity: number };

const Inventory: NextPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout('/api/inventory');
      const json = await res.json();
      setItems(json.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async (e: FormEvent) => {
    setCreating(true);
    try {
      e.preventDefault();
      await fetchWithTimeout('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, quantity })
      });
      setName(''); 
      setDescription(''); 
      setQuantity(0);
      fetchItems();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetchWithTimeout(`/api/inventory/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      const header = ['id','name','description','quantity'];
      const rows = items.map(item => [item.id, item.name, item.description, item.quantity]);
      const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      
      if (window && URL && document) {
        const url = URL.createObjectURL(blob);
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const filename = `inventory-export-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch {
      alert('CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input type="number" placeholder="Quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
        <Button type="submit" disabled={creating}>
          {creating ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Adding…
            </div>
          ) : (
            'Add Item'
          )}
        </Button>
      </form>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportCSV} disabled={exporting || loading}>
          {exporting ? (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Exporting…
            </div>
          ) : (
            'Export CSV'
          )}
        </Button>
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      {items.map(item => (
        <Card key={item.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{item.name} (Qty: {item.quantity})</div>
            <div>{item.description}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/inventory/${item.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(item.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {!loading && items.length === 0 && <p>No inventory items.</p>}
    </div>
  );
};

export default Inventory;
