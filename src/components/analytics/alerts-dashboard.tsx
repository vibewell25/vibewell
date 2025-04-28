import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AlertService } from '@/services/alert-service';
import { ProductService } from '@/services/product-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';

// Alert form schema
const alertFormSchema = z.object({
  name: z.string().min(3, { message: 'Alert name must be at least 3 characters' }),
  description: z.string().optional(),
  product_id: z.string().uuid({ message: 'Valid product ID is required' }),
  metric: z.enum(['rating', 'views', 'purchases', 'try_ons'], {
    required_error: 'Please select a metric',
  }),
  condition: z.enum(['below', 'above'], {
    required_error: 'Please select a condition',
  }),
  threshold: z.coerce.number().min(0, { message: 'Threshold must be a positive number' }),
  notification_methods: z
    .array(z.string())
    .min(1, { message: 'Select at least one notification method' }),
  is_active: z.boolean().default(true),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

export function AlertsDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<any | null>(null);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const alertService = new AlertService();
  const productService = new ProductService();

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      name: '',
      description: '',
      product_id: '',
      metric: 'rating',
      condition: 'below',
      threshold: 0,
      notification_methods: ['email'],
      is_active: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsData, productsData] = await Promise.all([
          alertService.getAllAlerts(),
          productService.getProducts({ limit: 100 }),
        ]);

        setAlerts(alertsData || []);
        setProducts(productsData?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error fetching data',
          description: 'Could not load alerts and products',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return alert.is_active;
    if (activeTab === 'triggered') return alert.last_triggered !== null;
    return true;
  });

  const handleSubmit = async (values: AlertFormValues) => {
    try {
      if (editingAlert) {
        await alertService.updateAlert(editingAlert.id, values);
        toast({
          title: 'Alert updated',
          description: 'The alert has been updated successfully',
          variant: 'default',
        });
      } else {
        await alertService.createAlert(values);
        toast({
          title: 'Alert created',
          description: 'The new alert has been created successfully',
          variant: 'default',
        });
      }

      // Refresh alerts list
      const updatedAlerts = await alertService.getAllAlerts();
      setAlerts(updatedAlerts || []);

      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting alert:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the alert',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlert = async () => {
    if (!deletingAlertId) return;

    try {
      await alertService.deleteAlert(deletingAlertId);
      setAlerts(alerts.filter((alert) => alert.id !== deletingAlertId));
      setDeletingAlertId(null);
      toast({
        title: 'Alert deleted',
        description: 'The alert has been deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the alert',
        variant: 'destructive',
      });
    }
  };

  const handleEditAlert = (alert: any) => {
    setEditingAlert(alert);
    form.reset({
      name: alert.name,
      description: alert.description || '',
      product_id: alert.product_id,
      metric: alert.metric,
      condition: alert.condition,
      threshold: Number(alert.threshold),
      notification_methods: alert.notification_methods,
      is_active: alert.is_active,
    });
    setOpenDialog(true);
  };

  const handleToggleAlertStatus = async (alertId: string, isActive: boolean) => {
    try {
      await alertService.updateAlert(alertId, { is_active: !isActive });
      setAlerts(
        alerts.map((alert) => (alert.id === alertId ? { ...alert, is_active: !isActive } : alert)),
      );
      toast({
        title: 'Alert status updated',
        description: `Alert is now ${!isActive ? 'active' : 'inactive'}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling alert status:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the alert status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      product_id: '',
      metric: 'rating',
      condition: 'below',
      threshold: 0,
      notification_methods: ['email'],
      is_active: true,
    });
    setEditingAlert(null);
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      rating: 'Rating',
      views: 'Views',
      purchases: 'Purchases',
      try_ons: 'Try-Ons',
    };
    return labels[metric] || metric;
  };

  const handleAddNewAlert = () => {
    resetForm();
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Alerts</h2>
          <p className="text-muted-foreground">
            Manage product performance alerts and notifications
          </p>
        </div>
        <Button onClick={handleAddNewAlert}>
          <Plus className="mr-2 h-4 w-4" />
          New Alert
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="triggered">Recently Triggered</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>
                {activeTab === 'all' && 'View and manage all configured alerts'}
                {activeTab === 'active' && 'Currently active alerts that are being monitored'}
                {activeTab === 'triggered' && 'Alerts that have been triggered recently'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="space-y-2">
                        <div className="h-4 w-[250px] rounded-full bg-gray-200"></div>
                        <div className="h-4 w-[200px] rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No alerts found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {activeTab === 'all'
                      ? 'No alerts have been created yet.'
                      : activeTab === 'active'
                        ? 'There are no active alerts.'
                        : 'No alerts have been triggered recently.'}
                  </p>
                  {activeTab === 'all' && (
                    <Button onClick={handleAddNewAlert} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first alert
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Switch
                            checked={alert.is_active}
                            onCheckedChange={() =>
                              handleToggleAlertStatus(alert.id, alert.is_active)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {alert.name}
                          {alert.last_triggered && (
                            <Badge variant="destructive" className="ml-2">
                              Triggered
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getProductName(alert.product_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getMetricLabel(alert.metric)}</Badge>
                        </TableCell>
                        <TableCell>
                          {alert.condition} {alert.threshold}
                        </TableCell>
                        <TableCell>
                          {alert.last_triggered ? (
                            new Date(alert.last_triggered).toLocaleString()
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditAlert(alert)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingAlertId(alert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Alert Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAlert ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
            <DialogDescription>
              {editingAlert
                ? 'Update the alert settings below.'
                : 'Set up a new alert to monitor product performance.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Low rating alert" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Alert details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metric"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metric</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a metric" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="views">Views</SelectItem>
                          <SelectItem value="purchases">Purchases</SelectItem>
                          <SelectItem value="try_ons">Try-Ons</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="below">Below</SelectItem>
                          <SelectItem value="above">Above</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>
                      {form.watch('metric') === 'rating'
                        ? 'For ratings, set a value between 1-5'
                        : 'Set the threshold value that will trigger the alert'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notification_methods"
                render={() => (
                  <FormItem>
                    <FormLabel>Notification Methods</FormLabel>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="notification_methods"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes('email')}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, 'email']);
                                  } else {
                                    field.onChange(current.filter((v) => v !== 'email'));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Email</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notification_methods"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes('dashboard')}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, 'dashboard']);
                                  } else {
                                    field.onChange(current.filter((v) => v !== 'dashboard'));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Dashboard</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Alert</FormLabel>
                      <FormDescription>
                        Alert will be monitored and can trigger notifications
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenDialog(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingAlert ? 'Update Alert' : 'Create Alert'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingAlertId} onOpenChange={(open) => !open && setDeletingAlertId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingAlertId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlert}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
