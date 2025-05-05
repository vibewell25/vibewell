import {
  Box,
  SimpleGrid,
  Stack,
  Image,
  Text,
  Badge,
  Button,
  Icon,
  useColorMode,
from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

interface Practitioner {
  id: string;
  user: {
    name: string;
    image: string;
    email: string;
specialization: string[];
  experience: number;
  rating?: number;
  servicesCount: number;
interface PractitionerListProps {
  practitioners: Practitioner[];
  onViewProfile?: (id: string) => void;
  onBookService?: (id: string) => void;
export function PractitionerList({
  practitioners,
  onViewProfile,
  onBookService,
: PractitionerListProps) {
  const { colorMode } = useColorMode();
  const cardBg = colorMode === 'light' ? 'white' : 'gray.800';
  const borderColor = colorMode === 'light' ? 'gray.200' : 'gray.700';

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
      {practitioners.map((practitioner) => (
        <Box
          key={practitioner.id}
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          _hover={{ shadow: 'md' }}
          transition="all 0.2s"
        >
          <Box position="relative">
            <Image
              src={practitioner.user.image}
              alt={practitioner.user.name}
              height="200px"
              width="100%"
              objectFit="cover"
            />
            {practitioner.rating && (
              <Stack
                direction="row"
                position="absolute"
                top={2}
                right={2}
                bg="blackAlpha.600"
                color="white"
                px={2}
                py={1}
                borderRadius="md"
                align="center"
              >
                <Icon as={FaStar} color="yellow.400" />
                <Text>{practitioner.rating.toFixed(1)}</Text>
              </Stack>
            )}
          </Box>

          <Stack p={4} spacing={3}>
            <Stack spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {practitioner.user.name}
              </Text>
              <Stack direction="row">
                <Badge colorScheme="blue">{practitioner.experience} years exp.</Badge>
                <Badge colorScheme="green">{practitioner.servicesCount} services</Badge>
              </Stack>
            </Stack>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Specializations
              </Text>
              <Stack direction="row" flexWrap="wrap" gap={2}>
                {practitioner.specialization.map((spec) => (
                  <Badge key={spec} colorScheme="purple" variant="subtle">
                    {spec}
                  </Badge>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                flex={1}
                onClick={() => onViewProfile.(practitioner.id)}
              >
                View Profile
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                flex={1}
                onClick={() => onBookService.(practitioner.id)}
              >
                Book Service
              </Button>
            </Stack>
          </Stack>
        </Box>
      ))}
    </SimpleGrid>
