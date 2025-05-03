import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface PasswordResetFormData {
  email: string;
}

interface PasswordResetProps {
  onResetPassword: (email: string) => Promise<void>;
}

export {};
