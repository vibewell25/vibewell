import { UseFormReturn } from 'react-hook-form';
import { BusinessProfileFormValues } from '@/components/business/business-profile-wizard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

interface BasicInfoFormProps {
  form: UseFormReturn<BusinessProfileFormValues>;
export function BasicInfoForm({ form }: BasicInfoFormProps) {
  const businessTypes = [
    { value: 'salon', label: 'Hair Salon' },
    { value: 'spa', label: 'Spa & Wellness' },
    { value: 'barbershop', label: 'Barbershop' },
    { value: 'cosmetics', label: 'Beauty & Cosmetics' },
    { value: 'wellness', label: 'Wellness Center' },
    { value: 'fitness', label: 'Fitness & Training' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Basic Information</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Enter the basic information about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              {...form.register('businessName')}
              placeholder="Your Business Name"
            />
            {form.formState.errors.businessName && (
              <p className="text-sm text-red-500">{form.formState.errors.businessName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe your business and services..."
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {form.watch('description').length || 0}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">
              Business Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.watch('businessType')}
              onValueChange={(value) =>
                form.setValue('businessType', value as any, { shouldValidate: true })
>
              <SelectTrigger id="businessType">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.businessType && (
              <p className="text-sm text-red-500">{form.formState.errors.businessType.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How clients can reach your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Business Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="business@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Business Phone <span className="text-red-500">*</span>
            </Label>
            <Input id="phone" {...form.register('phone')} placeholder="+1 (555) 123-4567" />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              {...form.register('website')}
              placeholder="https://yourbusiness.com"
            />
            {form.formState.errors.website && (
              <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
