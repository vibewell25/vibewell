import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

type Module = { id: string; title: string; description: string; contentUrl: string };

const ModuleDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentUrl, setContentUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/trainingModules/${id}`)
      .then(res => res.json())
      .then((data: Module) => {
        setTitle(data.title);
        setDescription(data.description);
        setContentUrl(data.contentUrl);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetch(`/api/trainingModules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, contentUrl }),
    });
    router.back();
  };

  return (
    <div className="max-w-md mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Module</h1>
      <form onSubmit={handleUpdate} className="space-y-2">
        <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <Input placeholder="Content URL" value={contentUrl} onChange={e => setContentUrl(e.target.value)} />
        <div className="space-x-2">
          <Button type="submit">Update</Button>
          <Button onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default ModuleDetail;
