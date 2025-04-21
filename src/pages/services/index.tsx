import { useState } from 'react';
import {
  Container,
  SimpleGrid,
  Box,
  Heading,
  Text,
  Input,
  Select,
  HStack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ServiceCard } from '../../components/BeautyServices/ServiceCard';
import { BeautyServiceService } from '../../services/beautyService.service';
interface Category {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  imageUrl?: string;
  virtualTryOn: boolean;
  category: {
    id: string;
    name: string;
  };
  practitioners: Array<{
    id: string;
    user: {
      name: string;
      image: string;
    };
    specialization: string[];
    experience: number;
    rating: number;
  }>;
}

interface ServicesPageProps {
  services: Service[];
  categories: Category[];
}

export default function ServicesPage({ services: initialServices, categories }: ServicesPageProps) {
  const [services, setServices] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { isSignedIn } = useUser();

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookNow = (serviceId: string) => {
    if (!isSignedIn) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to book a service',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    router.push(`/booking/${serviceId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading size="xl" mb={2}>
          Beauty & Wellness Services
        </Heading>
        <Text color="gray.600">
          Discover our range of professional beauty and wellness services
        </Text>
      </Box>

      <Box mb={8}>
        <HStack spacing={4}>
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            maxW="200px"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </HStack>
      </Box>

      {filteredServices.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredServices.map(service => (
            <ServiceCard key={service.id} {...service} onBookNow={handleBookNow} />
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10} px={6} bg="gray.50" borderRadius="lg">
          <Text color="gray.600">No services found matching your criteria</Text>
          <Button
            mt={4}
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const beautyServiceService = new BeautyServiceService();

  try {
    const [services, categories] = await Promise.all([
      beautyServiceService.getServicesByBusiness(process.env.BUSINESS_ID as string),
      beautyServiceService.getServiceCategories(),
    ]);

    return {
      props: {
        services,
        categories: categories.map(({ id, name }) => ({ id, name })),
      },
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    return {
      props: {
        services: [],
        categories: [],
      },
    };
  }
};
