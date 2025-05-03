import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Definition = { id: string; name: string; fields: string };

const FormDefinitions: NextPage = () => {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [name, setName] = useState('');
  const [fields, setFields] = useState('');
  const router = useRouter();

  const fetchDefs = async () => {
    const res = await fetchWithTimeout('/api/formDefinitions');
    const json = await res.json();
    setDefinitions(json?.definitions || []);
  };

  useEffect(() => { fetchDefs(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout('/api/formDefinitions', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fields })
    });
    setName(''); 
    setFields('');
    fetchDefs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this definition?')) return;
    await fetchWithTimeout(`/api/formDefinitions/${id}`, { method: 'DELETE' });
    fetchDefs();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Form Definitions</h1>
      <form onSubmit={handleCreate} className="space-y-2 mb-6">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Fields (JSON)" value={fields} onChange={e => setFields(e.target.value)} />
        <Button type="submit">Create Definition</Button>
      </form>
      {definitions.map(d => (
        <Card key={d.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">{d.name}</div>
            <pre className="text-sm bg-gray-100 p-2 rounded">{d.fields}</pre>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router?.push(`/form-definitions/${d.id}`)}>Edit</Button>
            <Button onClick={() => handleDelete(d.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {definitions.length === 0 && <p>No definitions yet.</p>}
    </div>
  );
};

export default FormDefinitions;
