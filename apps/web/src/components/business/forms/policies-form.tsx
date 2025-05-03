'use client';;
import { useState } from 'react';
import { PoliciesFormProps } from '@/components/business/business-profile-wizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/switch';
import { FileText, InfoIcon } from 'lucide-react';

// Cancellation policies
const CANCELLATION_POLICIES = [
  {
    id: 'flexible',
    name: 'Flexible',
    description: 'Full refund up to 24 hours before the appointment',
    penalty: 'No refund for cancellations within 24 hours',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Full refund up to 48 hours before the appointment',
    penalty: '50% refund for cancellations 24-48 hours before, no refund within 24 hours',
  },
  {
    id: 'strict',
    name: 'Strict',
    description: 'Full refund up to 7 days before the appointment',
    penalty: '50% refund for cancellations 2-7 days before, no refund within 48 hours',
  },
  {
    id: 'custom',
    name: 'Custom Policy',
    description: 'Define your own cancellation policy',
    penalty: '',
  },
];

export function PoliciesForm({ form }: PoliciesFormProps) {
  const [cancellationPolicy, setCancellationPolicy] = useState<string>(
    form?.getValues('cancellationPolicy') || 'flexible',
  );
  const [hasLatePolicy, setHasLatePolicy] = useState<boolean>(
    form?.getValues('hasLateArrivalPolicy') || false,
  );

  // Handle cancellation policy selection
  const handleCancellationPolicyChange = (value: string) => {
    setCancellationPolicy(value);

    if (value !== 'custom') {
      const selectedPolicy = CANCELLATION_POLICIES?.find((policy) => policy?.id === value);

      if (selectedPolicy) {
        form?.setValue(
          'cancellationPolicy',
          selectedPolicy?.description + '. ' + selectedPolicy?.penalty,
          {
            shouldValidate: true,
            shouldDirty: true,
          },
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Business Policies</h2>
      </div>

      {/* Cancellation Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
          <CardDescription>Set your cancellation and refund policy for bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Select a Cancellation Policy</FormLabel>
            <RadioGroup
              value={cancellationPolicy}
              onValueChange={handleCancellationPolicyChange}
              className="space-y-4"
            >
              {CANCELLATION_POLICIES?.map((policy) => (
                <div key={policy?.id} className="flex items-start space-x-2">
                  <RadioGroupItem value={policy?.id} id={`policy-${policy?.id}`} className="mt-1" />
                  <div className="grid gap-1?.5">
                    <label
                      htmlFor={`policy-${policy?.id}`}
                      className="cursor-pointer text-sm font-medium leading-none"
                    >
                      {policy?.name}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {policy?.description}
                      {policy?.penalty ? `. ${policy?.penalty}.` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {cancellationPolicy === 'custom' && (
            <FormField
              control={form?.control}
              name="cancellationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Cancellation Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your cancellation and refund policy here..."
                      className="resize-none"
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>Be clear about refund conditions and deadlines</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Late Arrival Policy */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Late Arrival Policy</CardTitle>
              <CardDescription>
                Define your policy for clients who arrive late to appointments
              </CardDescription>
            </div>
            <Switch
              checked={hasLatePolicy}
              onCheckedChange={(checked) => {
                setHasLatePolicy(checked);
                form?.setValue('hasLateArrivalPolicy', checked, { shouldValidate: true });

                if (!checked) {
                  form?.setValue('lateArrivalPolicy', '', { shouldValidate: true });
                  form?.setValue('lateArrivalGracePeriod', 0, { shouldValidate: true });
                }
              }}
            />
          </div>
        </CardHeader>

        {hasLatePolicy && (
          <CardContent className="space-y-6">
            <FormField
              control={form?.control}
              name="lateArrivalGracePeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grace Period</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field?.onChange(parseInt(e?.target.value || '0', 10))}
                        min={0}
                        max={60}
                        className="w-20"
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                  <FormDescription>
                    How long after the appointment start time will you wait for clients
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form?.control}
              name="lateArrivalPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Late Arrival Policy</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe what happens if clients arrive after the grace period..."
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Examples: "Services will be shortened to fit the remaining time" or "Appointment
                    may be rescheduled at our discretion"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        )}
      </Card>

      {/* Additional Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Policies</CardTitle>
          <CardDescription>Add any other policies or rules for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form?.control}
            name="additionalPolicies"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add any additional policies or rules for your business here..."
                    className="resize-none"
                    rows={6}
                  />
                </FormControl>
                <FormDescription>
                  Examples: child policies, health requirements, dress code, COVID-19 precautions,
                  etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Policy Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Display Settings</CardTitle>
          <CardDescription>
            Configure how and when your policies are displayed to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel className="text-sm font-medium">Require Policy Acknowledgment</FormLabel>
              <p className="text-xs text-muted-foreground">
                Customers must check a box to confirm they've read your policies
              </p>
            </div>
            <Switch
              checked={form?.watch('requirePolicyConfirmation') || false}
              onCheckedChange={(checked) => {
                form?.setValue('requirePolicyConfirmation', checked, { shouldValidate: true });
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel className="text-sm font-medium">
                Include Policies in Booking Confirmations
              </FormLabel>
              <p className="text-xs text-muted-foreground">
                Your policies will be included in booking confirmation emails
              </p>
            </div>
            <Switch
              checked={form?.watch('includePoliciesInEmails') || false}
              onCheckedChange={(checked) => {
                form?.setValue('includePoliciesInEmails', checked, { shouldValidate: true });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-700">
        <div className="flex space-x-3">
          <InfoIcon className="mt-0?.5 h-5 w-5 text-blue-500" />
          <div>
            <h4 className="mb-1 text-sm font-medium text-blue-800">Why policies matter</h4>
            <p className="text-sm">
              Clear policies help set expectations with your clients, reduce no-shows, and protect
              your business. Well-defined policies show professionalism and can reduce
              misunderstandings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
