import {
  Box,
  Image,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { FaClock, FaDollarSign, FaCamera } from 'react-icons/fa';
import { VirtualTryOn } from '../VirtualTryOn/VirtualTryOn';

interface Practitioner {
  id: string;
  user: {
    name: string;
    image: string;
  };
  specialization: string[];
  experience: number;
  rating: number;
}

interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  imageUrl?: string;
  virtualTryOn?: boolean;
  practitioners: Practitioner[];
  onBookNow?: (serviceId: string) => void;
}

export function ServiceCard({
  id,
  name,
  description,
  duration,
  price,
  imageUrl,
  virtualTryOn,
  practitioners,
  onBookNow,
}: ServiceCardProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      {imageUrl && (
        <Image src={imageUrl} alt={name} height="200px" width="100%" objectFit="cover" />
      )}

      <VStack p={4} align="stretch" spacing={4}>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xl" fontWeight="semibold">
              {name}
            </Text>
            {virtualTryOn && (
              <Badge colorScheme="purple" variant="subtle">
                Virtual Try-On
              </Badge>
            )}
          </HStack>
          {description && (
            <Text color="gray.600" noOfLines={2}>
              {description}
            </Text>
          )}
        </Box>

        <HStack spacing={4}>
          <HStack>
            <Icon as={FaClock} color="gray.500" />
            <Text color="gray.600">{duration} min</Text>
          </HStack>
          <HStack>
            <Icon as={FaDollarSign} color="gray.500" />
            <Text color="gray.600">${price}</Text>
          </HStack>
        </HStack>

        {practitioners.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Available Practitioners
            </Text>
            <HStack spacing={2} overflow="hidden">
              {practitioners.slice(0, 3).map((practitioner) => (
                <Box
                  key={practitioner.id}
                  position="relative"
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                >
                  <Image
                    src={practitioner.user.image}
                    alt={practitioner.user.name}
                    boxSize="40px"
                    borderRadius="full"
                    objectFit="cover"
                  />
                  <Box
                    position="absolute"
                    bottom="-2px"
                    right="-2px"
                    bg="green.500"
                    borderRadius="full"
                    w="12px"
                    h="12px"
                    border="2px solid white"
                  />
                </Box>
              ))}
              {practitioners.length > 3 && (
                <Box
                  bg="gray.100"
                  borderRadius="full"
                  w="40px"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" color="gray.600">
                    +{practitioners.length - 3}
                  </Text>
                </Box>
              )}
            </HStack>
          </Box>
        )}

        <HStack spacing={4}>
          {virtualTryOn && (
            <Button
              leftIcon={<Icon as={FaCamera} />}
              variant="outline"
              colorScheme="purple"
              size="sm"
              onClick={onOpen}
              flex={1}
            >
              Try Now
            </Button>
          )}
          <Button colorScheme="blue" size="sm" onClick={() => onBookNow?.(id)} flex={1}>
            Book Now
          </Button>
        </HStack>
      </VStack>

      {virtualTryOn && isOpen && (
        <VirtualTryOn
          serviceId={id}
          onComplete={() => {
            onClose();
          }}
        />
      )}
    </Box>
  );
}
