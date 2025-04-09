'use client';

import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronsRight, Building, MapPin, Scissors, Camera, CreditCard, FileText } from 'lucide-react';
import { LocationForm } from './forms/location-form';
import { ServiceForm } from './forms/service-form';
import { PhotoUploadForm } from './forms/photo-upload-form';
import { PaymentSettingsForm } from './forms/payment-settings-form';
import { PoliciesForm } from './forms/policies-form';

// Define the schema for business profile form
const businessProfileSchema = z.object({
  // Location details
  address: z.string().min(1, "Address is required"),
  addressLine1: z.string().optional(), // For backward compatibility with form
  addressLine2: z.string().optional(), // For backward compatibility with form
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("United States"),
  latitude: z.string().optional(), // For location detection
  longitude: z.string().optional(), // For location detection
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

// Wizard steps
const STEPS = [
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'services', label: 'Services', icon: Scissors },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'policies', label: 'Policies', icon: FileText },
];

// Define proper props interfaces for form components
interface FormComponentProps {
  form: UseFormReturn<BusinessProfileFormValues>;
}

// Export the interface for use in other components
export interface LocationFormProps extends FormComponentProps {}
export interface ServiceFormProps extends FormComponentProps {}
export interface PhotoFormProps extends FormComponentProps {}
export interface PaymentFormProps extends FormComponentProps {}
export interface PoliciesFormProps extends FormComponentProps {}

export function BusinessProfileWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
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

  // Move to the next step
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

  // Submit the form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const values = form.getValues();
      console.log("Form submitted:", values);
      
      // Create formatted business profile data
      const businessProfileData = {
        ...values,
        completedSetup: true,
        updatedAt: new Date().toISOString(),
      };
      
      // Here you would typically send the data to your API
      // Example API call
      // const response = await fetch('/api/business/profile', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(businessProfileData),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message and redirect
      alert("Business profile saved successfully!");
      // Redirect to business dashboard or profile page
      // router.push('/business/dashboard');
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error saving your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step content
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

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <div className="flex items-center gap-2 mb-8">
        <Building className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Business Profile Setup</h1>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between relative">
          {/* Progress Bar */}
          <div 
            className="absolute h-1 bg-primary top-5 z-0 transition-all duration-300"
            style={{ 
              width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
              left: 0 
            }}
          />
          
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isActive ? 'bg-primary text-primary-foreground border-2 border-primary' : 
                      isCompleted ? 'bg-primary text-primary-foreground' : 
                      'bg-muted text-muted-foreground'}
                  `}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                </div>
                <span className={`text-sm ${isActive ? 'font-medium text-primary' : isCompleted ? 'font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Step Progress */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
        <p className="text-sm font-medium">
          {STEPS[currentStep].label}
        </p>
      </div>
      
      {/* Main Content */}
      <Card className="border shadow-sm">
        <div className="p-6">
          {renderStepContent()}
        </div>
        
        {/* Navigation Buttons */}
        <div className="p-6 border-t bg-muted/50 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  // Save progress but move to next step without validation
                  setCurrentStep(prev => prev + 1);
                }}
              >
                Skip for now
              </Button>
            )}
            
            <Button
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              {currentStep === STEPS.length - 1 ? (
                isSubmitting ? 'Saving...' : 'Save Profile'
              ) : (
                <>
                  Next Step <ChevronsRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Form Completion Info */}
      {currentStep < STEPS.length - 1 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            You can complete the remaining steps later. Your progress will be saved.
          </p>
        </div>
      )}
    </div>
  );
} 