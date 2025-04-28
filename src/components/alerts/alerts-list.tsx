'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/services/analytics-alert-service';
import { AnalyticsAlertService } from '@/services/analytics-alert-service';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  MoreVertical,
  AlertTriangle,
  Bell,
  BellOff,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FilterStatus = 'all' | 'active' | 'inactive';
type SortField = 'name' | 'lastTriggered' | 'metricType';
type SortOrder = 'asc' | 'desc';

interface AlertsListProps {
  userId: string;
  onCreateAlert: () => void;
  onEditAlert: (alertId: string) => void;
}

export default function AlertsList({ userId, onCreateAlert, onEditAlert }: AlertsListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const alertService = new AnalyticsAlertService();

  // Fetch all alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await alertService.getAlertsByUser(userId);

      if (error) throw error;

      setAlerts(data || []);
      setFilteredAlerts(data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Filter and sort alerts
  useEffect(() => {
    let result = [...alerts];

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter((alert) =>
        filterStatus === 'active' ? alert.isActive : !alert.isActive,
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (alert) =>
          alert.name.toLowerCase().includes(query) ||
          (alert.description && alert.description.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'lastTriggered':
          valueA = a.lastTriggered ? new Date(a.lastTriggered).getTime() : 0;
          valueB = b.lastTriggered ? new Date(b.lastTriggered).getTime() : 0;
          break;
        case 'metricType':
          valueA = a.threshold.metricType;
          valueB = b.threshold.metricType;
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAlerts(result);
  }, [alerts, filterStatus, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    try {
      const updatedAlert = {
        ...alert,
        isActive: !alert.isActive,
      };

      const { error } = await alertService.updateAlert(alert.id as string, updatedAlert);

      if (error) throw error;

      // Update local state
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? updatedAlert : a)));
    } catch (err) {
      console.error('Error toggling alert status:', err);
      // Show error notification
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const { error } = await alertService.deleteAlert(alertId);

      if (error) throw error;

      // Update local state
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Error deleting alert:', err);
      // Show error notification
    }
  };

  // Format metric type for display
  const formatMetricType = (type: string) => {
    const formats: Record<string, string> = {
      views: 'Views',
      uniqueVisitors: 'Unique Visitors',
      tryOns: 'Try-Ons',
      conversion: 'Conversion Rate',
      rating: 'Rating',
    };

    return formats[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Analytics Alerts</CardTitle>
            <CardDescription>Manage alerts for your product metrics</CardDescription>
          </div>
          <Button onClick={onCreateAlert}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'inactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
            >
              Inactive
            </Button>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery || filterStatus !== 'all' ? (
              <p>No alerts match your filters.</p>
            ) : (
              <div className="space-y-3">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <p>No alerts have been created yet.</p>
                <Button variant="outline" size="sm" onClick={onCreateAlert}>
                  Create your first alert
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Alert Name
                    {sortField === 'name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('metricType')}>
                    Metric
                    {sortField === 'metricType' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('lastTriggered')}>
                    Last Triggered
                    {sortField === 'lastTriggered' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.name}</TableCell>
                    <TableCell>{formatMetricType(alert.threshold.metricType)}</TableCell>
                    <TableCell>
                      {alert.threshold.condition === 'above' ? '>' : '<'} {alert.threshold.value}
                      {alert.threshold.metricType === 'conversion' ? '%' : ''}
                      {alert.threshold.metricType === 'rating' ? ' stars' : ''}
                      <div className="mt-1 text-xs text-muted-foreground">
                        in {alert.threshold.timeframeHours}h window
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.lastTriggered ? (
                        formatDistanceToNow(new Date(alert.lastTriggered), { addSuffix: true })
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.isActive ? 'default' : 'outline'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditAlert(alert.id as string)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(alert)}>
                            {alert.isActive ? (
                              <>
                                <BellOff className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Bell className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteAlert(alert.id as string)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'} found
        </div>
      </CardFooter>
    </Card>
  );
}
