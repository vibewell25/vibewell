'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  AlertTriangleIcon, 
  BellIcon, 
  TrashIcon, 
  EditIcon,
  CheckIcon,
  XIcon 
} from 'lucide-react';
import { AlertService } from '@/services/alert-service';
import { ProductService } from '@/services/product-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    is_active: true,
    product_id: '',
    metric: 'rating',
    condition: 'below',
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
        description: editingAlert.description,
        is_active: editingAlert.is_active,
        product_id: editingAlert.product_id,
        metric: editingAlert.metric,
        condition: editingAlert.condition,
        threshold: editingAlert.threshold,
        notification_methods: editingAlert.notification_methods,
      });
    }
  }, [editingAlert]);

  const fetchAlerts = async () => {
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

  const fetchProducts = async () => {
    try {
      const productService = new ProductService();
      const productsData = await productService.getProducts({});
      setProducts(productsData.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleCreateAlert = async () => {
    try {
      const alertService = new AlertService();
      if (editingAlert) {
        await alertService.updateAlert(editingAlert.id, formState);
      } else {
        await alertService.createAlert(formState);
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

  const handleDeleteAlert = async (alertId) => {
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

  const handleToggleAlert = async (alert) => {
    try {
      const alertService = new AlertService();
      await alertService.updateAlert(alert.id, {
        ...alert,
        is_active: !alert.is_active
      });
      fetchAlerts();
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
      condition: 'below',
      threshold: 3.5,
      notification_methods: ['email'],
    });
  };

  const openNewAlertDialog = () => {
    resetForm();
    setEditingAlert(null);
    setShowDialog(true);
  };

  const openEditAlertDialog = (alert) => {
    setEditingAlert(alert);
    setShowDialog(true);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'active') return alert.is_active;
    if (activeTab === 'inactive') return !alert.is_active;
    if (activeTab === 'triggered') return alert.last_triggered;
    return true;
  });

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getAlertStatus = (alert) => {
    if (!alert.is_active) return { label: 'Inactive', color: 'secondary' };
    if (alert.last_triggered) return { label: 'Triggered', color: 'destructive' };
    return { label: 'Active', color: 'success' };
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Alerts</h1>
          <p className="text-muted-foreground">
            Manage threshold-based alerts for product metrics
          </p>
        </div>
        <Button onClick={openNewAlertDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Alert
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
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
        <div className="text-center py-10">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
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
                  <div className="flex justify-between items-start">
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
                        title={alert.is_active ? "Deactivate" : "Activate"}
                      >
                        {alert.is_active ? <XIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
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
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Product</div>
                      <div className="font-medium">{getProductName(alert.product_id)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Condition</div>
                      <div className="font-medium">
                        {alert.metric} {alert.condition} {alert.threshold}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Triggered</div>
                      <div className="font-medium">{formatDate(alert.last_triggered)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Notifications</div>
                      <div className="font-medium">
                        {alert.notification_methods.join(', ')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Alert Name</label>
              <Input 
                id="name"
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                placeholder="Low Rating Alert"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Input 
                id="description"
                value={formState.description}
                onChange={(e) => setFormState({...formState, description: e.target.value})}
                placeholder="Alert when product rating falls below threshold"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="product" className="text-sm font-medium">Product</label>
              <Select 
                value={formState.product_id} 
                onValueChange={(value) => setFormState({...formState, product_id: value})}
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
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="metric" className="text-sm font-medium">Metric</label>
                <Select 
                  value={formState.metric} 
                  onValueChange={(value) => setFormState({...formState, metric: value})}
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
                <label htmlFor="condition" className="text-sm font-medium">Condition</label>
                <Select 
                  value={formState.condition} 
                  onValueChange={(value) => setFormState({...formState, condition: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="above">Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="threshold" className="text-sm font-medium">Threshold</label>
                <Input 
                  id="threshold"
                  type="number"
                  value={formState.threshold}
                  onChange={(e) => setFormState({...formState, threshold: parseFloat(e.target.value)})}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Methods</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.notification_methods.includes('email')}
                    onChange={(e) => {
                      const methods = e.target.checked 
                        ? [...formState.notification_methods, 'email']
                        : formState.notification_methods.filter(m => m !== 'email');
                      setFormState({...formState, notification_methods: methods});
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formState.notification_methods.includes('dashboard')}
                    onChange={(e) => {
                      const methods = e.target.checked 
                        ? [...formState.notification_methods, 'dashboard']
                        : formState.notification_methods.filter(m => m !== 'dashboard');
                      setFormState({...formState, notification_methods: methods});
                    }}
                    className="rounded border-gray-300"
                  />
                  <span>Dashboard</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formState.is_active}
                onCheckedChange={(checked) => setFormState({...formState, is_active: checked})}
              />
              <label htmlFor="active" className="text-sm font-medium">
                Alert Active
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAlert} disabled={!formState.name || !formState.product_id}>
              {editingAlert ? 'Update Alert' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 