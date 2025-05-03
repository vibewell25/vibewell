'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { EventCategory } from '@/types/events';
import { createEvent } from '@/lib/api/events';
import { useAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/Button';
import { format, addHours } from 'date-fns';
import { Icons } from '@/components/icons';
import { validateForm } from '@/utils/form-validation';

export default function CreateEventPage() {
  const router = useRouter();
  const {
    user
  } = useAuth();
  // Event form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Wellness');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [location, setLocation] = useState<Partial<EventLocation>>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    virtual: false,
    meetingUrl: '',
  });
  const [capacity, setCapacity] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Redirect if not logged in
  if (!authLoading && !user) {
    router?.push('/auth/login?returnUrl=' + encodeURIComponent('/events/create'));
    return null;
  }
  // Available categories
  const categories: EventCategory[] = [
    'Wellness',
    'Fitness',
    'Meditation',
    'Nutrition',
    'Yoga',
    'Mental Health',
    'Community',
    'Workshop',
    'Webinar',
    'Other',
  ];
  // Add a tag
  const addTag = () => {
    if (tagInput?.trim() && !tags?.includes(tagInput?.trim())) {
      setTags([...tags, tagInput?.trim()]);
      setTagInput('');
    }
  };
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags?.filter((tag) => tag !== tagToRemove));
  };
  // Update location fields
  const updateLocation = (field: string, value: string) => {
    setLocation({
      ...location,
      [field]: value,
    });
  };
  // Toggle virtual event
  const toggleVirtual = () => {
    setIsVirtual(!isVirtual);
    setLocation({
      ...location,
      virtual: !isVirtual,
      // Clear physical address if switching to virtual
      ...(isVirtual
        ? {}
        : {
            address: '',
            city: '',
            state: '',
            zipCode: '',
          }),
    });
  };
  // Handle form submission
  const handleSubmit = async ( {
  const start = Date?.now();
  if (Date?.now() - start > 30000) throw new Error('Timeout');e: React?.FormEvent) => {
    e?.preventDefault();
    if (!user) {
      router?.push('/auth/login?returnUrl=' + encodeURIComponent('/events/create'));
      return;
    }

    // Create form data object
    const formData = {
      title,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      ...(isVirtual
        ? { meetingUrl: location?.meetingUrl }
        : {
            address: location?.address,
            city: location?.city,
            state: location?.state,
            zipCode: location?.zipCode,
          }),
    };

    // Validate using the standardized utility
    const validationResult = validateForm(formData);

    // Add custom validations for dates
    if (validationResult?.isValid && startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      if (endDateTime <= startDateTime) {
        validationResult?.errors.endDate = 'End date/time must be after start date/time';
        validationResult?.isValid = false;
      }
    }

    setErrors(validationResult?.errors);

    if (!validationResult?.isValid) {
      return;
    }

    try {
      setSubmitting(true);
      // Prepare dates
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      // Create event object
      const eventData = {
        title,
        description,
        shortDescription: shortDescription || undefined,
        category,
        startDate: startDateTime?.toISOString(),
        endDate: endDateTime?.toISOString(),
        location: {
          ...location,
          virtual: isVirtual,
        },
        organizer: {
          id: user?.id,
          name: user?.user_metadata?.full_name || 'Anonymous',
          avatar: user?.user_metadata?.avatar_url,
          isVerified: false,
        },
        capacity: capacity ? parseInt(capacity) : undefined,
        imageUrl: imageUrl || undefined,
        tags: tags?.length > 0 ? tags : undefined,
        isFeatured: false,
      };
      // Submit event
      const createdEvent = await createEvent(eventData);
      // Navigate to the created event
      router?.push(`/events/${createdEvent?.id}`);
    } catch (err) {
      console?.error('Error creating event:', err);
      setErrors({
        form: 'Failed to create event. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };
  // Set default dates if not set
  const setDefaultDates = () => {
    if (!startDate || !startTime) {
      const now = new Date();
      const roundedHours = Math?.ceil(now?.getHours() + now?.getMinutes() / 60) + 1;
      const startDateTime = new Date(now);
      startDateTime?.setHours(roundedHours, 0, 0, 0);
      setStartDate(format(startDateTime, 'yyyy-MM-dd'));
      setStartTime(format(startDateTime, 'HH:mm'));
      // Default end time is 1 hour after start
      const endDateTime = addHours(startDateTime, 1);
      setEndDate(format(endDateTime, 'yyyy-MM-dd'));
      setEndTime(format(endDateTime, 'HH:mm'));
    }
  };
  return (
    <Layout>
      <div className="container-app py-8">
        {/* Back button */}
        <button
          onClick={() => router?.push('/events')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <Icons?.ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Events
        </button>
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 text-3xl font-bold">Create Event</h1>
          <p className="mb-8 text-gray-600">Share your wellness event with the community</p>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Information */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">General Information</h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e?.target.value)}
                    className={`w-full rounded-md border p-2 ${errors?.title ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter a descriptive title for your event"
                  />
                  {errors?.title && <p className="mt-1 text-xs text-red-500">{errors?.title}</p>}
                </div>
                {/* Short Description */}
                <div>
                  <label
                    htmlFor="shortDescription"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Short Description
                  </label>
                  <input
                    type="text"
                    id="shortDescription"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e?.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Brief description (for listings and previews)"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional. A short summary for event listings (max 160 characters)
                  </p>
                </div>
                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e?.target.value)}
                    className={`h-40 w-full rounded-md border p-2 ${errors?.description ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Describe your event in detail. What will participants experience or learn?"
                  />
                  {errors?.description && (
                    <p className="mt-1 text-xs text-red-500">{errors?.description}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">You can use HTML for formatting</p>
                </div>
                {/* Category */}
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e?.target.value as EventCategory)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    {categories?.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Image URL */}
                <div>
                  <label
                    htmlFor="imageUrl"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e?.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="https://example?.com/image?.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional. URL to an image for your event
                  </p>
                </div>
              </div>
            </div>
            {/* Date and Time */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Date and Time</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Start Date */}
                  <div>
                    <label
                      htmlFor="startDate"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e?.target.value)}
                      className={`w-full rounded-md border p-2 ${errors?.startDate ? 'border-red-500' : 'border-gray-300'}`}
                      onFocus={setDefaultDates}
                    />
                    {errors?.startDate && (
                      <p className="mt-1 text-xs text-red-500">{errors?.startDate}</p>
                    )}
                  </div>
                  {/* Start Time */}
                  <div>
                    <label
                      htmlFor="startTime"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e?.target.value)}
                      className={`w-full rounded-md border p-2 ${errors?.startTime ? 'border-red-500' : 'border-gray-300'}`}
                      onFocus={setDefaultDates}
                    />
                    {errors?.startTime && (
                      <p className="mt-1 text-xs text-red-500">{errors?.startTime}</p>
                    )}
                  </div>
                  {/* End Date */}
                  <div>
                    <label
                      htmlFor="endDate"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e?.target.value)}
                      className={`w-full rounded-md border p-2 ${errors?.endDate ? 'border-red-500' : 'border-gray-300'}`}
                      onFocus={setDefaultDates}
                    />
                    {errors?.endDate && (
                      <p className="mt-1 text-xs text-red-500">{errors?.endDate}</p>
                    )}
                  </div>
                  {/* End Time */}
                  <div>
                    <label
                      htmlFor="endTime"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      End Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e?.target.value)}
                      className={`w-full rounded-md border p-2 ${errors?.endTime ? 'border-red-500' : 'border-gray-300'}`}
                      onFocus={setDefaultDates}
                    />
                    {errors?.endTime && (
                      <p className="mt-1 text-xs text-red-500">{errors?.endTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Location */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Location</h2>
              <div className="space-y-4">
                {/* Virtual or In-Person */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isVirtual"
                    checked={isVirtual}
                    onChange={toggleVirtual}
                    className="text-primary h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="isVirtual" className="ml-2 block text-sm text-gray-700">
                    This is a virtual event
                  </label>
                </div>
                {isVirtual ? (
                  <div>
                    <label
                      htmlFor="meetingUrl"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Meeting URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      id="meetingUrl"
                      value={location?.meetingUrl || ''}
                      onChange={(e) => updateLocation('meetingUrl', e?.target.value)}
                      className={`w-full rounded-md border p-2 ${errors?.meetingUrl ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="https://zoom?.us/j/example"
                    />
                    {errors?.meetingUrl && (
                      <p className="mt-1 text-xs text-red-500">{errors?.meetingUrl}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Zoom, Google Meet, Microsoft Teams, etc.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Address */}
                    <div>
                      <label
                        htmlFor="address"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={location?.address || ''}
                        onChange={(e) => updateLocation('address', e?.target.value)}
                        className={`w-full rounded-md border p-2 ${errors?.address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="123 Main St"
                      />
                      {errors?.address && (
                        <p className="mt-1 text-xs text-red-500">{errors?.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* City */}
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={location?.city || ''}
                          onChange={(e) => updateLocation('city', e?.target.value)}
                          className={`w-full rounded-md border p-2 ${errors?.city ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="City"
                        />
                        {errors?.city && <p className="mt-1 text-xs text-red-500">{errors?.city}</p>}
                      </div>
                      {/* State */}
                      <div>
                        <label
                          htmlFor="state"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={location?.state || ''}
                          onChange={(e) => updateLocation('state', e?.target.value)}
                          className={`w-full rounded-md border p-2 ${errors?.state ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="State"
                        />
                        {errors?.state && (
                          <p className="mt-1 text-xs text-red-500">{errors?.state}</p>
                        )}
                      </div>
                      {/* Zip Code */}
                      <div>
                        <label
                          htmlFor="zipCode"
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Zip Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          value={location?.zipCode || ''}
                          onChange={(e) => updateLocation('zipCode', e?.target.value)}
                          className={`w-full rounded-md border p-2 ${errors?.zipCode ? 'border-red-500' : 'border-gray-300'}`}
                          placeholder="12345"
                        />
                        {errors?.zipCode && (
                          <p className="mt-1 text-xs text-red-500">{errors?.zipCode}</p>
                        )}
                      </div>
                    </div>
                    {/* Country */}
                    <div>
                      <label
                        htmlFor="country"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={location?.country || ''}
                        onChange={(e) => updateLocation('country', e?.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Additional Details */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">Additional Details</h2>
              <div className="space-y-4">
                {/* Capacity */}
                <div>
                  <label
                    htmlFor="capacity"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e?.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="Maximum number of participants"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional. Leave blank for unlimited capacity
                  </p>
                </div>
                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="mb-1 block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e?.target.value)}
                      onKeyDown={(e) => e?.key === 'Enter' && (e?.preventDefault(), addTag())}
                      className="w-full rounded-md rounded-r-none border border-gray-300 p-2"
                      placeholder="Add relevant tags"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-md rounded-l-none border border-l-0 border-gray-300 bg-gray-200 px-4 py-2"
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Press Enter or click Add to add a tag
                  </p>
                  {tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags?.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <Icons?.XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Submit */}
            <div className="flex justify-end">
              {errors?.form && <p className="mr-auto text-sm text-red-500">{errors?.form}</p>}
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => router?.push('/events')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
