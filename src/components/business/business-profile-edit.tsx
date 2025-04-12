'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, ChevronsRight, Building, MapPin, 
  Scissors, Camera, CreditCard, FileText, Save 
} from 'lucide-react';
import { LocationForm } from './forms/location-form';
import { ServiceForm } from './forms/service-form';
import { PhotoUploadForm } from './forms/photo-upload-form';
import { PaymentSettingsForm } from './forms/payment-settings-form';
import { PoliciesForm } from './forms/policies-form';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Reuse the same schema as the BusinessProfileWizard
const businessProfileSchema = z.object({
  // Location details
  address: z.string().min(1, "Address is required"),
  addressLine1: z.string().optional(), 
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("United States"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  serviceRadius: z.number().optional(),
  businessHours: z.array(z.object({
    day: z.string(),
    open: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional()
  })).default([
    { day: 'Monday', open: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Tuesday', open: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Wednesday', open: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Thursday', open: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Friday', open: true, openTime: '09:00', closeTime: '17:00' },
    { day: 'Saturday', open: false },
    { day: 'Sunday', open: false },
  ]),
  offersVirtualServices: z.boolean().default(false),
  virtualServicesDescription: z.string().optional(),
  
  // Services & Pricing
  services: z.array(z.object({
    name: z.string().min(1, "Service name is required"),
    duration: z.number().min(1, "Duration is required"),
    price: z.number().min(0, "Price is required"),
    description: z.string().optional(),
    category: z.string().optional(),
    id: z.string().optional(),
  })).default([]),
  offersPackages: z.boolean().default(false),
  offersSpecialDiscounts: z.boolean().default(false),
  offersGiftCards: z.boolean().default(false),
  specialOffersDescription: z.string().optional(),

  // Photo Upload
  businessPhotos: z.array(z.string()).default([]),
  
  // Payment Settings
  paymentMethods: z.array(z.string()).default([]),
  depositType: z.string().optional(),
  depositAmount: z.number().optional(),
  depositPercentage: z.number().optional(),
  depositNotes: z.string().optional(),
  
  // Business Policies
  cancellationPolicy: z.string().optional(),
  hasLateArrivalPolicy: z.boolean().default(false),
  lateArrivalGracePeriod: z.number().optional(),
  lateArrivalPolicy: z.string().optional(),
  additionalPolicies: z.string().optional(),
  requirePolicyConfirmation: z.boolean().default(false),
  includePoliciesInEmails: z.boolean().default(false)
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

// Wizard steps (reused)
const STEPS = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'services', label: 'Services', icon: Scissors },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'policies', label: 'Policies', icon: FileText },
];

