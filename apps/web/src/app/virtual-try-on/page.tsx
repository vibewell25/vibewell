import { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchIcon, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the AR viewer to reduce initial page load
const DynamicARViewer = dynamic(
  () => import('@/components/dynamic/DynamicARViewer').then((mod) => mod.DynamicARViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-md bg-gray-200">
        <p className="text-gray-500">Loading AR Experience...</p>
      </div>
    ),
  }
);

// Enhanced product categories with more options
const productCategories = [
  { id: 'makeup', label: 'Makeup' },
  { id: 'hairstyle', label: 'Hairstyles' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'nails', label: 'Nail Polish' },
  { id: 'accessories', label: 'Accessories' }
];

// Expanded mock data for demonstration
const mockModels = {
  makeup: [
    {
      id: 'lipstick-red',
      name: 'Natural Glow',
      thumbnail: '/thumbnails/makeup/natural-glow.jpg',
      brand: 'EcoBeauty',
      rating: 4.5,
      tags: ['natural', 'day', 'office']
    },
    {
      id: 'foundation-medium',
      name: 'Evening Glam',
      thumbnail: '/thumbnails/makeup/evening-glam.jpg',
      brand: 'LuxeFace',
      rating: 4.7,
      tags: ['evening', 'party', 'glam']
    },
    {
      id: 'blush-rose',
      name: 'Rose Petal',
      thumbnail: '/thumbnails/makeup/rose-petal.jpg',
      brand: 'BloomBeauty',
      rating: 4.3,
      tags: ['natural', 'day', 'fresh']
    },
    {
      id: 'highlighter-gold',
      name: 'Golden Hour',
      thumbnail: '/thumbnails/makeup/golden-hour.jpg',
      brand: 'SunKissed',
      rating: 4.8,
      tags: ['glow', 'evening', 'special']
    },
    {
      id: 'contour-medium',
      name: 'Sculpted Face',
      thumbnail: '/thumbnails/makeup/sculpted-face.jpg',
      brand: 'ChiseLook',
      rating: 4.4,
      tags: ['contour', 'professional', 'photo']
    },
    {
      id: 'eyeshadow-smokey',
      name: 'Smokey Night',
      thumbnail: '/thumbnails/makeup/smokey-night.jpg',
      brand: 'DarkGlam',
      rating: 4.6,
      tags: ['evening', 'party', 'dramatic']
    }
  ],
  hairstyle: [
    {
      id: 'hairstyle-waves',
      name: 'Long Waves',
      thumbnail: '/thumbnails/hairstyle/long-waves.jpg',
      brand: 'WaveStyle',
      rating: 4.3,
      tags: ['casual', 'everyday', 'wavy']
    },
    {
      id: 'hairstyle-bob',
      name: 'Short Bob',
      thumbnail: '/thumbnails/hairstyle/short-bob.jpg',
      brand: 'UrbanCuts',
      rating: 4.5,
      tags: ['short', 'modern', 'chic']
    },
    {
      id: 'hairstyle-curls',
      name: 'Bouncy Curls',
      thumbnail: '/thumbnails/hairstyle/bouncy-curls.jpg',
      brand: 'CurlPower',
      rating: 4.6,
      tags: ['curly', 'volume', 'playful']
    },
    {
      id: 'hairstyle-updo',
      name: 'Elegant Updo',
      thumbnail: '/thumbnails/hairstyle/elegant-updo.jpg',
      brand: 'FormalLooks',
      rating: 4.7,
      tags: ['formal', 'wedding', 'special']
    }
  ],
  skincare: [
    {
      id: 'moisturizer-glow',
      name: 'Dewy Glow Moisturizer',
      thumbnail: '/thumbnails/skincare/dewy-glow.jpg',
      brand: 'HydraFresh',
      rating: 4.8,
      tags: ['hydrating', 'glowing', 'daily']
    },
    {
      id: 'serum-vitamin-c',
      name: 'Vitamin C Serum',
      thumbnail: '/thumbnails/skincare/vitamin-c.jpg',
      brand: 'BrightSkin',
      rating: 4.9,
      tags: ['brightening', 'anti-aging', 'morning']
    },
    {
      id: 'mask-clay',
      name: 'Purifying Clay Mask',
      thumbnail: '/thumbnails/skincare/clay-mask.jpg',
      brand: 'PureClay',
      rating: 4.5,
      tags: ['detox', 'weekly', 'pore-refining']
    }
  ],
  nails: [
    {
      id: 'nails-red',
      name: 'Classic Red',
      thumbnail: '/thumbnails/nails/classic-red.jpg',
      brand: 'NailGlam',
      rating: 4.6,
      tags: ['classic', 'elegant', 'statement']
    },
    {
      id: 'nails-french',
      name: 'French Manicure',
      thumbnail: '/thumbnails/nails/french.jpg',
      brand: 'ElegantTips',
      rating: 4.7,
      tags: ['classic', 'neutral', 'professional']
    },
    {
      id: 'nails-ombre',
      name: 'Summer Ombre',
      thumbnail: '/thumbnails/nails/ombre.jpg',
      brand: 'TrendyNails',
      rating: 4.5,
      tags: ['trendy', 'colorful', 'seasonal']
    }
  ],
  accessories: [
    {
      id: 'earrings-hoops',
      name: 'Gold Hoops',
      thumbnail: '/thumbnails/accessories/gold-hoops.jpg',
      brand: 'GoldLux',
      rating: 4.6,
      tags: ['classic', 'everyday', 'gold']
    },
    {
      id: 'necklace-pendant',
      name: 'Gemstone Pendant',
      thumbnail: '/thumbnails/accessories/pendant.jpg',
      brand: 'GemGlow',
      rating: 4.7,
      tags: ['elegant', 'statement', 'special']
    },
    {
      id: 'glasses-round',
      name: 'Round Sunglasses',
      thumbnail: '/thumbnails/accessories/round-glasses.jpg',
      brand: 'VisionStyle',
      rating: 4.5,
      tags: ['summer', 'retro', 'trendy']
    }
  ]
};

function VirtualTryOnContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('makeup');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleTryOn = (modelId: string) => {
    setSelectedModel(modelId);
    setIsARActive(true);
  };

  const handleCloseAR = () => {
    setIsARActive(false);
  };

  const handleFilterToggle = (tag: string) => {
    if (activeFilters.includes(tag)) {
      setActiveFilters(activeFilters.filter(t => t !== tag));
    } else {
      setActiveFilters([...activeFilters, tag]);
    }
  };

  const filteredModels = mockModels[selectedType as keyof typeof mockModels].filter((model) => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply tag filters if any are selected
    const matchesTags = activeFilters.length === 0 || 
      activeFilters.some(tag => model.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Get all unique tags for the current category
  const allTags = Array.from(
    new Set(mockModels[selectedType as keyof typeof mockModels].flatMap(model => model.tags))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Virtual Try-On</h1>
        <p className="text-gray-600">
          Experience beauty services virtually before booking. Try different makeup looks,
          hairstyles, skincare effects, and accessories using augmented reality.
        </p>
      </div>

      {isARActive && selectedModel ? (
        <div className="mb-8">
          <div className="rounded-lg bg-white p-4 shadow-md">
            <DynamicARViewer
              modelId={selectedModel}
              prioritizeBattery={true}
              enableProgressiveLoading={true}
              height="500px"
              onError={(error) => {
                console.error('AR Error:', error);
                setIsARActive(false);
              }}
            />
            <div className="mt-4 flex items-center justify-between">
              <h3 className="font-medium">
                {Object.values(mockModels).flatMap(models => models).find(m => m.id === selectedModel)?.name || 'Unknown Product'}
              </h3>
              <Button variant="outline" onClick={handleCloseAR}>
                Close AR View
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-gray-100' : ''}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {showFilters && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-medium">Filter by tags:</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={activeFilters.includes(tag) ? "default" : "outline"}
                    onClick={() => handleFilterToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Tabs
            defaultValue="makeup"
            onValueChange={(value) => {
              setSelectedType(value);
              setActiveFilters([]);
            }}
          >
            <TabsList className="mb-6 flex flex-wrap">
              {productCategories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {productCategories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredModels.map((model) => (
                    <div key={model.id} className="rounded-lg bg-white p-4 shadow-md">
                      <div className="flex h-[300px] items-center justify-center rounded-md bg-gray-200">
                        <p className="text-gray-500">Virtual Try-On Preview</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <h3 className="font-medium">{model.name}</h3>
                        <div className="text-sm text-gray-500">{model.brand}</div>
                      </div>
                      <div className="mt-1 text-sm text-yellow-500">
                        {'★'.repeat(Math.floor(model.rating))}
                        {model.rating % 1 >= 0.5 ? '½' : ''}
                        {'☆'.repeat(Math.floor(5 - model.rating))}
                        <span className="ml-1 text-gray-600">{model.rating}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {model.tags.map(tag => (
                          <span key={tag} className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Button size="sm" onClick={() => handleTryOn(model.id)}>
                          Try On
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredModels.length === 0 && (
                  <div className="flex h-40 items-center justify-center rounded-md bg-gray-50">
                    <p className="text-gray-500">No products match your search or filters.</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

export default function VirtualTryOnPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">Loading virtual try-on experience...</div>
      }
    >
      <VirtualTryOnContent />
    </Suspense>
  );
}
