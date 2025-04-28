'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'spa', label: 'Spa & Massage' },
  { value: 'hair', label: 'Hair Salon' },
  { value: 'nails', label: 'Nail Salon' },
  { value: 'facial', label: 'Facial & Skin Care' },
  { value: 'wellness', label: 'Wellness Center' },
];

interface BusinessFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  minRating: number;
  onRatingChange: (value: number) => void;
}

export function BusinessFilters({
  selectedCategory,
  onCategoryChange,
  minRating,
  onRatingChange,
}: BusinessFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <RadioGroup value={selectedCategory} onValueChange={onCategoryChange} className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <RadioGroupItem value={category.value} id={category.value} />
              <Label htmlFor={category.value} className="text-sm">
                {category.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[minRating]}
            onValueChange={([value]) => onRatingChange(value)}
            min={0}
            max={5}
            step={0.5}
            className="flex-1"
          />
          <span className="w-12 text-sm font-medium">{minRating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
