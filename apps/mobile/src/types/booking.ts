export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  appointmentDate: string; // ISO string
  duration: number; // in minutes
  specialRequests?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    providerId: string;
    name: string;
    price: number;
    duration: number;
    createdAt: string;
    updatedAt: string;
