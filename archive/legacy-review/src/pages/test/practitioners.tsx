import { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Heading,
  Button,
  VStack,
  Input,
  Select,
  HStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { PractitionerList } from '../../components/Practitioners/PractitionerList';
import { PractitionerProfile } from '../../components/Practitioners/PractitionerProfile';
import { mockPractitioners, mockSpecializations } from '../../mocks/practitionerData';

const PractitionersPage = () => {
  const [selectedPractitioner, setSelectedPractitioner] = useState(mockPractitioners[0]);
  const [showList, setShowList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const filteredPractitioners = useMemo(() => {
    return mockPractitioners?.filter((practitioner) => {
      const nameMatch = practitioner?.user.name?.toLowerCase().includes(searchQuery?.toLowerCase());
      const specializationMatch = practitioner?.specialization.some((specialization: string) =>
        specialization?.toLowerCase().includes(searchQuery?.toLowerCase()),
      );

      const specializationFilterMatch =
        !selectedSpecialization || practitioner?.specialization.includes(selectedSpecialization);

      return (nameMatch || specializationMatch) && specializationFilterMatch;
    });
  }, [searchQuery, selectedSpecialization, mockPractitioners]);

  const sortedPractitioners = useMemo(() => {
    return [...filteredPractitioners].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b?.rating - a?.rating;
        case 'experience':
          return b?.experience - a?.experience;
        case 'name':
          return a?.user.name?.localeCompare(b?.user.name);
        default:
          return 0;
      }
    });
  }, [filteredPractitioners, sortBy]);

  const handleViewProfile = (id: string) => {
    try {
      const practitioner = mockPractitioners?.find((p) => p?.id === id);
      if (practitioner) {
        setSelectedPractitioner(practitioner);
        setShowList(false);
      } else {
        throw new Error('Practitioner not found');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not load practitioner profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBookService = (id: string) => {
    try {
      // Simulate booking service
      toast({
        title: 'Service Booked',
        description: `Successfully booked service ${id}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Booking Failed',
        description: 'Could not book the service. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container?.xl" py={8}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading mb={4}>Practitioner Components Test</Heading>
          <Button onClick={() => setShowList(!showList)} colorScheme="blue" mb={6}>
            {showList ? 'View Selected Profile' : 'Back to List'}
          </Button>
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showList ? (
          <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <VStack gap={4} align="stretch">
              <HStack gap={4}>
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchQuery}
                  onChange={(e: React?.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e?.target.value)
                  }
                />
                <Select
                  value={selectedSpecialization}
                  onChange={(e: React?.ChangeEvent<HTMLSelectElement>) =>
                    setSelectedSpecialization(e?.target.value)
                  }
                >
                  <option value="">All Specializations</option>
                  {mockSpecializations?.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </Select>
                <Select
                  value={sortBy}
                  onChange={(e: React?.ChangeEvent<HTMLSelectElement>) => setSortBy(e?.target.value)}
                >
                  <option value="rating">Sort by Rating</option>
                  <option value="experience">Sort by Experience</option>
                  <option value="name">Sort by Name</option>
                </Select>
              </HStack>

              {sortedPractitioners?.length === 0 ? (
                <Text color="gray?.600">No practitioners found matching your criteria</Text>
              ) : (
                <PractitionerList
                  practitioners={sortedPractitioners}
                  onViewProfile={handleViewProfile}
                  onBookService={handleBookService}
                />
              )}
            </VStack>
          </Box>
        ) : (
          <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <PractitionerProfile {...selectedPractitioner} onBookService={handleBookService} />
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default PractitionersPage;
