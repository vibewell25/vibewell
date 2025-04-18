'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { toast } from 'react-hot-toast';
import { Input, Textarea, Button, Spinner } from '@/components/ui';
import { FileUpload } from '@/components/shared/FileUpload';
import { fetchBusinessProfile, updateBusinessProfile } from '@/lib/api/business';

interface BusinessProfileFormData {
  name: string;
  description: string;
  location: string;
  website: string;
  phone: string;
  logo?: File | null;
  bannerImage?: File | null;
}

export default function BusinessProfileEdit() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    name: '',
    description: '',
    location: '',
    website: '',
    phone: '',
    logo: null,
    bannerImage: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    async function loadBusinessProfile() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const profile = await fetchBusinessProfile(user.sub as string);
        
        if (profile) {
          setFormData({
            name: profile.name || '',
            description: profile.description || '',
            location: profile.location || '',
            website: profile.website || '',
            phone: profile.phone || '',
            logo: null,
            bannerImage: null
          });
          
          if (profile.logoUrl) {
            setLogoPreview(profile.logoUrl);
          }
          
          if (profile.bannerImageUrl) {
            setBannerPreview(profile.bannerImageUrl);
          }
        }
      } catch (error) {
        console.error('Error loading business profile:', error);
        toast.error('Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      loadBusinessProfile();
    }
  }, [user, userLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, logo: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleBannerChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, bannerImage: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBannerPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to save your profile');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updateBusinessProfile(user.sub as string, {
        ...formData,
        logoFile: formData.logo,
        bannerImageFile: formData.bannerImage,
      });
      
      toast.success('Business profile updated successfully');
      router.push('/business/profile');
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast.error('Failed to update business profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Business Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Business Name
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your business name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your business"
              rows={4}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Business location"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium mb-1">
              Website
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://your-website.com"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1 (123) 456-7890"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Business Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <FileUpload 
                accept="image/*"
                onChange={handleLogoChange}
                maxSizeMB={2}
                buttonText={logoPreview ? "Change Logo" : "Upload Logo"}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Banner Image
            </label>
            <div className="space-y-2">
              {bannerPreview && (
                <div className="w-full h-40 rounded-md overflow-hidden">
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <FileUpload 
                accept="image/*"
                onChange={handleBannerChange}
                maxSizeMB={5}
                buttonText={bannerPreview ? "Change Banner" : "Upload Banner"}
              />
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/business/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? <Spinner size="sm" className="mr-2" /> : null}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
} 