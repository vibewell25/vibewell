export const mockProviderData = {
  providers: [
    {
      id: '1',
      name: 'Dr. Jane Smith',
      specialization: 'Physical Therapy',
      rating: 4.8,
      reviews: 124,
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        hours: ['09:00', '17:00'],
      },
      image: '/images/providers/jane-smith.jpg',
    },
    {
      id: '2',
      name: 'Dr. John Doe',
      specialization: 'Massage Therapy',
      rating: 4.9,
      reviews: 98,
      availability: {
        days: ['Tuesday', 'Thursday', 'Saturday'],
        hours: ['10:00', '18:00'],
      },
      image: '/images/providers/john-doe.jpg',
    },
  ],
  services: [
    {
      id: '1',
      name: 'Deep Tissue Massage',
      duration: 60,
      price: 89.99,
      description: 'A therapeutic massage that focuses on realigning deeper layers of muscles.',
      category: 'Massage',
      image: '/images/services/deep-tissue.jpg',
    },
    {
      id: '2',
      name: 'Physical Therapy Session',
      duration: 45,
      price: 120.0,
      description: 'Personalized physical therapy session for injury recovery and prevention.',
      category: 'Therapy',
      image: '/images/services/physical-therapy.jpg',
    },
  ],
};

export const mockBookingData = {
  id: 'booking-123',
  status: 'confirmed',
  service: {
    id: '1',
    name: 'Deep Tissue Massage',
    duration: 60,
    price: 89.99,
  },
  provider: {
    id: '1',
    name: 'Dr. Jane Smith',
  },
  date: '2023-12-25',
  time: '10:00',
  customer: {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
  },
  specialRequests: 'Test request',
  paymentStatus: 'pending',
  createdAt: '2023-12-20T10:00:00Z',
  updatedAt: '2023-12-20T10:00:00Z',
};
