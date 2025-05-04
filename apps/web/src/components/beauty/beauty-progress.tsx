import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { getSkinConditionLogs } from '@/lib/api/beauty';
import { SkinConcern } from '@/lib/api/beauty';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function BeautyProgress() {
  const [logs, setLogs] = useState<SkinConditionLog[]>([]);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const userLogs = await getSkinConditionLogs();
      setLogs(userLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const getFilteredLogs = () => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return logs.filter((log) => new Date(log.date) >= cutoffDate);
  };

  const getConcernFrequency = () => {
    const concerns: Record<SkinConcern, number> = {
      acne: 0,
      dryness: 0,
      oiliness: 0,
      redness: 0,
      sensitivity: 0,
      dark_spots: 0,
      fine_lines: 0,
      other: 0,
    };

    getFilteredLogs().forEach((log) => {
      log.concerns.forEach((concern) => {
        concerns[concern]++;
      });
    });

    return Object.entries(concerns).map(([name, count]) => ({
      name: name.replace('_', ' '),
      count,
    }));
  };

  const filteredLogs = getFilteredLogs();
  const concernFrequency = getConcernFrequency();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Beauty Progress</h2>
        <div className="flex gap-2">
          <button
            className={`rounded px-4 py-2 ${
              timeframe === 'week' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button
            className={`rounded px-4 py-2 ${
              timeframe === 'month' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
          <button
            className={`rounded px-4 py-2 ${
              timeframe === 'year' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
            onClick={() => setTimeframe('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Wellness Metrics Over Time</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredLogs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Legend />
                <Line type="monotone" dataKey="mood" stroke="#8884d8" name="Mood" />
                <Line type="monotone" dataKey="stress" stroke="#82ca9d" name="Stress" />
                <Line type="monotone" dataKey="sleep" stroke="#ffc658" name="Sleep" />
                <Line type="monotone" dataKey="hydration" stroke="#ff7300" name="Hydration" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-xl font-semibold">Skin Concerns Frequency</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={concernFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-xl font-semibold">Summary</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Average Mood</p>
              <p className="text-2xl font-semibold">
                {(
                  filteredLogs.reduce((sum, log) => sum + log.mood, 0) / filteredLogs.length
                ).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Stress</p>
              <p className="text-2xl font-semibold">
                {(
                  filteredLogs.reduce((sum, log) => sum + log.stress, 0) / filteredLogs.length
                ).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Sleep</p>
              <p className="text-2xl font-semibold">
                {(
                  filteredLogs.reduce((sum, log) => sum + log.sleep, 0) / filteredLogs.length
                ).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Hydration</p>
              <p className="text-2xl font-semibold">
                {(
                  filteredLogs.reduce((sum, log) => sum + log.hydration, 0) / filteredLogs.length
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
