import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchWithTimeout } from '../src/utils/timeout-handler';

type Tier = { id: string; name: string; requiredPoints: number; discount: number };
type Transaction = { id: string; userId: string; tierId: string; points: number; type: string; tier: Tier };

const Loyalty: NextPage = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [txs, setTxs] = useState<Transaction[]>([]);

  const fetchData = async () => {
    const [tiersRes, balRes, txRes] = await Promise.all([
      fetchWithTimeout('/api/loyalty/tiers'),
      fetchWithTimeout('/api/loyalty/balance'),
      fetchWithTimeout('/api/loyalty/transactions')
    ]);
    const [{ tiers }, { balance }, { transactions }] = await Promise.all([
      tiersRes.json(), balRes.json(), txRes.json()
    ]);
    setTiers(tiers);
    setBalance(balance);
    setTxs(transactions);
  };

  useEffect(() => { fetchData(); }, []);

  const redeem = async (tierId: string) => {
    const res = await fetchWithTimeout('/api/loyalty/redeem', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tierId })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Redeemed ${tierId}, new balance ${data.balance}`);
      fetchData();
    } else {
      setMessage(data.error || 'Redeem failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Loyalty</h1>
      <p className="mb-4">Balance: {balance} points</p>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <h2 className="text-xl font-semibold mb-2">Tiers</h2>
      {tiers.map(t => (
        <Card key={t.id} className="mb-2 flex justify-between items-center">
          <div>{t.name} ({t.requiredPoints} pts) - {t.discount}% off</div>
          <Button onClick={() => redeem(t.id)} disabled={balance < t.requiredPoints}>Redeem</Button>
        </Card>
      ))}
      <h2 className="text-xl font-semibold mt-6 mb-2">Transactions</h2>
      {txs.length ? (
        txs.map(tx => (
          <Card key={tx.id} className="mb-2">
            <div>{tx.type} {tx.points} pts for {tx.tier.name || 'N/A'}</div>
          </Card>
        ))
      ) : (
        <p>No transactions.</p>
      )}
    </div>
  );
};

export default Loyalty;
