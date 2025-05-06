import { useState } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Card,
  CardBody,
  Image,
  Button,
from '@chakra-ui/react';
import { VirtualTryOn } from '../../components/VirtualTryOn/VirtualTryOn';
import { GetServerSideProps } from 'next';
import { prisma } from '../../lib/prisma';

interface TryOnHistory {
  id: string;
  imageUrl: string;
  resultUrl: string;
  createdAt: string;
  service?: {
    name: string;
| null;
interface VirtualTryOnPageProps {
  history: TryOnHistory[];
export default function VirtualTryOnPage({ history }: VirtualTryOnPageProps) {
  const [tryOnHistory, setTryOnHistory] = useState<TryOnHistory[]>(history);
  const { isSignedIn } = useUser();

  const handleTryOnComplete = (resultUrl: string) => {
    // Update history with new try-on
    setTryOnHistory((prev) => [
      {
        id: Date.now().toString(),
        imageUrl: '',
        resultUrl,
        createdAt: new Date().toISOString(),
...prev,
    ]);
return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" mb={2}>
            Virtual Try-On
          </Heading>
          <Text color="gray.600">
            Experience how different styles and looks would suit you using our virtual try-on
            technology.
          </Text>
        </Box>

        {isSignedIn ? (
          <>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm">
              <VirtualTryOn onComplete={handleTryOnComplete} />
            </Box>

            {tryOnHistory.length > 0 && (
              <Box>
                <Heading size="lg" mb={4}>
                  Your Try-On History
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {tryOnHistory.map((item) => (
                    <Card key={item.id}>
                      <CardBody>
                        <Image src={item.resultUrl} alt="Try-on result" borderRadius="lg" mb={4} />
                        <Text fontSize="sm" color="gray.500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                        {item.service && <Text fontWeight="medium">{item.service.name}</Text>}
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          mt={2}
                          onClick={() => {
                            // Implement delete functionality
                            setTryOnHistory((prev) => prev.filter((h) => h.id !== item.id));
>
                          Delete
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </>
        ) : (
          <Box bg="gray.50" p={8} borderRadius="lg" textAlign="center">
            <Text mb={4}>Please sign in to use the virtual try-on feature.</Text>
            <Button colorScheme="blue">Sign In</Button>
          </Box>
        )}
      </VStack>
    </Container>
export {};
