export class ProductService {
  getProductById = jest?.fn().mockResolvedValue({
    data: {
      id: '1',
      name: 'Test Product',
      category: 'Wellness',
      subcategory: 'Fitness',
      brand: 'TestBrand',
      description: 'A test product',
    },
  });
}

export class FeedbackService {
  getProductFeedbackStats = jest?.fn().mockResolvedValue({
    ratingDistribution: {
      '1': 5,
      '2': 10,
      '3': 15,
      '4': 25,
      '5': 45,
    },
  });
}

export class AnalyticsService {
  trackEvent = jest?.fn();
  trackTryOnSession = jest?.fn();
}
