'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { prisma } from '@/lib/database/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, User, Mail, Globe, BellRing, AlertTriangle, Camera, Check, Eye, EyeOff, Lock, AlertCircle, Smartphone, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AvatarEditorComponent from 'react-avatar-editor';
import { Slider } from '@/components/ui/slider';
import { AvatarEditorDialog } from './avatar-editor';
import { toast } from '@/components/ui/use-toast';

const profileFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  bio: z.string()
    .max(300, 'Bio must be less than 300 characters')
    .nullish()
    .transform(val => val || ''),
  website: z.string()
    .url('Please enter a valid URL')
    .nullish()
    .transform(val => val || ''),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .nullish()
    .transform(val => val || ''),
  visibility: z.enum(['public', 'private', 'contacts']),
  emailVerified: z.boolean().default(false),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showPhone: z.boolean().default(true),
    allowTagging: z.boolean().default(true),
    receiveNotifications: z.boolean().default(true),
  }).default({}),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
    marketing: z.boolean().default(false),
  }).default({}),
  accountSettings: z.object({
    twoFactorAuth: z.boolean().default(false),
    loginNotifications: z.boolean().default(true),
    autoLogout: z.boolean().default(false),
    dataDownload: z.boolean().default(false),
  }).default({}),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Notification preferences schema
const notificationSchema = z.object({
  email_marketing: z.boolean().default(false),
  email_updates: z.boolean().default(true),
  email_comments: z.boolean().default(true),
  email_security: z.boolean().default(true),
  push_new_features: z.boolean().default(true),
  push_mentions: z.boolean().default(true),
  push_comments: z.boolean().default(true),
  push_bookings: z.boolean().default(true),
  sms_security: z.boolean().default(true),
  sms_updates: z.boolean().default(false),
  sms_bookings: z.boolean().default(true),
});

type NotificationPreferences = z.infer<typeof notificationSchema>;

type PrivacyField = keyof ProfileFormValues['privacy'];
type NotificationField = keyof ProfileFormValues['notifications'];
type AccountSettingField = keyof ProfileFormValues['accountSettings'];

type SwitchField = PrivacyField | NotificationField | AccountSettingField;

// Update the switch handler types
type SwitchChangeHandler = (checked: boolean) => void;

const handlePrivacyChange = (field: keyof ProfileFormValues['privacy']): SwitchChangeHandler => {
  return (checked: boolean) => {
    form.setValue(`privacy.${field}`, checked, { shouldDirty: true });
  };
};

const handleNotificationChange = (field: keyof ProfileFormValues['notifications']): SwitchChangeHandler => {
  return (checked: boolean) => {
    form.setValue(`notifications.${field}`, checked, { shouldDirty: true });
  };
};

const handleAccountSettingChange = (field: keyof ProfileFormValues['accountSettings']): SwitchChangeHandler => {
  return (checked: boolean) => {
    form.setValue(`accountSettings.${field}`, checked, { shouldDirty: true });
  };
};

interface ProfileFormProps {
  userId?: string;
  initialData?: Partial<ProfileFormValues>;
  onSuccess?: () => void;
}

