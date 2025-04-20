import React, { useState, ChangeEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Card, Text, Flex, VStack } from '@chakra-ui/react';

interface TwoFactorSetupProps {
  secret: string;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  secret,
  onVerify,
  onCancel,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    try {
      setIsVerifying(true);
      setError('');
      const isValid = await onVerify(verificationCode);
      if (!isValid) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card p={6} maxW="400px" w="100%">
      <VStack spacing={6}>
        <Text fontSize="xl" fontWeight="bold">
          Set up Two-Factor Authentication
        </Text>
        
        <Text>
          Scan this QR code with your authenticator app (like Google Authenticator
          or Authy)
        </Text>

        <Flex justify="center" p={4} bg="white" borderRadius="md">
          <QRCodeSVG value={secret} size={200} />
        </Flex>

        <Text fontSize="sm">
          Can't scan the code? Enter this secret manually:
          <Text as="code" mx={2} p={1} bg="gray.100" borderRadius="sm">
            {secret}
          </Text>
        </Text>

        <Input
          placeholder="Enter verification code"
          value={verificationCode}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value)}
          maxLength={6}
        />

        {error && (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        )}

        <Flex gap={4} w="100%">
          <Button
            variant="outline"
            onClick={onCancel}
            flex={1}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleVerify}
            isLoading={isVerifying}
            flex={1}
          >
            Verify
          </Button>
        </Flex>
      </VStack>
    </Card>
  );
}; 