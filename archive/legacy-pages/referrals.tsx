import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { fetchWithTimeout } from '@/utils/timeout-handler';

const Referrals: NextPage = () => {
  const [code, setCode] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    const fetchReferralCode = async () => {
      const res = await fetchWithTimeout('/api/referrals/code');
      const data = await res.json();
      setCode(data.referralCode);
fetchReferralCode();
[]);

  const apply = async () => {
    const res = await fetchWithTimeout('/api/referrals/apply', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ code: input })
const data = await res.json();
    if (res.ok) setMsg(`Granted ${data.rewardPoints} points!`);
    else setMsg(data.error);
return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Referrals</h1>
      <Card className="mb-4">
        <p className="mb-2">Your code: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{code}</code></p>
        <div className="flex space-x-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter code" />
          <Button onClick={apply}>Apply</Button>
        </div>
        {msg && <p className="mt-2 text-green-600">{msg}</p>}
      </Card>
    </div>
export default Referrals;
