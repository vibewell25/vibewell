import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../../src/utils/timeout-handler';

type Document = { id: string; url: string; type: string; };

type Submission = { id: string; definitionId: string; data: any; documents: Document[] };

const SubmissionDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [sub, setSub] = useState<Submission | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchSubmission = async () => {
      const res = await fetchWithTimeout(`/api/formSubmissions/${id}`);
      const data = await res.json();
      setSub(data);
fetchSubmission();
[id]);

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    await fetchWithTimeout(`/api/documents/${docId}`, { method: 'DELETE' });
    setSub(prev => prev ? { ...prev, documents: prev.documents.filter(d => d.id !== docId) } : prev);
return (
    <div className="max-w-2xl mx-auto py-6">
      {sub && (
        <>
          <h1 className="text-2xl font-bold mb-4">Submission Details</h1>
          <p className="mb-2">Definition: {sub.definitionId}</p>
          <pre className="mb-4 bg-gray-100 p-2 rounded">{JSON.stringify(sub.data, null, 2)}</pre>
          <h2 className="text-xl font-semibold mb-2">Documents</h2>
          {sub.documents.map(d => (
            <Card key={d.id} className="mb-2 flex justify-between items-center">
              <a href={d.url} target="_blank" rel="noopener noreferrer">View</a>
              <Button onClick={() => handleDeleteDoc(d.id)}>Delete</Button>
            </Card>
          ))}
        </>
      )}
      <Button onClick={() => router.back()}>Back</Button>
    </div>
export default SubmissionDetail;