export function BusinessProfileEdit() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema) as any,
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      offersVirtualServices: false,
      offersPackages: false,
      offersSpecialDiscounts: false,
      offersGiftCards: false,
      services: [],
      businessHours: [
        { day: 'Monday', open: true, openTime: '09:00', closeTime: '17:00' },
        { day: 'Tuesday', open: true, openTime: '09:00', closeTime: '17:00' },
        { day: 'Wednesday', open: true, openTime: '09:00', closeTime: '17:00' },
        { day: 'Thursday', open: true, openTime: '09:00', closeTime: '17:00' },
        { day: 'Friday', open: true, openTime: '09:00', closeTime: '17:00' },
        { day: 'Saturday', open: false },
        { day: 'Sunday', open: false },
      ],
    },
  });

  // Load existing business profile data
  useEffect(() => {
    async function loadBusinessProfile() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No user found');
        }
        
        // Fetch business profile
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('provider_id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setBusinessProfileId(data.id);
          
          // Reset form with fetched data
          form.reset({
            address: data.address || '',
            addressLine1: data.address_line1 || '',
            addressLine2: data.address_line2 || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zip_code || '',
            country: data.country || 'United States',
            latitude: data.latitude?.toString() || '',
            longitude: data.longitude?.toString() || '',
            serviceRadius: data.service_radius || undefined,
            businessHours: data.business_hours || [
              { day: 'Monday', open: true, openTime: '09:00', closeTime: '17:00' },
              { day: 'Tuesday', open: true, openTime: '09:00', closeTime: '17:00' },
              { day: 'Wednesday', open: true, openTime: '09:00', closeTime: '17:00' },
              { day: 'Thursday', open: true, openTime: '09:00', closeTime: '17:00' },
              { day: 'Friday', open: true, openTime: '09:00', closeTime: '17:00' },
              { day: 'Saturday', open: false },
              { day: 'Sunday', open: false },
            ],
            offersVirtualServices: data.offers_virtual_services || false,
            virtualServicesDescription: data.virtual_services_description || '',
            services: data.services || [],
            offersPackages: data.offers_packages || false,
            offersSpecialDiscounts: data.offers_special_discounts || false,
            offersGiftCards: data.offers_gift_cards || false,
            specialOffersDescription: data.special_offers_description || '',
            businessPhotos: data.business_photos || [],
            paymentMethods: data.payment_methods || [],
            depositType: data.deposit_type || '',
            depositAmount: data.deposit_amount || undefined,
            depositPercentage: data.deposit_percentage || undefined,
            depositNotes: data.deposit_notes || '',
            cancellationPolicy: data.cancellation_policy || '',
            hasLateArrivalPolicy: data.has_late_arrival_policy || false,
            lateArrivalGracePeriod: data.late_arrival_grace_period || undefined,
            lateArrivalPolicy: data.late_arrival_policy || '',
            additionalPolicies: data.additional_policies || '',
            requirePolicyConfirmation: data.require_policy_confirmation || false,
            includePoliciesInEmails: data.include_policies_in_emails || false,
          });
        }
      } catch (error) {
        console.error('Error loading business profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load business profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBusinessProfile();
  }, [form, toast]);

  // Navigate to next step
  const handleNextStep = async () => {
    try {
      // Validate current step
      const currentStepData = STEPS[currentStep].id;
      
      let fieldsToValidate: (keyof BusinessProfileFormValues)[] = [];
      
      // Determine which fields to validate based on the current step
      switch (currentStepData) {
        case 'location':
          fieldsToValidate = ['address', 'city', 'state', 'zipCode'];
          break;
        case 'services':
          // Services array can be empty, but we validate if a service has been added
          if (form.getValues('services').length > 0) {
            fieldsToValidate = ['services'];
          }
          break;
        case 'photos':
          // Photos are optional
          break;
        case 'payment':
          // Validate payment methods if any are selected
          if (form.getValues('paymentMethods').length > 0) {
            fieldsToValidate = ['paymentMethods'];
          }
          // Validate deposit fields if a deposit type is selected
          if (form.getValues('depositType') === 'fixed') {
            fieldsToValidate.push('depositAmount');
          } else if (form.getValues('depositType') === 'percentage') {
            fieldsToValidate.push('depositPercentage');
          }
          break;
        case 'policies':
          // Validate cancellation policy if it's custom
          if (form.getValues('cancellationPolicy') === 'custom') {
            fieldsToValidate = ['cancellationPolicy'];
          }
          // Validate late arrival policy if enabled
          if (form.getValues('hasLateArrivalPolicy')) {
            fieldsToValidate.push('lateArrivalPolicy', 'lateArrivalGracePeriod');
          }
          break;
      }
      
      // Validate specified fields
      const result = await form.trigger(fieldsToValidate);
      
      if (result) {
        // If this is the last step, submit the form
        if (currentStep === STEPS.length - 1) {
          handleSubmit();
        } else {
          // Otherwise, go to the next step
          setCurrentStep(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  // Go back to the previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Save the business profile
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }
      
      const values = form.getValues();
      
      // Format data for database
      const businessProfileData = {
        provider_id: user.id,
        address: values.address,
        address_line1: values.addressLine1,
        address_line2: values.addressLine2,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        country: values.country,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        service_radius: values.serviceRadius,
        business_hours: values.businessHours,
        offers_virtual_services: values.offersVirtualServices,
        virtual_services_description: values.virtualServicesDescription,
        services: values.services,
        offers_packages: values.offersPackages,
        offers_special_discounts: values.offersSpecialDiscounts,
        offers_gift_cards: values.offersGiftCards,
        special_offers_description: values.specialOffersDescription,
        business_photos: values.businessPhotos,
        payment_methods: values.paymentMethods,
        deposit_type: values.depositType,
        deposit_amount: values.depositAmount,
        deposit_percentage: values.depositPercentage,
        deposit_notes: values.depositNotes,
        cancellation_policy: values.cancellationPolicy,
        has_late_arrival_policy: values.hasLateArrivalPolicy,
        late_arrival_grace_period: values.lateArrivalGracePeriod,
        late_arrival_policy: values.lateArrivalPolicy,
        additional_policies: values.additionalPolicies,
        require_policy_confirmation: values.requirePolicyConfirmation,
        include_policies_in_emails: values.includePoliciesInEmails,
        completed_setup: true,
        updated_at: new Date().toISOString(),
      };
      
      // Update the business profile
      const { error } = await supabase
        .from('business_profiles')
        .update(businessProfileData)
        .eq('id', businessProfileId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Success',
        description: 'Business profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update business profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const currentStepId = STEPS[currentStep].id;
    
    switch (currentStepId) {
      case 'location':
        return <LocationForm form={form} />;
      case 'services':
        return <ServiceForm form={form} />;
      case 'photos':
        return <PhotoUploadForm form={form} />;
      case 'payment':
        return <PaymentSettingsForm form={form} />;
      case 'policies':
        return <PoliciesForm form={form} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Steps indicator */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              onClick={() => index < currentStep && setCurrentStep(index)}
              style={{ cursor: index < currentStep ? 'pointer' : 'default' }}
            >
              {index < currentStep ? (
                <Check className="h-6 w-6" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`text-sm mt-2 ${
                index <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card className="p-6">
        {renderStepContent()}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={currentStep === 0 || isSaving}
        >
          Back
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              {isSaving ? 'Saving...' : 'Save Profile'}
              <Save className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Next
              <ChevronsRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 