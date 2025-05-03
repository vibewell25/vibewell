import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Business } from '@/types/business';

interface BusinessProfileFormData {
  name: string;
  description: string;
  category: 'spa' | 'salon' | 'wellness' | 'fitness';
  location: string;
  services: string[];
  openingHours: {
    day: string;
    hours: string;
  }[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

interface BusinessProfileFormProps {
  initialData?: Business;
  onSubmit: (data: BusinessProfileFormData) => Promise<void>;
}

export {};
