export interface ServiceProvider {
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  location: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  level: string;
  image: string;
  provider: ServiceProvider;
  tags: string[];
  popularity: number;
  availableSlots: number;
} 