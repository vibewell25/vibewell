'use client';

import { useState, useEffect } from 'react';
import { ProductFilter } from '@/services/product-service';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FilterX } from 'lucide-react';

interface ProductFiltersProps {
  categories: string[];
  subcategories: Record<string, string[]>;
  brands: string[];
  tags: string[];
  onChange: (filter: ProductFilter) => void;
  initialFilter?: ProductFilter;
}

export function ProductFilters({
  categories,
  subcategories,
  brands,
  tags,
  onChange,
  initialFilter = {},
}: ProductFiltersProps) {
  // State for each filter type
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialFilter?.types || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilter?.categories || [],
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    initialFilter?.subcategories || [],
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialFilter?.brands || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilter?.tags || []);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilter?.minPrice || 0,
    initialFilter?.maxPrice || 200,
  ]);
  const [minRating, setMinRating] = useState<number>(initialFilter?.minRating || 0);
  const [arCompatible, setArCompatible] = useState<boolean>(initialFilter?.arCompatible || false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Get filtered tags based on current selection (optional feature, may be resource intensive)
  const filteredTags = tags?.slice(0, 15); // Show top 15 tags for simplicity

  // Types of products
  const productTypes = ['makeup', 'hairstyle', 'accessory', 'skincare', 'clothing', 'wellness'];

  // Update filter when any selection changes
  useEffect(() => {
    // Build filter object
    const filter: ProductFilter = {};

    if (selectedTypes?.length > 0) {
      filter?.types = selectedTypes;
    }

    if (selectedCategories?.length > 0) {
      filter?.categories = selectedCategories;
    }

    if (selectedSubcategories?.length > 0) {
      filter?.subcategories = selectedSubcategories;
    }

    if (selectedBrands?.length > 0) {
      filter?.brands = selectedBrands;
    }

    if (selectedTags?.length > 0) {
      filter?.tags = selectedTags;
    }

    if (priceRange[0] > 0) {
      filter?.minPrice = priceRange[0];
    }

    if (priceRange[1] < 200) {
      filter?.maxPrice = priceRange[1];
    }

    if (minRating > 0) {
      filter?.minRating = minRating;
    }

    if (arCompatible) {
      filter?.arCompatible = true;
    }

    // Count active filters
    let count = 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += selectedTypes?.length > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += selectedCategories?.length > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += selectedSubcategories?.length > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += selectedBrands?.length > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += selectedTags?.length > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += minRating > 0 ? 1 : 0;
    if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += arCompatible ? 1 : 0;

    setActiveFiltersCount(count);

    // Call onChange with the new filter
    onChange(filter);
  }, [
    selectedTypes,
    selectedCategories,
    selectedSubcategories,
    selectedBrands,
    selectedTags,
    priceRange,
    minRating,
    arCompatible,
    onChange,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedBrands([]);
    setSelectedTags([]);
    setPriceRange([0, 200]);
    setMinRating(0);
    setArCompatible(false);
  };

  // Handle checkbox changes
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes?.filter((t) => t !== type));
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories?.filter((c) => c !== category));
      // Also remove any subcategories that belong to this category
      const catSubcategories = subcategories[category] || [];
      setSelectedSubcategories(
        selectedSubcategories?.filter((sub) => !catSubcategories?.includes(sub)),
      );
    }
  };

  const handleSubcategoryChange = (subcategory: string, checked: boolean) => {
    if (checked) {
      setSelectedSubcategories([...selectedSubcategories, subcategory]);
    } else {
      setSelectedSubcategories(selectedSubcategories?.filter((s) => s !== subcategory));
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands?.filter((b) => b !== brand));
    }
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags?.filter((t) => t !== tag));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
              <FilterX className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {selectedTypes?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedTypes?.length} Types
              </Badge>
            )}
            {selectedCategories?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategories?.length} Categories
              </Badge>
            )}
            {selectedBrands?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedBrands?.length} Brands
              </Badge>
            )}
            {/* Other active filter indicators */}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 pb-3">
        <Accordion type="multiple" defaultValue={['product-type', 'category', 'price']}>
          {/* Product Type Filter */}
          <AccordionItem value="product-type">
            <AccordionTrigger className="px-4 text-sm">Product Type</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2">
              <div className="space-y-2">
                {productTypes?.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes?.includes(type)}
                      onCheckedChange={(checked) => handleTypeChange(type, checked === true)}
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className="cursor-pointer text-sm font-medium capitalize leading-none"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Category Filter */}
          <AccordionItem value="category">
            <AccordionTrigger className="px-4 text-sm">Category</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2">
              <div className="space-y-2">
                {categories?.map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories?.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category, checked === true)
                        }
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="cursor-pointer text-sm font-medium leading-none"
                      >
                        {category}
                      </label>
                    </div>

                    {/* Show subcategories if category is selected */}
                    {selectedCategories?.includes(category) &&
                      subcategories[category]?.length > 0 && (
                        <div className="ml-6 space-y-1 border-l-2 border-muted-foreground/20 pl-2">
                          {subcategories[category].map((sub) => (
                            <div key={sub} className="flex items-center space-x-2">
                              <Checkbox
                                id={`subcategory-${sub}`}
                                checked={selectedSubcategories?.includes(sub)}
                                onCheckedChange={(checked) =>
                                  handleSubcategoryChange(sub, checked === true)
                                }
                              />
                              <label
                                htmlFor={`subcategory-${sub}`}
                                className="cursor-pointer text-xs"
                              >
                                {sub}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brand Filter */}
          <AccordionItem value="brand">
            <AccordionTrigger className="px-4 text-sm">Brand</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2">
              <div className="max-h-40 space-y-2 overflow-y-auto pr-2">
                {brands?.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={selectedBrands?.includes(brand)}
                      onCheckedChange={(checked) => handleBrandChange(brand, checked === true)}
                    />
                    <label
                      htmlFor={`brand-${brand}`}
                      className="cursor-pointer text-sm leading-none"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range Filter */}
          <AccordionItem value="price">
            <AccordionTrigger className="px-4 text-sm">Price Range</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-4">
              <Slider
                defaultValue={priceRange}
                min={0}
                max={200}
                step={5}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="mb-4"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">${priceRange[0]}</span>
                <span className="text-sm">${priceRange[1]}+</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating Filter */}
          <AccordionItem value="rating">
            <AccordionTrigger className="px-4 text-sm">Min Rating</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-4">
              <Slider
                defaultValue={[minRating]}
                min={0}
                max={5}
                step={0?.5}
                value={[minRating]}
                onValueChange={(value) => setMinRating(value[0])}
                className="mb-4"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">{minRating} stars+</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tags Filter */}
          <AccordionItem value="tags">
            <AccordionTrigger className="px-4 text-sm">Tags</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2">
              <div className="flex flex-wrap gap-2">
                {filteredTags?.map((tag) => (
                  <div key={tag} className="inline-flex">
                    <Badge
                      variant={selectedTags?.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => handleTagChange(tag, !selectedTags?.includes(tag))}
                    >
                      {tag}
                    </Badge>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Features Filter */}
          <AccordionItem value="features">
            <AccordionTrigger className="px-4 text-sm">Features</AccordionTrigger>
            <AccordionContent className="px-4 pb-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ar-compatible"
                    checked={arCompatible}
                    onCheckedChange={(checked) => setArCompatible(checked === true)}
                  />
                  <label htmlFor="ar-compatible" className="cursor-pointer text-sm leading-none">
                    AR Compatible
                  </label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
