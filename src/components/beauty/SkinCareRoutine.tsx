import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '@/components/ui';
import { getSkinCareRoutines, createSkinCareRoutine } from '@/lib/api/beauty';
import { SkinCareRoutine, SkinCareProduct, SkinCareCategory } from '@/lib/api/beauty';

const skinCareCategories: SkinCareCategory[] = [
  'cleanser',
  'toner',
  'serum',
  'moisturizer',
  'sunscreen',
  'mask',
  'treatment',
  'eye_care',
  'exfoliant',
  'other',
];

export default function SkinCareRoutineComponent() {
  const [routines, setRoutines] = useState<SkinCareRoutine[]>([]);
  const [showNewRoutine, setShowNewRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    timeOfDay: 'morning' as 'morning' | 'evening' | 'both',
    products: [] as SkinCareProduct[],
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const userRoutines = await getSkinCareRoutines();
      setRoutines(userRoutines);
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const handleAddProduct = () => {
    setNewRoutine(prev => ({
      ...prev,
      products: [
        ...prev.products,
        {
          id: '',
          name: '',
          brand: '',
          category: 'other',
          frequency: 'daily',
          notes: '',
          ingredients: [],
        },
      ],
    }));
  };

  const handleProductChange = (index: number, field: keyof SkinCareProduct, value: string) => {
    setNewRoutine(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      await createSkinCareRoutine(newRoutine);
      setShowNewRoutine(false);
      setNewRoutine({
        name: '',
        description: '',
        timeOfDay: 'morning',
        products: [],
      });
      loadRoutines();
    } catch (error) {
      console.error('Error creating routine:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skincare Routines</h2>
        <Button onClick={() => setShowNewRoutine(!showNewRoutine)}>
          {showNewRoutine ? 'Cancel' : 'New Routine'}
        </Button>
      </div>

      {showNewRoutine && (
        <Card className="p-6 space-y-4">
          <Input
            label="Routine Name"
            value={newRoutine.name}
            onChange={e => setNewRoutine(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Description"
            value={newRoutine.description}
            onChange={e => setNewRoutine(prev => ({ ...prev, description: e.target.value }))}
          />
          <Select
            label="Time of Day"
            value={newRoutine.timeOfDay}
            onChange={e => setNewRoutine(prev => ({ ...prev, timeOfDay: e.target.value as 'morning' | 'evening' | 'both' }))}
            options={[
              { value: 'morning', label: 'Morning' },
              { value: 'evening', label: 'Evening' },
              { value: 'both', label: 'Both' },
            ]}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Products</h3>
              <Button variant="outline" onClick={handleAddProduct}>Add Product</Button>
            </div>

            {newRoutine.products.map((product, index) => (
              <Card key={index} className="p-4 space-y-3">
                <Input
                  label="Product Name"
                  value={product.name}
                  onChange={e => handleProductChange(index, 'name', e.target.value)}
                />
                <Input
                  label="Brand"
                  value={product.brand}
                  onChange={e => handleProductChange(index, 'brand', e.target.value)}
                />
                <Select
                  label="Category"
                  value={product.category}
                  onChange={e => handleProductChange(index, 'category', e.target.value)}
                  options={skinCareCategories.map(cat => ({
                    value: cat,
                    label: cat.replace('_', ' ').charAt(0).toUpperCase() + cat.slice(1),
                  }))}
                />
                <Input
                  label="Frequency"
                  value={product.frequency}
                  onChange={e => handleProductChange(index, 'frequency', e.target.value)}
                />
                <Input
                  label="Notes"
                  value={product.notes || ''}
                  onChange={e => handleProductChange(index, 'notes', e.target.value)}
                />
              </Card>
            ))}
          </div>

          <Button onClick={handleSubmit}>Create Routine</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.map(routine => (
          <Card key={routine.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{routine.name}</h3>
                <p className="text-gray-600">{routine.description}</p>
              </div>
              <Badge>{routine.timeOfDay}</Badge>
            </div>

            <div className="space-y-3">
              {routine.products.map(product => (
                <div key={product.id} className="border-t pt-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Frequency: {product.frequency}
                  </p>
                  {product.notes && (
                    <p className="text-sm text-gray-500 mt-1">{product.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 