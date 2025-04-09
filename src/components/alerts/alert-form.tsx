'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertService } from '@/services/alert-service';
import { ProductService } from '@/services/product-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AlertFormProps {
  alertId?: string;
  productId?: string;
  onSuccess?: () => void;
}

export default function AlertForm({ alertId, productId, onSuccess }: AlertFormProps) {
  const router = useRouter();
  const alertService = new AlertService();
  const productService = new ProductService();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [alert, setAlert] = useState({
    id: '',
    name: '',
    description: '',
    is_active: true,
    product_id: productId || '',
    metric: 'rating',
    condition: 'below',
    threshold: 3,
    notification_methods: ['email', 'dashboard']
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await productService.getAllProducts({ limit: 100 });
        setProducts(data.products.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      }
    };

    const fetchAlert = async () => {
      if (!alertId) return;
      
      setLoading(true);
      try {
        const alertData = await alertService.getAlertById(alertId);
        if (alertData) {
          setAlert(alertData);
        }
      } catch (error) {
        console.error('Error fetching alert:', error);
        toast({
          title: 'Error',
          description: 'Failed to load alert details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    if (alertId) {
      fetchAlert();
    }
  }, [alertId, productService, alertService]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlert(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setAlert(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setAlert(prev => ({ ...prev, is_active: checked }));
  };

  const handleNotificationMethodChange = (method: string, checked: boolean) => {
    setAlert(prev => {
      const methods = [...prev.notification_methods];
      
      if (checked && !methods.includes(method)) {
        methods.push(method);
      } else if (!checked && methods.includes(method)) {
        const index = methods.indexOf(method);
        methods.splice(index, 1);
      }
      
      return { ...prev, notification_methods: methods };
    });
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setAlert(prev => ({ ...prev, threshold: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alert.name || !alert.product_id || !alert.metric || !alert.condition || !alert.notification_methods.length) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      if (alertId) {
        await alertService.updateAlert(alertId, alert);
        toast({
          title: 'Success',
          description: 'Alert has been updated successfully.',
        });
      } else {
        await alertService.createAlert(alert);
        toast({
          title: 'Success',
          description: 'New alert has been created successfully.',
        });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/alerts');
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to save alert. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{alertId ? 'Edit Alert' : 'Create New Alert'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Alert Name*</Label>
              <Input
                id="name"
                name="name"
                value={alert.name}
                onChange={handleInputChange}
                placeholder="Low Rating Alert"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={alert.description || ''}
                onChange={handleInputChange}
                placeholder="Alert triggered when product rating falls below threshold"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="product_id">Product*</Label>
              <Select
                value={alert.product_id}
                onValueChange={(value) => handleSelectChange('product_id', value)}
                disabled={!!productId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="metric">Metric*</Label>
                <Select
                  value={alert.metric}
                  onValueChange={(value) => handleSelectChange('metric', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="purchases">Purchases</SelectItem>
                    <SelectItem value="try_ons">Try-ons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="condition">Condition*</Label>
                <Select
                  value={alert.condition}
                  onValueChange={(value) => handleSelectChange('condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="above">Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="threshold">Threshold*</Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  value={alert.threshold}
                  onChange={handleThresholdChange}
                  min={0}
                  step={alert.metric === 'rating' ? 0.1 : 1}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={alert.is_active}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Notification Methods*</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={alert.notification_methods.includes('email')}
                    onCheckedChange={(checked) => 
                      handleNotificationMethodChange('email', checked as boolean)
                    }
                  />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dashboard"
                    checked={alert.notification_methods.includes('dashboard')}
                    onCheckedChange={(checked) => 
                      handleNotificationMethodChange('dashboard', checked as boolean)
                    }
                  />
                  <Label htmlFor="dashboard">Dashboard</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms"
                    checked={alert.notification_methods.includes('sms')}
                    onCheckedChange={(checked) => 
                      handleNotificationMethodChange('sms', checked as boolean)
                    }
                  />
                  <Label htmlFor="sms">SMS</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : alertId ? 'Update Alert' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 