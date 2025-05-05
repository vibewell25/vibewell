import { useState } from 'react';
import { ServiceFormProps } from '@/components/business/business-profile-wizard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
from '@/components/ui/dropdown-menu';
import { Plus, Scissors, Trash, DollarSign } from 'lucide-react';

// Service categories for beauty and wellness businesses
const SERVICE_CATEGORIES = [
  {
    label: 'Hair',
    value: 'hair',
    subcategories: [
      'Hair Cutting',
      'Hair Coloring',
      'Hair Styling',
      'Hair Extensions',
      'Hair Treatments',
      'Braiding',
      'Weaves',
      "Men's Grooming",
    ],
{
    label: 'Skin',
    value: 'skin',
    subcategories: [
      'Facials',
      'Skin Treatments',
      'Acne Treatments',
      'Anti-Aging',
      'Microdermabrasion',
      'Chemical Peels',
      'Dermaplane',
    ],
{
    label: 'Makeup',
    value: 'makeup',
    subcategories: [
      'Full Face Makeup',
      'Bridal Makeup',
      'Makeup Lessons',
      'Special Occasion Makeup',
      'Eyelash Extensions',
      'Eyebrow Tinting',
    ],
{
    label: 'Nails',
    value: 'nails',
    subcategories: [
      'Manicure',
      'Pedicure',
      'Gel Nails',
      'Acrylic Nails',
      'Nail Art',
      'Nail Repair',
      'Dipping Powder',
    ],
{
    label: 'Massage',
    value: 'massage',
    subcategories: [
      'Swedish Massage',
      'Deep Tissue Massage',
      'Hot Stone Massage',
      'Sports Massage',
      'Prenatal Massage',
      'Couples Massage',
      'Reflexology',
    ],
{
    label: 'Spa',
    value: 'spa',
    subcategories: [
      'Body Wraps',
      'Body Scrubs',
      'Hydrotherapy',
      'Aromatherapy',
      'Sauna',
      'Steam Room',
      'Full Spa Packages',
    ],
{
    label: 'Fitness',
    value: 'fitness',
    subcategories: [
      'Personal Training',
      'Yoga',
      'Pilates',
      'Group Fitness',
      'Nutrition Coaching',
      'Weight Management',
      'Meditation',
    ],
{
    label: 'Other',
    value: 'other',
    subcategories: [
      'Waxing',
      'Threading',
      'Tanning',
      'Ear Piercing',
      'Body Piercing',
      'Tattoo',
      'Permanent Makeup',
      'Wellness Consultation',
    ],
];

// Service durations in minutes
const SERVICE_DURATIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '75', label: '1 hour 15 minutes' },
  { value: '90', label: '1 hour 30 minutes' },
  { value: '105', label: '1 hour 45 minutes' },
  { value: '120', label: '2 hours' },
  { value: '150', label: '2 hours 30 minutes' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
  { value: 'custom', label: 'Custom duration' },
];

export function ServiceForm({ form }: ServiceFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServicePrice, setNewServicePrice] = useState<string>('');
  const [newServiceDuration, setNewServiceDuration] = useState<string>('60');
  const [newServiceDescription, setNewServiceDescription] = useState<string>('');
  const [customDuration, setCustomDuration] = useState<string>('');
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  // Get existing services from form or initialize an empty array
  const services = form.watch('services') || [];

  // Add a new service
  const addService = () => {
    // Form validation
    if (!newServiceName.trim()) {
      alert('Please enter a service name');
      return;
if (!newServicePrice.trim() || isNaN(parseFloat(newServicePrice))) {
      alert('Please enter a valid price');
      return;
// Create new service object
    const newService = {
      id: Date.now().toString(), // Generate a unique ID
      name: newServiceName.trim(),
      category: selectedCategory,
      price: parseFloat(newServicePrice),
      duration:
        newServiceDuration === 'custom' ? parseInt(customDuration) : parseInt(newServiceDuration),
      description: newServiceDescription.trim(),
// Add to existing services
    const updatedServices = [...services, newService];
    form.setValue('services', updatedServices, { shouldValidate: true });

    // Reset form fields
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('60');
    setNewServiceDescription('');
    setShowCustomDuration(false);
    setCustomDuration('');
// Delete a service
  const deleteService = (serviceId: string) => {
    const updatedServices = services.filter((service) => service.id !== serviceId);
    form.setValue('services', updatedServices, { shouldValidate: true });
// Handle duration selection
  const handleDurationChange = (value: string) => {
    setNewServiceDuration(value);
    setShowCustomDuration(value === 'custom');
return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <Scissors className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Services & Pricing</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Services</CardTitle>
          <CardDescription>List the services you offer with pricing and duration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Haircut & Style"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {selectedCategory && (
                <FormItem>
                  <FormLabel>Subcategory</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        Select subcategory (optional)
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {SERVICE_CATEGORIES.find(
                        (c) => c.value === selectedCategory,
                      ).subcategories.map((sub) => (
                        <DropdownMenuItem key={sub}>{sub}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormItem>
              )}
            </div>

            <div className="space-y-4">
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="e.g. 75"
                      className="pl-10"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      min={0}
                      step="0.01"
                    />
                  </div>
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Duration</FormLabel>
                <Select value={newServiceDuration} onValueChange={handleDurationChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>

              {showCustomDuration && (
                <FormItem>
                  <FormLabel>Custom Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter minutes"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      min={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            </div>
          </div>

          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe what this service includes..."
                value={newServiceDescription}
                onChange={(e) => setNewServiceDescription(e.target.value)}
                rows={3}
              />
            </FormControl>
            <FormDescription>Provide details about what's included in this service</FormDescription>
          </FormItem>

          <Button type="button" onClick={addService} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>

          {services.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-medium">Your Services</h3>
              <ScrollArea className="h-[300px] rounded-md border">
                <div className="space-y-4 p-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between rounded-lg bg-muted/50 p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.category && (
                            <Badge variant="outline" className="text-xs">
                              {SERVICE_CATEGORIES.find((c) => c.value === service.category)
                                .label || service.category}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">${service.price.toFixed(2)}</span> •{' '}
                          {service.duration} minutes
                        </div>
                        {service.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteService(service.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Special Offers & Packages</CardTitle>
          <CardDescription>Create special promotions or service bundles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="offersPackages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Offer Service Packages</FormLabel>
                    <FormDescription>
                      Bundle multiple services together at a special rate
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offersSpecialDiscounts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Offer Special Discounts</FormLabel>
                    <FormDescription>
                      First-time customer discounts, seasonal promotions, etc.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="offersGiftCards"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Offer Gift Cards</FormLabel>
                    <FormDescription>
                      Allow customers to purchase gift cards for your services
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="specialOffersDescription"
            render={({ field }) => (
              <FormItem className="mt-6">
                <FormLabel>Special Offers Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe any special offers, packages, or discounts you provide..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
