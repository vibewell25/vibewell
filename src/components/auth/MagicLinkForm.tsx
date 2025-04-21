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
});

interface MagicLinkFormProps {
  onSubmit: (email: string) => Promise<void>;
  className?: string;
}

export const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onSubmit, className = '' }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await onSubmit(values.email);
      toast({
        title: 'Check your email',
        description: 'We sent you a magic link to sign in.',
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send magic link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter your email"
                    className="pl-10"
                    {...field}
                    disabled={isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            'Send magic link'
          )}
        </Button>
      </form>
    </Form>
  );
};
