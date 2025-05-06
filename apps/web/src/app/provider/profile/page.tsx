import { useEffect, useState } from 'react';
import { ProviderProfileForm } from '@/components/provider/profile-form';
import { BusinessProfileWizard } from '@/components/business/business-profile-wizard';
import { BusinessProfileEdit } from '@/components/business/business-profile-edit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, User } from 'lucide-react';

export default function ProviderProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedBusinessSetup, setHasCompletedBusinessSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();

  useEffect(() => {
    checkUser();
[]);

  const checkUser = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      const {
        data: { user },
= await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data.role !== 'provider') {
        router.push('/');
        return;
setProfile(data);

      // Check if business profile is completed
      const { data: businessProfile, error: businessError } = await supabase
        .from('business_profiles')
        .select('completed_setup')
        .eq('provider_id', user.id)
        .single();

      if (!businessError && businessProfile) {
        setHasCompletedBusinessSetup(businessProfile.completed_setup || false);
catch (error) {
      console.error('Error checking user:', error);
finally {
      setIsLoading(false);
const handleTabChange = (value: string) => {
    setActiveTab(value);
if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
if (!profile) {
    return null;
return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Provider Profile</h1>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProviderProfileForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                    <p className="text-lg font-semibold">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="text-lg font-semibold">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="mt-6">
          {hasCompletedBusinessSetup ? (
            <div className="flex flex-col space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Your business profile is complete. You can edit it below.</p>
                  <BusinessProfileEdit />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Let's set up your business profile with a few simple steps.
                  </p>
                  <BusinessProfileWizard />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
