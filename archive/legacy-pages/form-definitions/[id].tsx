import React, { useState, useEffect, FormEvent } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

const DefinitionDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [name, setName] = useState('');
  const [fields, setFields] = useState('');

  useEffect(() => {
    if (!id) return;
    
    const fetchDefinition = async () => {
      const res = await fetchWithTimeout(`/api/formDefinitions/${id}`);
      const data = await res.json();
      setName(data.name);
      setFields(data.fields);
fetchDefinition();
[id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await fetchWithTimeout(`/api/formDefinitions/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, fields })
if (router) {
      router.back();
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
export default DefinitionDetail;