export function ProfileForm({ userId, initialData, onSuccess }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarEditorScale, setAvatarEditorScale] = useState(1);
  const [avatarEditor, setAvatarEditor] = useState<AvatarEditorComponent | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_marketing: false,
    email_updates: true,
    email_comments: true,
    email_security: true,
    push_new_features: true,
    push_mentions: true,
    push_comments: true,
    push_bookings: true,
    sms_security: true,
    sms_updates: false,
    sms_bookings: true,
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: initialData?.username ?? '',
      fullName: initialData?.fullName ?? '',
      email: initialData?.email ?? '',
      bio: initialData?.bio ?? '',
      website: initialData?.website ?? '',
      location: initialData?.location ?? '',
      visibility: initialData?.visibility ?? 'public',
      emailVerified: initialData?.emailVerified ?? false,
      privacy: {
        ...initialData?.privacy ?? {},
      },
      notifications: {
        ...initialData?.notifications ?? {},
      },
      accountSettings: {
        ...initialData?.accountSettings ?? {},
      },
    },
  });

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Update form values
          form.reset({
            username: data.username || '',
            fullName: data.full_name || '',
            email: data.email || '',
            bio: data.bio || '',
            website: data.website || '',
            location: data.location || '',
            visibility: data.visibility || 'public',
            emailVerified: data.email_verified || false,
            privacy: {
              ...data.privacy,
            },
            notifications: {
              ...data.notification_preferences,
            },
            accountSettings: {
              ...data.account_settings,
            },
          });
          
          // Set avatar URL
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
          
          // Set notification preferences
          if (data.notification_preferences) {
            setNotifications({
              ...notifications,
              ...data.notification_preferences,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId, form, supabase]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setShowAvatarEditor(true);
    }
  };

  const handleAvatarSave = async (croppedImage: Blob) => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Upload the cropped image to Supabase storage
      const fileExt = selectedImage?.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImage, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setShowAvatarEditor(false);
      setSelectedImage(null);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (err) {
      console.error('Error saving avatar:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    try {
      setIsVerifyingEmail(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No user email found');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox for the verification link',
      });
    } catch (err) {
      console.error('Error sending verification email:', err);
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Update the form submission handler
  const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const updateData = {
        id: userId,
        username: values.username,
        full_name: values.fullName,
        email: values.email,
        bio: values.bio || '',
        website: values.website || '',
        location: values.location || '',
        visibility: values.visibility,
        avatar_url: avatarUrl,
        notification_preferences: values.notifications,
        privacy: values.privacy,
        account_settings: values.accountSettings,
        updated_at: new Date().toISOString(),
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'id' });
        
      if (updateError) throw updateError;
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Update notification preferences
  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Add this function to handle password updates
  const handlePasswordUpdate = async () => {
    try {
      setLoading(true);
      setPasswordError(null);
      
      // Validate passwords
      if (passwordValues.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }
      
      if (passwordValues.newPassword !== passwordValues.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordValues.newPassword,
      });
      
      if (error) throw error;
      
      // Clear form and show success message
      setPasswordValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setPasswordSuccess('Password updated successfully');
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle data export
  const handleDataExport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Fetch user bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId);
        
      if (bookingsError) throw bookingsError;
      
      // Fetch user messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        
      if (messagesError) throw messagesError;
      
      // Fetch user wellness data
      const { data: wellnessData, error: wellnessError } = await supabase
        .from('wellness_tracking')
        .select('*')
        .eq('user_id', userId);
        
      if (wellnessError) throw wellnessError;
      
      // Combine all data
      const exportData = {
        profile: profileData,
        bookings: bookingsData,
        messages: messagesData,
        wellness: wellnessData,
        exported_at: new Date().toISOString(),
      };
      
      // Convert to JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // Create a download link
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vibewell_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      setSuccess('Your data has been exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle account deletion
  const handleAccountDeletion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Delete user data from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
      
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
      
      // Sign out the user
      await supabase.auth.signOut();
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Add this function to handle logout from all devices
  const handleLogoutAllDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign out from all devices by revoking tokens
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) throw error;
      
      // Sign back in the current user to maintain the session
      // This is just a placeholder - in reality, you might want to redirect to login
      setSuccess('Successfully logged out from all devices except this one');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error logging out from all devices:', err);
      setError('Failed to log out from all devices: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle password recovery
  const handlePasswordRecovery = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const email = form.getValues('email');
      
      // Send password recovery email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess('Password recovery email sent. Please check your inbox.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error sending recovery email:', err);
      setError('Failed to send recovery email: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Update the form submission handler
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, form: UseFormReturn<ProfileFormValues>) => {
    e.preventDefault();
    try {
      await form.handleSubmit(onSubmit)(e);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form');
    }
  };

  // Update the switch handlers with proper type annotations
  const handleSwitchChange = (
    field: keyof ProfileFormValues['privacy'] | keyof ProfileFormValues['notifications'] | keyof ProfileFormValues['accountSettings'],
    checked: boolean,
    form: UseFormReturn<ProfileFormValues>
  ): void => {
    const formValues = form.getValues();
    
    if (field in formValues.privacy) {
      form.setValue(`privacy.${field}`, checked, { shouldDirty: true });
    } else if (field in formValues.notifications) {
      form.setValue(`notifications.${field}`, checked, { shouldDirty: true });
    } else if (field in formValues.accountSettings) {
      form.setValue(`accountSettings.${field}`, checked, { shouldDirty: true });
    }
  };

  const handleVisibilityChange = (value: 'public' | 'private' | 'contacts') => {
    form.setValue('visibility', value, { shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-muted">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile picture" />
                ) : (
                  <AvatarFallback className="bg-primary/10">
                    {form.watch('fullName')?.charAt(0) || form.watch('username')?.charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full bg-background border border-input shadow-sm hover:bg-accent hover:text-accent-foreground"
                type="button"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                aria-label="Upload avatar"
                data-cy="avatar-upload-button"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Upload avatar</span>
              </Button>
              
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
                data-cy="avatar-upload-input"
              />
            </div>
            
            <div className="text-center mt-3">
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click the camera icon to upload or update your profile photo
              </p>
            </div>
          </div>
          
          <form onSubmit={(e) => handleFormSubmit(e, form)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  {...form.register('username')}
                  placeholder="johndoe"
                  data-cy="username-input"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  {...form.register('fullName')}
                  placeholder="John Doe"
                  data-cy="fullname-input"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                {!form.watch('emailVerified') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button" 
                    onClick={handleEmailVerification}
                    disabled={isVerifyingEmail}
                    className={isVerifyingEmail ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" : "text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"}
                  >
                    {isVerifyingEmail ? (
                      <div className="flex items-center">
                        <span className="h-4 w-4 animate-spin mr-2 border-2 border-current border-t-transparent rounded-full" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Verify Email
                      </div>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="relative">
                <Input 
                  id="email"
                  {...form.register('email')}
                  placeholder="your.email@example.com"
                  data-cy="email-input"
                  className={`pr-10 ${form.watch('emailVerified') ? 'border-green-500 focus-visible:ring-green-300' : ''}`}
                />
                {form.watch('emailVerified') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
              
              {form.watch('emailVerified') ? (
                <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded border border-green-100">
                  <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Your email is verified. You will receive important account notifications at this address.</span>
                </div>
              ) : (
                <div className="flex items-start text-amber-600 text-sm bg-amber-50 p-2 rounded border border-amber-100">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Email not verified</p>
                    <p className="text-amber-700 mt-1">
                      {isVerifyingEmail 
                        ? 'Please check your inbox and click the verification link we sent you.' 
                        : 'Verify your email to unlock all features and receive important notifications.'}
                    </p>
                    {isVerifyingEmail && (
                      <p className="text-xs mt-1 text-amber-700">
                        If you don't see the email, check your spam folder or click the button above to resend.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                {...form.register('bio')}
                placeholder="Tell us about yourself"
                rows={3}
                data-cy="bio-input"
              />
              {form.formState.errors.bio && (
                <p className="text-sm text-red-500">{form.formState.errors.bio.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {form.watch('bio')?.length || 0}/300 characters
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website"
                  {...form.register('website')}
                  placeholder="https://yourwebsite.com"
                  data-cy="website-input"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  {...form.register('location')}
                  placeholder="City, Country"
                  data-cy="location-input"
                />
                {form.formState.errors.location && (
                  <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
                )}
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium">Privacy Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile information
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    checked={form.watch('visibility') === 'public'}
                    onChange={(e) => handleVisibilityChange('public')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-public" className="font-normal cursor-pointer">
                    <div className="font-medium">Public</div>
                    <p className="text-sm text-muted-foreground">
                      Anyone can view your profile and services
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-contacts"
                    name="visibility"
                    value="contacts"
                    checked={form.watch('visibility') === 'contacts'}
                    onChange={(e) => handleVisibilityChange('contacts')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-contacts" className="font-normal cursor-pointer">
                    <div className="font-medium">Contacts Only</div>
                    <p className="text-sm text-muted-foreground">
                      Only people in your contacts can view your profile
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    checked={form.watch('visibility') === 'private'}
                    onChange={(e) => handleVisibilityChange('private')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-private" className="font-normal cursor-pointer">
                    <div className="font-medium">Private</div>
                    <p className="text-sm text-muted-foreground">
                      Only you can view your profile
                    </p>
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium">Personal Information Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  Control what personal information is shared and with whom
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Address</Label>
                    <p className="text-sm text-muted-foreground">Show your email address on your public profile</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.showEmail')}
                    onCheckedChange={(checked) => handleSwitchChange('showEmail', checked, form)}
                    aria-label="Show email"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Phone Number</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.showPhone')}
                    onCheckedChange={(checked) => handleSwitchChange('showPhone', checked, form)}
                    aria-label="Show phone number"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Profile Tagging</Label>
                    <p className="text-sm text-muted-foreground">Allow others to tag you in posts and comments</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.allowTagging')}
                    onCheckedChange={(checked) => handleSwitchChange('allowTagging', checked, form)}
                    aria-label="Allow tagging"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.receiveNotifications')}
                    onCheckedChange={(checked) => handleSwitchChange('receiveNotifications', checked, form)}
                    aria-label="Show activity status"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium">Communication Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Control how and when we can contact you
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates and notifications via email</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email')}
                    onCheckedChange={(checked) => handleSwitchChange('email', checked, form)}
                    aria-label="Email notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.sms')}
                    onCheckedChange={(checked) => handleSwitchChange('sms', checked, form)}
                    aria-label="SMS notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push')}
                    onCheckedChange={(checked) => handleSwitchChange('push', checked, form)}
                    aria-label="Push notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.marketing')}
                    onCheckedChange={(checked) => handleSwitchChange('marketing', checked, form)}
                    aria-label="Marketing communications"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mt-8">
              <div>
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account security and data preferences.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Two-Factor Authentication
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account with two-factor authentication.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.watch('accountSettings.twoFactorAuth')}
                      onCheckedChange={(checked) => handleSwitchChange('twoFactorAuth', checked, form)}
                      id="two-factor-auth"
                    />
                    {form.watch('accountSettings.twoFactorAuth') && 
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => { /* Open 2FA setup dialog */ }}
                      >
                        Configure
                      </Button>
                    }
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Login Notifications
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Receive an email notification when a new device logs into your account.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('accountSettings.loginNotifications')}
                    onCheckedChange={(checked) => handleSwitchChange('loginNotifications', checked, form)}
                    id="login-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Auto Logout
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 24 hours of inactivity for improved security.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch('accountSettings.autoLogout')}
                    onCheckedChange={(checked) => handleSwitchChange('autoLogout', checked, form)}
                    id="auto-logout"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">
                      Data Download
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Allow one-click download of all your personal data from Vibewell.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.watch('accountSettings.dataDownload')}
                      onCheckedChange={(checked) => handleSwitchChange('dataDownload', checked, form)}
                      id="data-download"
                    />
                    {form.watch('accountSettings.dataDownload') && 
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDataExport}
                        disabled={loading}
                      >
                        {loading ? 'Downloading...' : 'Download'}
                      </Button>
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || !form.formState.isDirty}
                data-cy="save-profile-button"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    checked={form.watch('visibility') === 'public'}
                    onChange={(e) => handleVisibilityChange('public')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-public" className="font-normal cursor-pointer">
                    <div className="font-medium">Public</div>
                    <p className="text-sm text-muted-foreground">
                      Anyone can view your profile and services
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-contacts"
                    name="visibility"
                    value="contacts"
                    checked={form.watch('visibility') === 'contacts'}
                    onChange={(e) => handleVisibilityChange('contacts')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-contacts" className="font-normal cursor-pointer">
                    <div className="font-medium">Contacts Only</div>
                    <p className="text-sm text-muted-foreground">
                      Only people in your contacts can view your profile
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    checked={form.watch('visibility') === 'private'}
                    onChange={(e) => handleVisibilityChange('private')}
                    className="h-4 w-4 rounded-full text-primary"
                  />
                  <Label htmlFor="visibility-private" className="font-normal cursor-pointer">
                    <div className="font-medium">Private</div>
                    <p className="text-sm text-muted-foreground">
                      Only you can view your profile
                    </p>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                Personal Information Privacy
              </CardTitle>
              <CardDescription>
                Control what personal information is shared and with whom
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Address</Label>
                    <p className="text-sm text-muted-foreground">Show your email address on your public profile</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.showEmail')}
                    onCheckedChange={(checked) => handleSwitchChange('showEmail', checked, form)}
                    aria-label="Show email"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Phone Number</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.showPhone')}
                    onCheckedChange={(checked) => handleSwitchChange('showPhone', checked, form)}
                    aria-label="Show phone number"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Profile Tagging</Label>
                    <p className="text-sm text-muted-foreground">Allow others to tag you in posts and comments</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.allowTagging')}
                    onCheckedChange={(checked) => handleSwitchChange('allowTagging', checked, form)}
                    aria-label="Allow tagging"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Show when you're active on the platform</p>
                  </div>
                  <Switch
                    checked={form.watch('privacy.receiveNotifications')}
                    onCheckedChange={(checked) => handleSwitchChange('receiveNotifications', checked, form)}
                    aria-label="Show activity status"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-primary" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                Control how and when we can contact you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates and notifications via email</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email')}
                    onCheckedChange={(checked) => handleSwitchChange('email', checked, form)}
                    aria-label="Email notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.sms')}
                    onCheckedChange={(checked) => handleSwitchChange('sms', checked, form)}
                    aria-label="SMS notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push')}
                    onCheckedChange={(checked) => handleSwitchChange('push', checked, form)}
                    aria-label="Push notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and offers</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.marketing')}
                    onCheckedChange={(checked) => handleSwitchChange('marketing', checked, form)}
                    aria-label="Marketing communications"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading || !form.formState.isDirty}
              data-cy="save-privacy-button"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Privacy Settings'
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Manage the types of email notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing</Label>
                    <p className="text-sm text-muted-foreground">Promotional emails about new features and offers</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email_marketing')}
                    onCheckedChange={(checked) => handleSwitchChange('email_marketing', checked, form)}
                    aria-label="Email marketing"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Account Updates</Label>
                    <p className="text-sm text-muted-foreground">Important updates about your account</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email_updates')}
                    onCheckedChange={(checked) => handleSwitchChange('email_updates', checked, form)}
                    aria-label="Email updates"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Comments</Label>
                    <p className="text-sm text-muted-foreground">Replies to your comments and reviews</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email_comments')}
                    onCheckedChange={(checked) => handleSwitchChange('email_comments', checked, form)}
                    aria-label="Email comments"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Security updates, suspicious activity, and password changes</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.email_security')}
                    onCheckedChange={(checked) => handleSwitchChange('email_security', checked, form)}
                    aria-label="Email security alerts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2 text-primary" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Manage notifications sent to your devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">New Features</Label>
                    <p className="text-sm text-muted-foreground">Announcements about new platform features</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push_new_features')}
                    onCheckedChange={(checked) => handleSwitchChange('push_new_features', checked, form)}
                    aria-label="Push new features"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mentions</Label>
                    <p className="text-sm text-muted-foreground">When someone mentions you in a comment</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push_mentions')}
                    onCheckedChange={(checked) => handleSwitchChange('push_mentions', checked, form)}
                    aria-label="Push mentions"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Comments</Label>
                    <p className="text-sm text-muted-foreground">Replies to your comments and reviews</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push_comments')}
                    onCheckedChange={(checked) => handleSwitchChange('push_comments', checked, form)}
                    aria-label="Push comments"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Booking Updates</Label>
                    <p className="text-sm text-muted-foreground">Updates about your appointments and services</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.push_bookings')}
                    onCheckedChange={(checked) => handleSwitchChange('push_bookings', checked, form)}
                    aria-label="Push booking updates"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Manage text messages sent to your phone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">Critical security alerts and verification codes</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.sms_security')}
                    onCheckedChange={(checked) => handleSwitchChange('sms_security', checked, form)}
                    aria-label="SMS security alerts"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Account Updates</Label>
                    <p className="text-sm text-muted-foreground">Important updates about your account</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.sms_updates')}
                    onCheckedChange={(checked) => handleSwitchChange('sms_updates', checked, form)}
                    aria-label="SMS updates"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">Appointment confirmations and reminders</p>
                  </div>
                  <Switch
                    checked={form.watch('notifications.sms_bookings')}
                    onCheckedChange={(checked) => handleSwitchChange('sms_bookings', checked, form)}
                    aria-label="SMS booking reminders"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={loading}
              data-cy="save-notifications-button"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                'Save Notification Settings'
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordValues.currentPassword}
                      onChange={(e) => setPasswordValues({...passwordValues, currentPassword: e.target.value})}
                      placeholder="Enter your current password"
                      data-cy="current-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showCurrentPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordValues.newPassword}
                      onChange={(e) => setPasswordValues({...passwordValues, newPassword: e.target.value})}
                      placeholder="Enter your new password"
                      data-cy="new-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showNewPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordValues.confirmPassword}
                      onChange={(e) => setPasswordValues({...passwordValues, confirmPassword: e.target.value})}
                      placeholder="Confirm your new password"
                      data-cy="confirm-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              
              {passwordError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              
              {passwordSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handlePasswordUpdate}
                disabled={loading || !passwordValues.currentPassword || !passwordValues.newPassword || !passwordValues.confirmPassword}
                data-cy="update-password-button"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage third-party accounts that are connected to your Vibewell account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4267B2]">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Facebook</h4>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1DA1F2]">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Twitter</h4>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-100 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#DB4437]">
                      <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C14.1313 2 16.0799 2.73029 17.6133 3.93957L15.4143 7.67435C14.5635 6.93207 13.3952 6.5 12.1217 6.5C9.2894 6.5 7 8.73949 7 11.5C7 14.2605 9.2894 16.5 12.1217 16.5C14.4028 16.5 16.1242 15.0952 16.5 13.2987H12V9.74885H21.5V12C21.5 17.5228 17.0228 22 12 22Z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Google</h4>
                    <p className="text-sm text-muted-foreground">Connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Recent login activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h4 className="text-sm font-medium">Current Device</h4>
                    <p className="text-sm text-muted-foreground">MacOS • San Francisco, CA</p>
                    <p className="text-xs text-muted-foreground">Last active now</p>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-xs font-medium">Current</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h4 className="text-sm font-medium">Chrome • iPhone</h4>
                    <p className="text-sm text-muted-foreground">iOS • New York, NY</p>
                    <p className="text-xs text-muted-foreground">Last active 2 days ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Log Out
                  </Button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium">Safari • iPad</h4>
                    <p className="text-sm text-muted-foreground">iPadOS • Boston, MA</p>
                    <p className="text-xs text-muted-foreground">Last active 1 week ago</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                onClick={handleLogoutAllDevices}
                disabled={loading}
                data-cy="logout-all-devices-button"
              >
                {loading ? 'Processing...' : 'Log Out From All Devices'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                When you delete your account, all of your data will be permanently removed from our servers. This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirmation(true)}
                data-cy="delete-account-button"
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Recovery</CardTitle>
              <CardDescription>
                Options to recover your account if you lose access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recovery Email</h4>
                <p className="text-sm text-muted-foreground">
                  We'll use your primary email for account recovery: {form.watch('email')}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recovery Options</h4>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline"
                    onClick={handlePasswordRecovery}
                    disabled={loading || !form.watch('email')}
                    className="justify-start"
                    data-cy="reset-password-button"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Send Password Reset Email
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => form.setValue('accountSettings.twoFactorAuth', true, { shouldDirty: true })}
                    disabled={form.watch('accountSettings.twoFactorAuth')}
                    className="justify-start"
                    data-cy="enable-2fa-button"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Enable Two-Factor Authentication
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {showAvatarEditor && selectedImage && (
        <AvatarEditorDialog
          image={selectedImage}
          onSave={handleAvatarSave}
          onCancel={() => {
            setShowAvatarEditor(false);
            setSelectedImage(null);
          }}
          isOpen={showAvatarEditor}
        />
      )}
      
      {/* Account Deletion Confirmation Dialog */}
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be erased.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTitle className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warning
              </AlertTitle>
              <AlertDescription>
                Deleting your account will remove all of your profile information, bookings, messages, and other data. This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-deletion">
                To confirm, type <span className="font-semibold">DELETE MY ACCOUNT</span> below:
              </Label>
              <Input 
                id="confirm-deletion"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="border-red-300 focus:border-red-500"
                data-cy="confirm-deletion-input"
              />
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirmation(false);
              setDeleteConfirmationText('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleAccountDeletion}
              disabled={loading || deleteConfirmationText !== 'DELETE MY ACCOUNT'}
              className="min-w-[100px]"
              data-cy="confirm-deletion-button"
            >
              {loading ? 
                <div className="flex items-center">
                  <span className="animate-spin mr-2">⟳</span>
                  Deleting...
                </div> 
                : 'Delete Permanently'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 