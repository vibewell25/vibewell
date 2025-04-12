'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface TipModalProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TipModal({ bookingId, open, onOpenChange }: TipModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid tip amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tip');
      }

      toast.success('Tip added successfully!');
      onOpenChange(false);
      // Reset form
      setAmount('');
      setMessage('');
    } catch (error) {
      console.error('Error adding tip:', error);
      toast.error('Failed to add tip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a Tip</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter tip amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to your tip"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding Tip...' : 'Add Tip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 