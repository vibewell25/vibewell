import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { getTrendingTopics, getTrendingProducts } from '@/lib/api/beauty';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function BeautyTrends() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadTrends();
  }, [timeframe]);

  const loadTrends = async () => {
    try {
      const [topics, products] = await Promise.all([
        getTrendingTopics(timeframe),
        getTrendingProducts(timeframe),
      ]);
      setTrendingTopics(topics);
      setTrendingProducts(products);
    } catch (error) {
      console.error('Error loading trends:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beauty Trends</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((t) => (
            <Button
              key={t}
              variant={timeframe === t ? 'default' : 'outline'}
              onClick={() => setTimeframe(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Trending Topics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendingTopics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mentions" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <Badge key={topic.id} className="text-sm">
                #{topic.name} ({topic.mentions})
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Trending Products</h3>
          <div className="space-y-4">
            {trendingProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ★</span>
                    <span className="text-sm text-gray-500">{product.reviews} reviews</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${product.price}</div>
                  <div className="text-sm text-green-600">{product.trendPercentage}% ↑</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="mb-4 text-xl font-semibold">Trend Insights</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">Most Discussed</h4>
              <ul className="space-y-2">
                {trendingTopics.slice(0, 5).map((topic) => (
                  <li key={topic.id} className="text-sm">
                    {topic.name} - {topic.mentions} mentions
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">Rising Categories</h4>
              <ul className="space-y-2">
                {['Skincare', 'Haircare', 'Makeup', 'Wellness'].map((category) => (
                  <li key={category} className="text-sm">
                    {category}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">Seasonal Trends</h4>
              <ul className="space-y-2">
                {['Sun Protection', 'Hydration', 'Anti-aging', 'Natural'].map((trend) => (
                  <li key={trend} className="text-sm">
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
