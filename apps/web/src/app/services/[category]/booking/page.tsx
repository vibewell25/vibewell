import React from 'react';
import BookingFlow from '@/components/services/BookingFlow';

interface BookingPageProps {
  params: { category: string };
}

export default function BookingCategoryPage({ params: { category } }: BookingPageProps) {
  // You can use `category` to customize the flow if needed
  return <BookingFlow />;
} 