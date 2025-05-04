'use client';;
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PlusIcon,
  AlertTriangleIcon,
  BellIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
import { AlertService, AlertThreshold } from '@/services/alert-service';
import { ProductService } from '@/services/product-service';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Define interface for the product
interface Product {
  id: string;
  name: string;
  // Add other product fields as needed
}

// Define the alert status interface
interface AlertStatus {
  label: string;
  color: 'info' | 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
}

function AlertsContent() {
  const [alerts, setAlerts] = useState<AlertThreshold[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertThreshold | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Form state
  const [formState, setFormState] = useState<
    Omit<AlertThreshold, 'id' | 'created_at' | 'updated_at'>
  >({
    name: '',
    description: '',
    is_active: true,
    product_id: '',
    metric: 'rating',
    condition: 'above',
    threshold: 3.5,
    notification_methods: ['email'],
  });

  useEffect(() => {
    fetchAlerts();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingAlert) {
      setFormState({
        name: editingAlert.name,
        description: editingAlert.description || '',
        is_active: editingAlert.is_active,
        product_id: editingAlert.product_id,
        metric: editingAlert.metric,
        condition: editingAlert.condition,
        threshold: editingAlert.threshold,
        notification_methods: editingAlert.notification_methods,
      });
    }
  }, [editingAlert]);

  const fetchAlerts = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    setIsLoading(true);
    try {
      const alertService = new AlertService();
      const alertsData = await alertService.getAllAlerts();
      setAlerts(alertsData);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const productService = new ProductService();
      const productsData = await productService.getProducts(1, 50);
      setProducts(productsData.products);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleCreateAlert = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const alertService = new AlertService();
      if (editingAlert && editingAlert.id) {
        await alertService.updateAlert(editingAlert.id, formState as AlertThreshold);
      } else {
        await alertService.createAlert(formState as AlertThreshold);
      }
      setShowDialog(false);
      setEditingAlert(null);
      resetForm();
      fetchAlerts();
    } catch (err) {
      setError('Failed to save alert');
      console.error(err);
    }
  };

  const handleDeleteAlert = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');alertId: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        const alertService = new AlertService();
        await alertService.deleteAlert(alertId);
        fetchAlerts();
      } catch (err) {
        setError('Failed to delete alert');
        console.error(err);
      }
    }
  };

  const handleToggleAlert = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');alert: AlertThreshold) => {
    try {
      const alertService = new AlertService();
      if (alert.id) {
        await alertService.updateAlert(alert.id, {
          ...alert,
          is_active: !alert.is_active,
        });
        fetchAlerts();
      }
    } catch (err) {
      setError('Failed to update alert');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormState({
      name: '',
      description: '',
      is_active: true,
      product_id: '',
      metric: 'rating',
      condition: 'above',
      threshold: 3.5,
      notification_methods: ['email'],
    });
  };

  const openNewAlertDialog = () => {
    resetForm();
    setEditingAlert(null);
    setShowDialog(true);
  };

  const openEditAlertDialog = (alert: AlertThreshold) => {
    setEditingAlert(alert);
    setShowDialog(true);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'active') return alert.is_active;
    if (activeTab === 'inactive') return !alert.is_active;
    if (activeTab === 'triggered') return alert.last_triggered;
    return true;
  });

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getAlertStatus = (alert: AlertThreshold): AlertStatus => {
    if (!alert.is_active) return { label: 'Inactive', color: 'secondary' };
    // @ts-expect-error - last_triggered might not be in the interface, but it's used in the code
    if (alert.last_triggered) return { label: 'Triggered', color: 'destructive' };
    return { label: 'Active', color: 'success' };
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Alerts</h1>
          <p className="text-muted-foreground">Manage threshold-based alerts for product metrics</p>
        </div>
        <Button onClick={openNewAlertDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Alert
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="triggered">Triggered</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="py-10 text-center">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-lg border py-10 text-center">
          <AlertTriangleIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
          <p className="mt-2 text-muted-foreground">
            Create your first alert to get notified when metrics change
          </p>
          <Button onClick={openNewAlertDialog} className="mt-4">
            Create Alert
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAlerts.map((alert) => {
            const status = getAlertStatus(alert);
            return (
              <Card key={alert.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <BellIcon className="mr-2 h-5 w-5" />
                        {alert.name}
                        <Badge variant={status.color} className="ml-3">
                          {status.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{alert.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleAlert(alert)}
                        title={alert.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {alert.is_active ? (
                          <XIcon className="h-4 w-4" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditAlertDialog(alert)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => alert.id && handleDeleteAlert(alert.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Product</div>
                      <div className="font-medium">{getProductName(alert.product_id)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Condition</div>
                      <div className="font-medium">
                        {alert.metric} {alert.condition} {alert.threshold}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Last Triggered</div>
                      {/* @ts-ignore - last_triggered might not be in the interface */}
                      <div className="font-medium">{formatDate(alert.last_triggered)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Notifications</div>
                      <div className="font-medium">{alert.notification_methods.join(', ')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alert Creation/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingAlert ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="name">Alert Name</FormLabel>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Critical Rating Drop"
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="product">Product</FormLabel>
                <Select
                  value={formState.product_id}
                  onValueChange={(value) => setFormState({ ...formState, product_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                id="description"
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                placeholder="Alert when product rating drops below threshold"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="metric">Metric</FormLabel>
                <Select
                  value={formState.metric}
                  onValueChange={(value) =>
                    setFormState({
                      ...formState,
                      metric: value as AlertThreshold['metric'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="purchases">Purchases</SelectItem>
                    <SelectItem value="try_ons">Try-ons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="condition">Condition</FormLabel>
                <Select
                  value={formState.condition}
                  onValueChange={(value) =>
                    setFormState({
                      ...formState,
                      condition: value as AlertThreshold['condition'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="threshold">Threshold</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="threshold"
                    type="number"
                    value={formState.threshold}
                    onChange={(e) =>
                      setFormState({ ...formState, threshold: parseFloat(e.target.value) })
                    }
                    step={0.1}
                    min={0}
                    max={5}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel>Notification Methods</FormLabel>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="email-notification"
                    checked={formState.notification_methods.includes('email')}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...formState.notification_methods, 'email']
                        : formState.notification_methods.filter((m) => m !== 'email');
                      setFormState({ ...formState, notification_methods: methods });
                    }}
                  />
                  <label htmlFor="email-notification">Email</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sms-notification"
                    checked={formState.notification_methods.includes('sms')}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...formState.notification_methods, 'sms']
                        : formState.notification_methods.filter((m) => m !== 'sms');
                      setFormState({ ...formState, notification_methods: methods });
                    }}
                  />
                  <label htmlFor="sms-notification">SMS</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="push-notification"
                    checked={formState.notification_methods.includes('push')}
                    onChange={(e) => {
                      const methods = e.target.checked
                        ? [...formState.notification_methods, 'push']
                        : formState.notification_methods.filter((m) => m !== 'push');
                      setFormState({ ...formState, notification_methods: methods });
                    }}
                  />
                  <label htmlFor="push-notification">Push</label>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formState.is_active}
                onCheckedChange={(checked) => setFormState({ ...formState, is_active: checked })}
              />
              <label htmlFor="active">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAlert}>
              {editingAlert ? 'Save Changes' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
      <AlertsContent />
    </Suspense>
  );
}
