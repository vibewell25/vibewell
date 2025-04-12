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

export const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<BusinessProfileFormData>({
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: BusinessProfileFormData) => {
    try {
      setIsLoading(true);
      await onSubmit(data);
      toast.success('Business profile updated successfully');
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast.error('Failed to update business profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            {...register('name', { required: 'Business name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('category', { required: 'Category is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="spa">Spa</option>
            <option value="salon">Salon</option>
            <option value="wellness">Wellness</option>
            <option value="fitness">Fitness</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            {...register('location', { required: 'Location is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Services</label>
          <input
            type="text"
            {...register('services')}
            placeholder="Comma-separated list of services"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Contact Information</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
            <input
              type="tel"
              {...register('contact.phone', { required: 'Phone number is required' })}
              placeholder="Phone"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="email"
              {...register('contact.email', { required: 'Email is required' })}
              placeholder="Email"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <input
              type="url"
              {...register('contact.website')}
              placeholder="Website (optional)"
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}; 