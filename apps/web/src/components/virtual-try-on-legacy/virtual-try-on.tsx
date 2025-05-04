import { useState, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  Image,
  Text,
  useToast,
  Spinner,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
interface VirtualTryOnProps {
  serviceId?: string;
  onComplete?: (resultUrl: string) => void;
}

export function VirtualTryOn({ serviceId, onComplete }: VirtualTryOnProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useUser();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    if (!preview || !user) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/virtual-try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: preview,
          serviceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      setResult(data.resultUrl);

      if (onComplete) {
        onComplete(data.resultUrl);
      }

      toast({
        title: 'Success',
        description: 'Virtual try-on completed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={6} w="full">
      <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
        <GridItem>
          <Box
            {...getRootProps()}
            p={6}
            border="2px dashed"
            borderColor={isDragActive ? 'blue.400' : 'gray.200'}
            borderRadius="md"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: 'blue.400' }}
          >
            <input {...getInputProps()} />
            {preview ? (
              <Image src={preview} alt="Preview" maxH="300px" mx="auto" objectFit="contain" />
            ) : (
              <Text textAlign="center" color="gray.500">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag and drop an image here, or click to select'}
              </Text>
            )}
          </Box>
        </GridItem>

        <GridItem>
          <Box
            p={6}
            border="2px solid"
            borderColor="gray.200"
            borderRadius="md"
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {isLoading ? (
              <Spinner size="xl" />
            ) : result ? (
              <Image src={result} alt="Result" maxH="300px" mx="auto" objectFit="contain" />
            ) : (
              <Text textAlign="center" color="gray.500">
                Processed image will appear here
              </Text>
            )}
          </Box>
        </GridItem>
      </Grid>

      <Button
        colorScheme="blue"
        isLoading={isLoading}
        onClick={handleSubmit}
        isDisabled={!preview}
        w="full"
      >
        Try On
      </Button>
    </VStack>
  );
}
