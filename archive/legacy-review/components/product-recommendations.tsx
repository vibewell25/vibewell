import { useState, useEffect } from 'react';
import { Card, Button, Select, Badge } from '@/components/ui';
import { getProductRecommendations, getSkinConditionLogs } from '@/lib/api/beauty';
import { SkinConcern } from '@/lib/api/beauty';

const skinTypes = ['oily', 'dry', 'combination', 'normal', 'sensitive'] as const;

const skinConcerns: SkinConcern[] = [
  'acne',
  'dryness',
  'oiliness',
  'redness',
  'sensitivity',
  'dark_spots',
  'fine_lines',
  'other',
];

export default function ProductRecommendations() {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    skinType: 'normal' as (typeof skinTypes)[number],
    concerns: [] as SkinConcern[],
    priceRange: 'all' as 'budget' | 'mid' | 'luxury' | 'all',
  });

  useEffect(() => {
    loadRecommendations();
    loadUserPreferences();
  }, [filters]);

  const loadRecommendations = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setLoading(true);
      const products = await getProductRecommendations(filters);
      setRecommendations(products);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const logs = await getSkinConditionLogs();
      if (logs.length > 0) {
        // Get the most recent log's concerns
        const recentConcerns = logs[logs.length - 1].concerns;
        setFilters((prev) => ({
          ...prev,
          concerns: recentConcerns,
        }));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const handleConcernToggle = (concern: SkinConcern) => {
    setFilters((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case 'budget':
        return '$ Budget-Friendly';
      case 'mid':
        return '$$ Mid-Range';
      case 'luxury':
        return '$$$ Luxury';
      default:
        return 'All Prices';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Recommendations</h2>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            label="Skin Type"
            value={filters.skinType}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                skinType: e.target.value as (typeof skinTypes)[number],
              }))
            }
            options={skinTypes.map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
            }))}
          />

          <Select
            label="Price Range"
            value={filters.priceRange}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: e.target.value as typeof filters.priceRange,
              }))
            }
            options={[
              { value: 'all', label: 'All Prices' },
              { value: 'budget', label: '$ Budget-Friendly' },
              { value: 'mid', label: '$$ Mid-Range' },
              { value: 'luxury', label: '$$$ Luxury' },
            ]}
          />
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">Skin Concerns</label>
          <div className="flex flex-wrap gap-2">
            {skinConcerns.map((concern) => (
              <Button
                key={concern}
                variant={filters.concerns.includes(concern) ? 'default' : 'outline'}
                onClick={() => handleConcernToggle(concern)}
              >
                {concern.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="py-8 text-center">
          <p>Loading recommendations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((product) => (
            <Card key={product.id} className="p-6">
              {product.image && (
                <div className="mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-48 w-full rounded object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                  <Badge>{getPriceRangeLabel(product.priceRange)}</Badge>
                </div>

                <p className="text-sm">{product.description}</p>

                {product.keyIngredients && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Key Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.keyIngredients.map((ingredient, index) => (
                        <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.suitableFor && (
                  <div>
                    <h4 className="mb-1 text-sm font-medium">Best For</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.suitableFor.map((concern, index) => (
                        <span key={index} className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                          {concern.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.purchaseLink && (
                  <a
                    href={product.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block"
                  >
                    <Button className="w-full">View Product</Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
