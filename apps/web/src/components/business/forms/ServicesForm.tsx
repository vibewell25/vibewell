import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BusinessProfileFormValues } from '@/components/business/business-profile-wizard';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scissors, Plus, Trash2, Pencil, Check, X, Sparkles } from 'lucide-react';

interface ServicesFormProps {
  form: UseFormReturn<BusinessProfileFormValues>;
export function ServicesForm({ form }: ServicesFormProps) {
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
const serviceCategories = [
    { id: 'hair', label: 'Hair' },
    { id: 'nails', label: 'Nails' },
    { id: 'makeup', label: 'Makeup' },
    { id: 'skincare', label: 'Skincare' },
    { id: 'massage', label: 'Massage & Bodywork' },
    { id: 'spa', label: 'Spa Treatments' },
    { id: 'facials', label: 'Facials' },
    { id: 'wellness', label: 'Wellness Therapies' },
    { id: 'fitness', label: 'Fitness & Training' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  const handleAddService = () => {
    if (!newService.name || newService.price <= 0 || newService.duration <= 0) {
      return; // Don't add invalid services
const updatedServices = [...form.watch('services'), newService];
    form.setValue('services', updatedServices, { shouldValidate: true });

    // Reset the new service form
    setNewService({
      name: '',
      description: '',
      duration: 60,
      price: 0,
const handleRemoveService = (index: number) => {
    const services = [...form.watch('services')];
    services.splice(index, 1);
    form.setValue('services', services, { shouldValidate: true });
const handleEditService = (index: number) => {
    setEditingServiceIndex(index);
    const services = form.watch('services');
    setNewService({ ...services[index] });
const handleUpdateService = () => {
    if (editingServiceIndex === null) return;

    const services = [...form.watch('services')];
    services[editingServiceIndex] = newService;

    form.setValue('services', services, { shouldValidate: true });
    setEditingServiceIndex(null);

    // Reset the form
    setNewService({
      name: '',
      description: '',
      duration: 60,
      price: 0,
const handleCancelEdit = () => {
    setEditingServiceIndex(null);
    setNewService({
      name: '',
      description: '',
      duration: 60,
      price: 0,
const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = [...form.watch('serviceCategories')];

    if (checked) {
      // Add category if it doesn't exist
      if (!currentCategories.includes(categoryId)) {
        form.setValue('serviceCategories', [...currentCategories, categoryId], {
          shouldValidate: true,
else {
      // Remove category
      form.setValue(
        'serviceCategories',
        currentCategories.filter((id) => id !== categoryId),
        { shouldValidate: true },
return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <Scissors className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Services & Specialties</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>Select the categories of services you offer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {serviceCategories.map((category) => (
              <div key={category.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={form.watch('serviceCategories').includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
/>
                <Label htmlFor={`category-${category.id}`} className="cursor-pointer font-normal">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.serviceCategories && (
            <p className="mt-2 text-sm text-red-500">
              {form.formState.errors.serviceCategories.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service List</CardTitle>
          <CardDescription>
            Add the specific services you offer, including prices and durations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current services list */}
          {form.watch('services').length > 0 ? (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="space-y-2 p-4">
                {form.watch('services').map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span>${service.price}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditService(index)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveService(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border bg-muted/50 py-8">
              <Sparkles className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No services added yet. Add your first service below.
              </p>
            </div>
          )}

          {form.formState.errors.services && (
            <p className="text-sm text-red-500">{form.formState.errors.services.message}</p>
          )}

          {/* Add/Edit service form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingServiceIndex !== null ? 'Edit Service' : 'Add a Service'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Haircut, Massage, Facial, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Description (Optional)</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Briefly describe what this service includes..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                  <Input
                    id="serviceDuration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })
placeholder="60"
                    min={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicePrice">Price ($)</Label>
                  <Input
                    id="servicePrice"
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })
placeholder="0.00"
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {editingServiceIndex !== null && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}

              {editingServiceIndex !== null ? (
                <Button
                  onClick={handleUpdateService}
                  disabled={!newService.name || newService.price <= 0 || newService.duration <= 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Update Service
                </Button>
              ) : (
                <Button
                  onClick={handleAddService}
                  disabled={!newService.name || newService.price <= 0 || newService.duration <= 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              )}
            </CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
