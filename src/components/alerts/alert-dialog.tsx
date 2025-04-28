import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  CreateAlertParams,
  AnalyticsAlertService,
} from '@/services/analytics-alert-service';
import { ProductService } from '@/services/product-service';
import { useAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (alert: Alert) => void;
  alertToEdit?: Alert;
}

interface Product {
  id: string;
  name: string;
}

interface FormValues {
  name: string;
  description: string;
  isActive: boolean;
  productId: string;
  metricType: string;
  condition: 'above' | 'below';
  value: number;
  timeframeHours: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
}

export function AlertDialog({ isOpen, onClose, onSuccess, alertToEdit }: AlertDialogProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [metricLabel, setMetricLabel] = useState('Value');

  const metricOptions = [
    { value: 'views', label: 'Product Views' },
    { value: 'uniqueVisitors', label: 'Unique Visitors' },
    { value: 'tryOns', label: 'Try-Ons' },
    { value: 'conversion', label: 'Conversion Rate (%)' },
    { value: 'rating', label: 'Rating (1-5)' },
  ];

  const timeframeOptions = [
    { value: 1, label: '1 Hour' },
    { value: 6, label: '6 Hours' },
    { value: 12, label: '12 Hours' },
    { value: 24, label: '24 Hours' },
    { value: 72, label: '3 Days' },
    { value: 168, label: '7 Days' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      productId: '',
      metricType: 'views',
      condition: 'above',
      value: 100,
      timeframeHours: 24,
      emailEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
    },
  });

  const currentMetricType = watch('metricType');
  const currentValue = watch('value');

  useEffect(() => {
    // Load products
    async function loadProducts() {
      try {
        const productService = new ProductService();
        const response = await productService.getProducts({ limit: 100 });

        if (response.products && response.products.length > 0) {
          setProducts(
            response.products.map((p) => ({
              id: p.id,
              name: p.name,
            })),
          );
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products',
          variant: 'destructive',
        });
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    // Update metric label based on selected metric type
    const selectedMetric = metricOptions.find((m) => m.value === currentMetricType);
    setMetricLabel(selectedMetric?.label || 'Value');

    // Set appropriate default values based on metric type
    if (currentMetricType === 'conversion') {
      setValue('value', 5);
    } else if (currentMetricType === 'rating') {
      setValue('value', 4);
    } else if (currentMetricType === 'views' || currentMetricType === 'uniqueVisitors') {
      setValue('value', 100);
    } else if (currentMetricType === 'tryOns') {
      setValue('value', 10);
    }
  }, [currentMetricType, setValue]);

  useEffect(() => {
    // Populate form when editing an alert
    if (alertToEdit) {
      reset({
        name: alertToEdit.name,
        description: alertToEdit.description || '',
        isActive: alertToEdit.isActive,
        productId: alertToEdit.productId || '',
        metricType: alertToEdit.threshold.metricType,
        condition: alertToEdit.threshold.condition,
        value: alertToEdit.threshold.value,
        timeframeHours: alertToEdit.threshold.timeframeHours,
        emailEnabled:
          alertToEdit.notificationMethods.find((m) => m.type === 'email')?.enabled || false,
        smsEnabled: alertToEdit.notificationMethods.find((m) => m.type === 'sms')?.enabled || false,
        inAppEnabled:
          alertToEdit.notificationMethods.find((m) => m.type === 'inApp')?.enabled || false,
      });
    } else {
      reset({
        name: '',
        description: '',
        isActive: true,
        productId: '',
        metricType: 'views',
        condition: 'above',
        value: 100,
        timeframeHours: 24,
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
      });
    }
  }, [alertToEdit, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user?.id) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to create alerts',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const alertService = new AnalyticsAlertService();
      const notificationMethods = [
        { type: 'email' as const, enabled: data.emailEnabled },
        { type: 'sms' as const, enabled: data.smsEnabled },
        { type: 'inApp' as const, enabled: data.inAppEnabled },
      ];

      const alertData: CreateAlertParams = {
        userId: user.id,
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        productId: data.productId || undefined,
        threshold: {
          metricType: data.metricType,
          condition: data.condition,
          value: data.value,
          timeframeHours: data.timeframeHours,
        },
        notificationMethods,
      };

      let response;

      if (alertToEdit) {
        response = await alertService.updateAlert(alertToEdit.id, alertData);
      } else {
        response = await alertService.createAlert(alertData);
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data) {
        onSuccess(response.data);
        onClose();
        toast({
          title: 'Success',
          description: `Alert ${alertToEdit ? 'updated' : 'created'} successfully`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error saving alert:', error);
      toast({
        title: 'Error',
        description: `Failed to ${alertToEdit ? 'update' : 'create'} alert: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>{alertToEdit ? 'Edit Alert' : 'Create New Alert'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Alert Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Alert Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Alert name is required' })}
                placeholder="Sales Spike Alert"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Alert me when a product's metrics change significantly..."
                rows={2}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Alert Active</Label>
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="productId">Product (Optional)</Label>
              <Select
                value={watch('productId')}
                onValueChange={(value) => setValue('productId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Leave blank to apply to all products</p>
            </div>

            {/* Metric Type */}
            <div className="space-y-2">
              <Label htmlFor="metricType">Metric</Label>
              <Select
                value={watch('metricType')}
                onValueChange={(value) => setValue('metricType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <RadioGroup
                value={watch('condition')}
                onValueChange={(value: 'above' | 'below') => setValue('condition', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="above" id="above" />
                  <Label htmlFor="above">Above</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="below" id="below" />
                  <Label htmlFor="below">Below</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Threshold Value */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="value">{metricLabel} Threshold</Label>
                <span className="text-sm font-medium">{currentValue}</span>
              </div>
              <Slider
                id="value"
                min={currentMetricType === 'rating' ? 1 : 0}
                max={
                  currentMetricType === 'rating'
                    ? 5
                    : currentMetricType === 'conversion'
                      ? 100
                      : 1000
                }
                step={
                  currentMetricType === 'rating'
                    ? 0.1
                    : currentMetricType === 'conversion'
                      ? 0.5
                      : 5
                }
                value={[currentValue]}
                onValueChange={(values) => setValue('value', values[0])}
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <Label htmlFor="timeframeHours">Time Period</Label>
              <Select
                value={watch('timeframeHours').toString()}
                onValueChange={(value) => setValue('timeframeHours', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notification Methods */}
            <div className="space-y-3">
              <Label>Notification Methods</Label>

              <div className="flex items-center justify-between">
                <Label htmlFor="emailEnabled" className="text-sm font-normal">
                  Email Notifications
                </Label>
                <Switch
                  id="emailEnabled"
                  checked={watch('emailEnabled')}
                  onCheckedChange={(checked) => setValue('emailEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="smsEnabled" className="text-sm font-normal">
                  SMS Notifications
                </Label>
                <Switch
                  id="smsEnabled"
                  checked={watch('smsEnabled')}
                  onCheckedChange={(checked) => setValue('smsEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="inAppEnabled" className="text-sm font-normal">
                  In-App Notifications
                </Label>
                <Switch
                  id="inAppEnabled"
                  checked={watch('inAppEnabled')}
                  onCheckedChange={(checked) => setValue('inAppEnabled', checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : alertToEdit ? 'Update Alert' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
