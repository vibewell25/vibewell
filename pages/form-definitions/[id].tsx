import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const DefinitionDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [name, setName] = useState('');
  const [fields, setFields] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/formDefinitions/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name);
        setFields(data.fields);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/formDefinitions/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fields })
    });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Definition</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="Fields (JSON)" value={fields} onChange={e => setFields(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default DefinitionDetail;
