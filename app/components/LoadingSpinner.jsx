import React from 'react';
import { Flex, Spinner, Text } from '@chakra-ui/react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      h="300px"
      w="100%"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
      <Text mt={4} color="gray.500" fontSize="md">
        {message}
      </Text>
    </Flex>
  );
};

export default LoadingSpinner; 