import React, { useState, ChangeEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Input, Card, Text, Flex, VStack } from '@chakra-ui/react';

interface TwoFactorSetupProps {
  secret: string;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
}

export {};
