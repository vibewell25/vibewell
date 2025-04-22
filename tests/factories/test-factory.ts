import { mockServices, mockUsers, mockBookings } from '../fixtures/api-fixtures';
import { generateTestId } from '../utils/test-utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'provider';
  preferences: {
    notifications: boolean;
    language: string;
  };
}

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string;
  category: string;
  available: boolean;
}

interface Booking {
  id: string;
  serviceId: number;
  userId: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

class TestFactory {
  private static userCounter = 1;
  private static serviceCounter = 1;
  private static bookingCounter = 1;

  static createUser(overrides: Partial<User> = {}): User {
    const defaultUser = mockUsers[0];
    const userId = `user_${this.userCounter++}`;
    
    return {
      id: userId,
      email: `test${this.userCounter}@example.com`,
      name: `Test User ${this.userCounter}`,
      role: 'client',
      preferences: {
        notifications: true,
        language: 'en'
      },
      ...defaultUser,
      ...overrides
    };
  }

  static createService(overrides: Partial<Service> = {}): Service {
    const defaultService = mockServices[0];
    const serviceId = this.serviceCounter++;
    
    return {
      id: serviceId,
      name: `Service ${serviceId}`,
      duration: 30,
      price: 50.00,
      description: `Test service description ${serviceId}`,
      category: 'general',
      available: true,
      ...defaultService,
      ...overrides
    };
  }

  static createBooking(overrides: Partial<Booking> = {}): Booking {
    const defaultBooking = mockBookings[0];
    const bookingId = `booking_${this.bookingCounter++}`;
    
    return {
      id: bookingId,
      serviceId: 1,
      userId: 'user_1',
      date: new Date().toISOString(),
      status: 'pending',
      notes: `Test booking ${this.bookingCounter}`,
      ...defaultBooking,
      ...overrides
    };
  }

  static createManyUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static createManyServices(count: number, overrides: Partial<Service> = {}): Service[] {
    return Array.from({ length: count }, () => this.createService(overrides));
  }

  static createManyBookings(count: number, overrides: Partial<Booking> = {}): Booking[] {
    return Array.from({ length: count }, () => this.createBooking(overrides));
  }

  static createProviderWithServices(serviceCount = 3): { provider: User; services: Service[] } {
    const provider = this.createUser({ role: 'provider' });
    const services = this.createManyServices(serviceCount, { 
      available: true 
    });
    
    return { provider, services };
  }

  static createClientWithBookings(bookingCount = 2): { client: User; bookings: Booking[] } {
    const client = this.createUser({ role: 'client' });
    const bookings = this.createManyBookings(bookingCount, { 
      userId: client.id 
    });
    
    return { client, bookings };
  }

  static reset(): void {
    this.userCounter = 1;
    this.serviceCounter = 1;
    this.bookingCounter = 1;
  }
}

export { TestFactory, type User, type Service, type Booking }; 