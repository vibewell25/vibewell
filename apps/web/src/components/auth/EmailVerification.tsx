import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface EmailVerificationProps {
  email: string;
  onResendVerification: () => Promise<void>;
export {};
