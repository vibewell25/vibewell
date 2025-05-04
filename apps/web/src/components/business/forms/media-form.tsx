'use client';;
import { useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BusinessProfileFormValues } from '@/components/business/business-profile-wizard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageIcon, Upload, X, Image as ImageLucide, Camera } from 'lucide-react';

interface MediaFormProps {
  form: UseFormReturn<BusinessProfileFormValues>;
}

export function MediaForm({ form }: MediaFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB max
      alert('Image must be less than 5MB');
      return;
    }

    // Create and set preview
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Set form value
    form.setValue('logo', file, { shouldValidate: true });
  };

  // Handle cover image file selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB max
      alert('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    form.setValue('coverImage', file, { shouldValidate: true });
  };

  // Handle gallery image file selection
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate and process each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [...galleryPreviews];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 10MB size limit.`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        setGalleryPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    // Add to existing gallery images
    const currentGallery = form.watch('galleryImages') || [];
    form.setValue('galleryImages', [...currentGallery, ...validFiles], { shouldValidate: true });
  };

  // Remove a gallery image
  const removeGalleryImage = (index: number) => {
    const currentGallery = form.watch('galleryImages') || [];
    const updatedGallery = [...currentGallery];
    updatedGallery.splice(index, 1);
    form.setValue('galleryImages', updatedGallery, { shouldValidate: true });

    // Update previews
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);
  };

  // Remove logo
  const removeLogo = () => {
    form.setValue('logo', null, { shouldValidate: true });
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Remove cover image
  const removeCover = () => {
    form.setValue('coverImage', null, { shouldValidate: true });
    setCoverPreview(null);
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  // Add keyboard support for interactive elements
  const handleRemoveLogoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeLogo();
    }
  };

  const handleRemoveCoverKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeCover();
    }
  };

  const handleRemoveGalleryImageKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeGalleryImage(index);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Media & Images</h2>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Business Logo</CardTitle>
          <CardDescription>
            Upload your business logo (recommended size: 512×512 pixels)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {logoPreview ? (
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-muted">
                <img src={logoPreview} alt="Business Logo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={removeLogo}
                  onKeyDown={handleRemoveLogoKeyDown}
                  className="absolute right-1 top-1 rounded-full bg-background p-1 shadow"
                  aria-label="Remove logo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted">
                <Camera className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              </div>
            )}

            <div>
              <input
                ref={logoInputRef}
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
                aria-label="Upload business logo"
              />
              <Button type="button" variant="outline" onClick={() => logoInputRef.current.click()}>
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                {logoPreview ? 'Change Logo' : 'Upload Logo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cover Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Cover Image</CardTitle>
          <CardDescription>
            Upload a cover image for your business profile (recommended size: 1200×400 pixels)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coverPreview ? (
              <div className="relative h-48 overflow-hidden rounded-lg bg-muted">
                <img
                  src={coverPreview}
                  alt="Business Cover Image"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  onKeyDown={handleRemoveCoverKeyDown}
                  className="absolute right-2 top-2 rounded-full bg-background p-1 shadow"
                  aria-label="Remove cover image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted">
                <ImageLucide className="mb-2 h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No cover image uploaded</p>
              </div>
            )}

            <div>
              <input
                ref={coverInputRef}
                type="file"
                id="cover-upload"
                className="hidden"
                accept="image/*"
                onChange={handleCoverChange}
                aria-label="Upload cover image"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => coverInputRef.current.click()}
              >
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                {coverPreview ? 'Change Cover Image' : 'Upload Cover Image'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>
            Upload images for your business gallery (up to 10 images, max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {galleryPreviews.length > 0 && (
              <ScrollArea className="h-64 w-full rounded-md border">
                <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative h-32 overflow-hidden rounded-md bg-muted">
                      <img
                        src={preview}
                        alt={`Gallery image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        onKeyDown={(e) => handleRemoveGalleryImageKeyDown(e, index)}
                        className="absolute right-1 top-1 rounded-full bg-background p-1 shadow"
                        aria-label={`Remove gallery image ${index + 1}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div>
              <input
                ref={galleryInputRef}
                type="file"
                id="gallery-upload"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                aria-label="Upload gallery images"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current.click()}
              >
                <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                Add Gallery Images
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
