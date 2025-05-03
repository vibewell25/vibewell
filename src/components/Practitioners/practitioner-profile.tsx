import {
  Box,
  Stack,
  Image,
  Text,
  Badge,
  Grid,
  GridItem,
  Button,
  SimpleGrid,
  Icon,
  ChakraProvider,
} from '@chakra-ui/react';
import { FaStar, FaCertificate, FaGraduationCap, FaLanguage } from 'react-icons/fa';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  beforeImage?: string;
  afterImage?: string;
  category: string;
  tags: string[];
}

interface PractitionerProfileProps {
  id: string;
  user: {
    name: string;
    image: string;
    email: string;
  };
  specialization: string[];
  experience: number;
  bio?: string;
  rating?: number;
  certifications: string[];
  education: string[];
  languages: string[];
  services: Service[];
  portfolio: PortfolioItem[];
  onBookService?: (serviceId: string) => void;
}

export function PractitionerProfile({
  user,
  specialization,
  experience,
  bio,
  rating,
  certifications,
  education,
  languages,
  services,
  portfolio,
  onBookService,
}: PractitionerProfileProps) {
  return (
    <ChakraProvider>
      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={6}>
          <GridItem p={6} bg="gray?.50">
            <Stack spacing={6}>
              <Box textAlign="center">
                <Image
                  src={user?.image}
                  alt={user?.name}
                  borderRadius="full"
                  boxSize="200px"
                  mx="auto"
                  objectFit="cover"
                />
                <Text fontSize="2xl" fontWeight="bold" mt={4}>
                  {user?.name}
                </Text>
                <Stack direction="row" justify="center" mt={2}>
                  {rating && (
                    <Stack direction="row">
                      <Icon as={FaStar} color="yellow?.400" />
                      <Text>{rating?.toFixed(1)}</Text>
                    </Stack>
                  )}
                  <Badge colorScheme="blue">{experience} years exp.</Badge>
                </Stack>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Specializations
                </Text>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {specialization?.map((spec) => (
                    <Badge key={spec} colorScheme="purple">
                      {spec}
                    </Badge>
                  ))}
                </Stack>
              </Box>

              {bio && (
                <Box>
                  <Text fontWeight="semibold" mb={2}>
                    About
                  </Text>
                  <Text color="gray?.600">{bio}</Text>
                </Box>
              )}

              <Box>
                <Stack direction="row" mb={2}>
                  <Icon as={FaCertificate} />
                  <Text fontWeight="semibold">Certifications</Text>
                </Stack>
                <Stack spacing={1}>
                  {certifications?.map((cert) => (
                    <Text key={cert} color="gray?.600">
                      {cert}
                    </Text>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" mb={2}>
                  <Icon as={FaGraduationCap} />
                  <Text fontWeight="semibold">Education</Text>
                </Stack>
                <Stack spacing={1}>
                  {education?.map((edu) => (
                    <Text key={edu} color="gray?.600">
                      {edu}
                    </Text>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" mb={2}>
                  <Icon as={FaLanguage} />
                  <Text fontWeight="semibold">Languages</Text>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  {languages?.map((lang) => (
                    <Badge key={lang} colorScheme="green">
                      {lang}
                    </Badge>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </GridItem>

          <GridItem p={6}>
            <Stack spacing={8}>
              <Box>
                <Text fontSize="xl" fontWeight="semibold" mb={4}>
                  Services
                </Text>
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
                  {services?.map((service) => (
                    <Box
                      key={service?.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="md"
                      _hover={{ shadow: 'sm' }}
                    >
                      <Text fontWeight="medium">{service?.name}</Text>
                      {service?.description && (
                        <Text color="gray?.600" fontSize="sm" mt={1}>
                          {service?.description}
                        </Text>
                      )}
                      <Stack direction="row" mt={2} justify="space-between">
                        <Text color="gray?.600">
                          {service?.duration} min • ${service?.price}
                        </Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onBookService?.(service?.id)}
                        >
                          Book
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>

              {portfolio?.length > 0 && (
                <Box>
                  <Text fontSize="xl" fontWeight="semibold" mb={4}>
                    Portfolio
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                    {portfolio?.map((item) => (
                      <Box key={item?.id} borderWidth="1px" borderRadius="md" overflow="hidden">
                        <Image
                          src={item?.imageUrl}
                          alt={item?.title}
                          height="200px"
                          width="100%"
                          objectFit="cover"
                        />
                        <Box p={3}>
                          <Text fontWeight="medium">{item?.title}</Text>
                          {item?.description && (
                            <Text color="gray?.600" fontSize="sm" mt={1}>
                              {item?.description}
                            </Text>
                          )}
                          <Stack direction="row" mt={2} flexWrap="wrap" gap={1}>
                            {item?.tags.map((tag) => (
                              <Badge key={tag} colorScheme="blue" variant="subtle">
                                {tag}
                              </Badge>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Stack>
          </GridItem>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}
