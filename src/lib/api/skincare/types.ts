export type WeatherCondition = {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  temperature: number;
  humidity: number;
  uvIndex: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  ingredients: string[];
  price: number;
  rating: number;
  description: string;
  imageUrl: string;
  purchaseUrl: string;
};

export type RoutineAdjustment = {
  type: 'add' | 'remove' | 'replace' | 'modify';
  step: string;
  product?: Product;
  reason: string;
  timeOfDay: 'morning' | 'evening' | 'both';
};

export type RecommendationProgress = {
  id: string;
  recommendationId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startDate: Date;
  completionDate?: Date;
  notes?: string;
  effectiveness?: number; // 1-5 rating
}; 