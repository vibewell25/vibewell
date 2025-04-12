'use client';

import { useState } from 'react';
import { PaymentFormProps } from '@/components/business/business-profile-wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, DollarSign, AlertCircle, Building2 as Bank, CreditCard as CreditCardIcon } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Payment methods
const PAYMENT_METHODS = [
  { id: 'credit-card', label: 'Credit/Debit Card' },
  { id: 'cash', label: 'Cash' },
  { id: 'bank-transfer', label: 'Bank Transfer' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'venmo', label: 'Venmo' },
  { id: 'zelle', label: 'Zelle' },
  { id: 'apple-pay', label: 'Apple Pay' },
  { id: 'google-pay', label: 'Google Pay' },
  { id: 'crypto', label: 'Cryptocurrency' }
];

// Deposit options
const DEPOSIT_OPTIONS = [
  { value: 'none', label: 'No deposit required' },
  { value: 'fixed', label: 'Fixed amount' },
  { value: 'percentage', label: 'Percentage of service cost' }
];

export function PaymentSettingsForm({ form }: PaymentFormProps) {
  const [depositType, setDepositType] = useState<string>('none');
  const [acceptsDeposits, setAcceptsDeposits] = useState<boolean>(false);
  
  // Get existing payment methods from form or initialize an empty array
  const paymentMethods = form.watch('paymentMethods') || [];
  
  // Handle payment method selection
  const handlePaymentMethodChange = (methodId: string, checked: boolean) => {
    const updatedMethods = checked
      ? [...paymentMethods, methodId]
      : paymentMethods.filter(id => id !== methodId);
    
    form.setValue('paymentMethods', updatedMethods, { 
      shouldValidate: true,
      shouldDirty: true 
    });
  };
  
  // Toggle deposit acceptance
  const handleDepositToggle = (checked: boolean) => {
    setAcceptsDeposits(checked);
    
    if (!checked) {
      setDepositType('none');
      form.setValue('depositAmount', undefined, { shouldValidate: true });
      form.setValue('depositPercentage', undefined, { shouldValidate: true });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Payment Settings</h2>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Select the payment methods you accept from customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((method) => (
              <div key={method.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={`payment-method-${method.id}`}
                  checked={paymentMethods.includes(method.id)}
                  onCheckedChange={(checked) => 
                    handlePaymentMethodChange(method.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`payment-method-${method.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {method.label}
                </label>
              </div>
            ))}
          </div>
          
          {paymentMethods.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Please select at least one payment method</p>
                <p className="text-xs mt-1">Customers need to know which payment options are available.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Deposit Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Deposits</CardTitle>
          <CardDescription>
            Configure if and how you collect deposits for bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Accept Booking Deposits</FormLabel>
              <FormDescription>
                Require customers to pay a deposit when booking services
              </FormDescription>
            </div>
            <Switch
              checked={acceptsDeposits}
              onCheckedChange={handleDepositToggle}
            />
          </div>
          
          {acceptsDeposits && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <FormField
                control={form.control}
                name="depositType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Type</FormLabel>
                    <Select
                      value={depositType}
                      onValueChange={(value) => {
                        setDepositType(value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deposit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPOSIT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {depositType === 'fixed' && (
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Fixed amount to charge as deposit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {depositType === 'percentage' && (
                <FormField
                  control={form.control}
                  name="depositPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Percentage</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="50"
                            className="pr-8"
                          />
                        </FormControl>
                        <div className="absolute right-3 top-2.5 text-muted-foreground">%</div>
                      </div>
                      <FormDescription>
                        Percentage of service cost to charge as deposit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="depositNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Optional notes about your deposit policy to display to customers"
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain your deposit policy, such as refund conditions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Payment Integration (Future Feature) */}
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Integration</CardTitle>
              <CardDescription>
                Connect payment processors to accept online payments
              </CardDescription>
            </div>
            <Button variant="outline" disabled>Coming Soon</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 opacity-60">
              <CreditCardIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Stripe</p>
              <p className="text-xs text-muted-foreground text-center">
                Accept credit cards directly on your booking page
              </p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 opacity-60">
              <Bank className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Bank Payments</p>
              <p className="text-xs text-muted-foreground text-center">
                Accept direct bank transfers securely
              </p>
            </div>
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 opacity-60">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-muted-foreground/10">
                <span className="text-muted-foreground font-bold">+</span>
              </div>
              <p className="text-sm font-medium">More Options</p>
              <p className="text-xs text-muted-foreground text-center">
                Additional payment processors coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 