'use client';

import { useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BusinessProfileFormValues } from '@/components/business/business-profile-wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ShieldCheckIcon, Upload, FileText, X } from 'lucide-react';

interface VerificationFormProps {
  form: UseFormReturn<BusinessProfileFormValues>;
}

export function VerificationForm({ form }: VerificationFormProps) {
  const [documentType, setDocumentType] = useState<string>('business_license');
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle document file selection
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a PDF, JPG, or PNG file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB max
      alert('File must be less than 10MB');
      return;
    }

    // Set file name for display
    setDocumentName(file.name);

    // Create preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just show an icon (no preview)
      setDocumentPreview(null);
    }

    // Set form value
    form.setValue('verificationDocument', file, { shouldValidate: true });
    form.setValue('verificationType', documentType, { shouldValidate: true });
  };

  // Remove document
  const removeDocument = () => {
    form.setValue('verificationDocument', null, { shouldValidate: true });
    setDocumentPreview(null);
    setDocumentName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Business Verification</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Information</CardTitle>
          <CardDescription>
            Provide your business's legal information for verification purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="legalBusinessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the legal name of your business" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxIdNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID Number / EIN</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12-3456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="non_profit">Non-Profit Organization</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Document</CardTitle>
          <CardDescription>Upload a document to verify your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="verificationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={value => {
                        field.onChange(value);
                        setDocumentType(value);
                      }}
                      defaultValue={field.value || 'business_license'}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="business_license" />
                        </FormControl>
                        <FormLabel className="font-normal">Business License</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="tax_certificate" />
                        </FormControl>
                        <FormLabel className="font-normal">Tax Certificate</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="articles_of_incorporation" />
                        </FormControl>
                        <FormLabel className="font-normal">Articles of Incorporation</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="certification" />
                        </FormControl>
                        <FormLabel className="font-normal">Professional Certification</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4 space-y-4">
              {documentName ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{documentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {documentType
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeDocument}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted border-2 border-dashed border-muted-foreground/25 h-40">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your document here, or click to browse
                  </p>
                  <Badge variant="outline">PDF, JPG, PNG (Max 10MB)</Badge>
                </div>
              )}

              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="document-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleDocumentChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {documentName ? 'Replace Document' : 'Upload Document'}
                </Button>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="termsAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I certify that all the information provided is accurate and complete
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, you agree to our verification process and understand that
                    providing false information may result in account termination.
                  </p>
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
