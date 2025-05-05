import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Mail, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { toast } from '../ui/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
interface MagicLinkFormProps {
  onSubmit: (email: string) => Promise<void>;
  className?: string;
export {};
