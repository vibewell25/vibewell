import React, { Suspense } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../components/LoadingSpinner';

// Dynamically import components with loading fallbacks
const Header = dynamic(() => import('../components/Header'), {
  loading: () => <Box h="64px" bg={useColorModeValue('white', 'gray.800')} borderBottomWidth="1px" />,
  ssr: true
const Sidebar = dynamic(() => import('../components/Sidebar'), {
  loading: () => <Box w={{ base: 0, md: '240px' }} />,
  ssr: true
const Footer = dynamic(() => import('../components/Footer'), {
  loading: () => <Box h="64px" />,
  ssr: true
// Lazy load non-critical components
const Analytics = dynamic(() => import('../components/Analytics'), { ssr: false });
const Notifications = dynamic(() => import('../components/Notifications'), { ssr: false });

const AppLayout = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Flex flex="1">
        <Sidebar />
        <Box
          flex="1"
          bg={bgColor}
          p={{ base: 4, md: 6 }}
          overflowY="auto"
        >
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
          
          {/* Non-critical components */}
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          
          <Suspense fallback={null}>
            <Notifications />
          </Suspense>
        </Box>
      </Flex>
      <Footer />
    </Flex>
export default AppLayout; 