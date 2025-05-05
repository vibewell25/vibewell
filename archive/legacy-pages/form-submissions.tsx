import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Submission = { id: string; definitionId: string; data: any };

const FormSubmissions: NextPage = () => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const router = useRouter();

  const fetchSubs = async () => {
    const res = await fetchWithTimeout('/api/formSubmissions');
    const json = await res.json();
    setSubs(json.submissions || []);
useEffect(() => { fetchSubs(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    await fetchWithTimeout(`/api/formSubmissions/${id}`, { method: 'DELETE' });
    fetchSubs();
return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Form Submissions</h1>
      {subs.map(s => (
        <Card key={s.id} className="mb-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">ID: {s.id}</div>
            <div>Definition: {s.definitionId}</div>
          </div>
          <div className="space-x-2">
            <Button onClick={() => router.push(`/form-submissions/${s.id}`)}>Details</Button>
            <Button onClick={() => handleDelete(s.id)}>Delete</Button>
          </div>
        </Card>
      ))}
      {subs.length === 0 && <p>No submissions.</p>}
    </div>
export default FormSubmissions;
