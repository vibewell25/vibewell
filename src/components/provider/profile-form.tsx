'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Profile, ProfileVisibility, NotificationPreferences } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { prisma } from '@/lib/database/client';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch
} from "@/components/ui/switch";
import { Shield, Eye, Bell, Mail, Send, CheckCircle2 } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
  profile_visibility: z.enum(['public', 'private', 'contacts_only']),
  show_email: z.boolean(),
  show_phone: z.boolean(),
  allow_tagging: z.boolean(),
  receive_messages_from: z.enum(['anyone', 'contacts_only', 'none']),
  notification_preferences: z.object({
    email_notifications: z.boolean(),
    sms_notifications: z.boolean(),
    push_notifications: z.boolean(),
    marketing_emails: z.boolean(),
    booking_reminders: z.boolean(),
    messages_notifications: z.boolean(),
    promotional_notifications: z.boolean(),
    newsletter: z.boolean(),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProviderProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      allow_tagging: true,
      receive_messages_from: 'anyone',
      notification_preferences: {
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        booking_reminders: true,
        messages_notifications: true,
        promotional_notifications: false,
        newsletter: false,
      },
    }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      reset({
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: data.location || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
        profile_visibility: data.profile_visibility || 'public',
        show_email: data.show_email || false,
        show_phone: data.show_phone || false,
        allow_tagging: data.allow_tagging || true,
        receive_messages_from: data.receive_messages_from || 'anyone',
        notification_preferences: data.notification_preferences || {
          email_notifications: true,
          sms_notifications: true,
          push_notifications: true,
          marketing_emails: false,
          booking_reminders: true,
          messages_notifications: true,
          promotional_notifications: false,
          newsletter: false,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          location: data.location,
          phone: data.phone,
          avatar_url: data.avatar_url,
          profile_visibility: data.profile_visibility,
          show_email: data.show_email,
          show_phone: data.show_phone,
          allow_tagging: data.allow_tagging,
          receive_messages_from: data.receive_messages_from,
          notification_preferences: data.notification_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      
      // Refresh profile data
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const sendEmailVerification = async () => {
    try {
      setIsSendingVerification(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: profile?.email,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox for the verification link',
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification email',
        variant: 'destructive',
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const verifyPhone = async () => {
    // In a real app, this would send a verification code to the user's phone
    // For now, we're just simulating the verification process
    try {
      setIsVerifyingPhone(true);
      
      // Simulate API call to verify phone
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile with verified phone
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (verificationCode === '123456') { // For demo, any 6-digit code would work
        const { error } = await supabase
          .from('profiles')
          .update({
            phone_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        
        toast({
          title: 'Phone Verified',
          description: 'Your phone number has been verified successfully',
        });
        
        // Refresh profile data
        fetchProfile();
      } else {
        toast({
          title: 'Invalid Code',
          description: 'The verification code you entered is incorrect',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying phone:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify phone number',
        variant: 'destructive',
      });
    } finally {
      setIsVerifyingPhone(false);
      setVerificationCode('');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Personal Info
        </TabsTrigger>
        <TabsTrigger value="visibility" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Privacy & Visibility
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
      </TabsList>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Verify your email to access all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{profile?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email_verified 
                      ? 'Email verified' 
                      : 'Email not verified. Please check your inbox for verification link.'}
                  </p>
                </div>
                <div>
                  {profile?.email_verified ? (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Verified
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={sendEmailVerification}
                      disabled={isSendingVerification}
                      className="flex items-center gap-2"
                    >
                      {isSendingVerification ? 'Sending...' : 'Resend Verification'}
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
      
          <Card>
            <CardHeader>
              <CardTitle>Phone Verification</CardTitle>
              <CardDescription>
                Verify your phone number for additional security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                
                {!profile?.phone_verified && profile?.phone && (
                  <div className="space-y-2">
                    <Label htmlFor="verification_code">Verification Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verification_code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                      <Button 
                        type="button"
                        onClick={verifyPhone}
                        disabled={isVerifyingPhone || !verificationCode}
                        className="whitespace-nowrap"
                      >
                        {isVerifyingPhone ? 'Verifying...' : 'Verify Phone'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      For testing, use code: 123456
                    </p>
                  </div>
                )}
                
                {profile?.phone_verified && (
                  <div className="flex items-center text-green-600 font-medium">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Phone Verified
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  placeholder="Enter your full name"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about yourself"
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Enter your location"
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  {...register('avatar_url')}
                  placeholder="Enter your avatar URL"
                />
                {errors.avatar_url && (
                  <p className="text-sm text-red-500">{errors.avatar_url.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="visibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Visibility</CardTitle>
              <CardDescription>
                Control who can see your profile and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile_visibility">Profile Visibility</Label>
                <Select 
                  defaultValue={profile?.profile_visibility || 'public'}
                  onValueChange={(value: ProfileVisibility) => setValue('profile_visibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (Everyone can see)</SelectItem>
                    <SelectItem value="contacts_only">Contacts Only</SelectItem>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_email" className="text-base">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your email address
                  </p>
                </div>
                <Switch 
                  id="show_email"
                  defaultChecked={profile?.show_email || false}
                  onCheckedChange={(checked) => setValue('show_email', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show_phone" className="text-base">Show Phone Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your phone number
                  </p>
                </div>
                <Switch 
                  id="show_phone"
                  defaultChecked={profile?.show_phone || false}
                  onCheckedChange={(checked) => setValue('show_phone', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow_tagging" className="text-base">Allow Tagging</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to tag you in posts and comments
                  </p>
                </div>
                <Switch 
                  id="allow_tagging"
                  defaultChecked={profile?.allow_tagging !== false}
                  onCheckedChange={(checked) => setValue('allow_tagging', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receive_messages_from">Receive Messages From</Label>
                <Select 
                  defaultValue={profile?.receive_messages_from || 'anyone'}
                  onValueChange={(value) => setValue('receive_messages_from', value as 'anyone' | 'contacts_only' | 'none')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select who can message you" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anyone">Anyone</SelectItem>
                    <SelectItem value="contacts_only">Contacts Only</SelectItem>
                    <SelectItem value="none">No One (Disable messages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-medium">Communication Channels</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    id="email_notifications"
                    defaultChecked={profile?.notification_preferences?.email_notifications !== false}
                    onCheckedChange={(checked) => setValue('notification_preferences.email_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms_notifications" className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch 
                    id="sms_notifications"
                    defaultChecked={profile?.notification_preferences?.sms_notifications !== false}
                    onCheckedChange={(checked) => setValue('notification_preferences.sms_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push_notifications" className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your devices
                    </p>
                  </div>
                  <Switch 
                    id="push_notifications"
                    defaultChecked={profile?.notification_preferences?.push_notifications !== false}
                    onCheckedChange={(checked) => setValue('notification_preferences.push_notifications', checked)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Notification Types</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="booking_reminders" className="text-base">Booking Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming bookings
                    </p>
                  </div>
                  <Switch 
                    id="booking_reminders"
                    defaultChecked={profile?.notification_preferences?.booking_reminders !== false}
                    onCheckedChange={(checked) => setValue('notification_preferences.booking_reminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="messages_notifications" className="text-base">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new messages
                    </p>
                  </div>
                  <Switch 
                    id="messages_notifications"
                    defaultChecked={profile?.notification_preferences?.messages_notifications !== false}
                    onCheckedChange={(checked) => setValue('notification_preferences.messages_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotional_notifications" className="text-base">Promotional</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about promotions and offers
                    </p>
                  </div>
                  <Switch 
                    id="promotional_notifications"
                    defaultChecked={profile?.notification_preferences?.promotional_notifications === true}
                    onCheckedChange={(checked) => setValue('notification_preferences.promotional_notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing_emails" className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing emails
                    </p>
                  </div>
                  <Switch 
                    id="marketing_emails"
                    defaultChecked={profile?.notification_preferences?.marketing_emails === true}
                    onCheckedChange={(checked) => setValue('notification_preferences.marketing_emails', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter" className="text-base">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our regular newsletter
                    </p>
                  </div>
                  <Switch 
                    id="newsletter"
                    defaultChecked={profile?.notification_preferences?.newsletter === true}
                    onCheckedChange={(checked) => setValue('notification_preferences.newsletter', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <div className="mt-6">
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </div>
      </form>
    </Tabs>
  );
} 