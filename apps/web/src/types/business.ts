export interface Business {
  id: string;
  name: string;
  description: string;
  category: 'spa' | 'salon' | 'wellness' | 'fitness';
  location: string;
  rating: number;
  imageUrl: string;
  services: string[];
  openingHours: {
    day: string;
    hours: string;
[];
  contact: {
    phone: string;
    email: string;
    website?: string;
