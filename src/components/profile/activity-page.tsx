import { ActivityAlerts } from './activity-alerts';
import { ActivityExport } from './activity-export';
import { ActivityFilter } from './activity-filter';
import { ActivityHistory } from './activity-history';
import { ActivityInsights } from './activity-insights';
import { ActivityPatterns } from './activity-patterns';
import { ActivityStats } from './activity-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="space-y-6">
      <ActivityFilter
        onSearch={setSearchQuery}
        onFilterChange={setFilter}
        onDateRangeChange={setDateRange}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityStats />
        <ActivityPatterns />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActivityHistory />
        <ActivityInsights />
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <ActivityAlerts />
        </TabsContent>

        <TabsContent value="export">
          <ActivityExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
