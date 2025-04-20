import { useState } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  Input,
  Select,
  HStack,
  VStack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { PractitionerList } from '../../components/Practitioners/PractitionerList';
import { PractitionerService } from '../../services/practitioner.service';

interface Practitioner {
  id: string;
  user: {
    name: string;
    image: string;
    email: string;
  };
  specialization: string[];
  experience: number;
  rating?: number;
  servicesCount: number;
}

interface PractitionersPageProps {
  practitioners: Practitioner[];
  specializations: string[];
}

export default function PractitionersPage({ 
  practitioners: initialPractitioners,
  specializations,
}: PractitionersPageProps) {
  const [practitioners, setPractitioners] = useState(initialPractitioners);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const router = useRouter();
  const toast = useToast();

  const filteredPractitioners = practitioners.filter((practitioner) => {
    const matchesSearch = practitioner.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || 
      practitioner.specialization.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const handleViewProfile = (id: string) => {
    router.push(`/practitioners/${id}`);
  };

  const handleBookService = (id: string) => {
    router.push(`/booking?practitionerId=${id}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>
            Our Practitioners
          </Heading>
          <Text color="gray.600">
            Meet our experienced team of beauty and wellness professionals
          </Text>
        </Box>

        <Box>
          <HStack spacing={4}>
            <Input
              placeholder="Search practitioners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              placeholder="All Specializations"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              maxW="200px"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </Select>
          </HStack>
        </Box>

        {filteredPractitioners.length > 0 ? (
          <PractitionerList
            practitioners={filteredPractitioners}
            onViewProfile={handleViewProfile}
            onBookService={handleBookService}
          />
        ) : (
          <Box
            textAlign="center"
            py={10}
            px={6}
            bg="gray.50"
            borderRadius="lg"
          >
            <Text color="gray.600">
              No practitioners found matching your criteria
            </Text>
            <Button
              mt={4}
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const practitionerService = new PractitionerService();

  try {
    const practitioners = await practitionerService.getPractitionersByBusiness(
      process.env.BUSINESS_ID as string
    );

    // Extract unique specializations from all practitioners
    const specializations = Array.from(
      new Set(
        practitioners.flatMap((practitioner) => practitioner.specialization)
      )
    ).sort();

    return {
      props: {
        practitioners: practitioners.map((p) => ({
          ...p,
          servicesCount: p.services.length,
        })),
        specializations,
      },
    };
  } catch (error) {
    console.error('Error fetching practitioners:', error);
    return {
      props: {
        practitioners: [],
        specializations: [],
      },
    };
  }
}; 