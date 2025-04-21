import { useState, useEffect } from 'react';

export interface ARModel {
  id: string;
  name: string;
  thumbnailUrl: string;
  description: string;
}

export const useARModels = () => {
  const [models, setModels] = useState<ARModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        // Simulating API fetch delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data
        const mockModels: ARModel[] = [
          {
            id: 'model1',
            name: 'Sun Glasses',
            thumbnailUrl: '/assets/models/glasses.png',
            description: 'Virtual sun glasses',
          },
          {
            id: 'model2',
            name: 'Hat',
            thumbnailUrl: '/assets/models/hat.png',
            description: 'Virtual hat',
          },
          {
            id: 'model3',
            name: 'Mask',
            thumbnailUrl: '/assets/models/mask.png',
            description: 'Virtual face mask',
          },
          {
            id: 'model4',
            name: 'Butterfly Effect',
            thumbnailUrl: '/assets/models/butterfly.png',
            description: 'Butterfly animation effect',
          },
        ];

        setModels(mockModels);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch AR models');
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, loading, error };
};
