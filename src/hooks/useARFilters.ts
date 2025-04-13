import { useState, useCallback, useEffect } from 'react';

export interface ARFilter {
  id: string;
  name: string;
  thumbnailUrl: string;
  description: string;
  intensity: number;
}

export const useARFilters = () => {
  const [filters, setFilters] = useState<ARFilter[]>([]);
  const [activeFilter, setActiveFilter] = useState<ARFilter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Simulating API fetch delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock data
        const mockFilters: ARFilter[] = [
          {
            id: 'filter1',
            name: 'Sepia',
            thumbnailUrl: '/assets/filters/sepia.png',
            description: 'Classic sepia tone filter',
            intensity: 0.7
          },
          {
            id: 'filter2',
            name: 'Black & White',
            thumbnailUrl: '/assets/filters/bw.png',
            description: 'Monochrome filter',
            intensity: 1.0
          },
          {
            id: 'filter3',
            name: 'Dreamy',
            thumbnailUrl: '/assets/filters/dreamy.png',
            description: 'Soft dreamy effect',
            intensity: 0.5
          },
          {
            id: 'filter4',
            name: 'Vibrant',
            thumbnailUrl: '/assets/filters/vibrant.png',
            description: 'Enhanced color saturation',
            intensity: 0.8
          }
        ];
        
        setFilters(mockFilters);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch AR filters');
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const applyFilter = useCallback((filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (filter) {
      setActiveFilter(filter);
      return { success: true, filter };
    }
    return { success: false, error: 'Filter not found' };
  }, [filters]);

  const removeFilter = useCallback(() => {
    setActiveFilter(null);
    return { success: true };
  }, []);

  const adjustFilterIntensity = useCallback((intensity: number) => {
    if (!activeFilter) {
      return { success: false, error: 'No active filter' };
    }
    
    if (intensity < 0 || intensity > 1) {
      return { success: false, error: 'Intensity must be between 0 and 1' };
    }
    
    setActiveFilter(prev => 
      prev ? { ...prev, intensity } : null
    );
    
    return { success: true, filter: activeFilter };
  }, [activeFilter]);

  return { 
    filters, 
    activeFilter, 
    loading, 
    error, 
    applyFilter, 
    removeFilter,
    adjustFilterIntensity
  };
}; 