'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PhotoFormProps } from '@/components/business/business-profile-wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, ImagePlus, Info } from 'lucide-react';

export function PhotoUploadForm({ form }: PhotoFormProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get existing business photos from form or initialize an empty array
  const businessPhotos = form.watch('businessPhotos') || [];

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const newFiles = Array.from(event.target.files);
    setSelectedImages(prev => [...prev, ...newFiles]);
    
    // Create object URLs for previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };
  
  // Handle file removal from preview
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  // Handle image upload
  const handleUpload = async () => {
    if (selectedImages.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // In a real implementation, you would upload the images to your storage service
      // and receive back URLs that you would save to the form
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For the demo, we'll just use the preview URLs
      const uploadedImageUrls = [...previews];
      
      // Update form with new images
      form.setValue('businessPhotos', [...businessPhotos, ...uploadedImageUrls], { 
        shouldValidate: true,
        shouldDirty: true 
      });
      
      // Clear selected images after successful upload
      setSelectedImages([]);
      setPreviews([]);
      
      alert("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("There was an error uploading your images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle image deletion
  const handleDeleteSavedImage = (index: number) => {
    const updatedPhotos = [...businessPhotos];
    updatedPhotos.splice(index, 1);
    
    form.setValue('businessPhotos', updatedPhotos, {
      shouldValidate: true,
      shouldDirty: true
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Camera className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Business Photos</h2>
      </div>
      
      {/* Photo Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>
            Add photos of your business, services, and work to showcase your expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg border border-dashed border-muted-foreground/50">
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your photos here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
              </p>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="max-w-xs"
              />
            </div>
          </div>
          
          {/* Photo Guidelines */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Photo Guidelines</h4>
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  <li>Include high-quality photos of your business space</li>
                  <li>Showcase your best work samples</li>
                  <li>Add images that highlight your unique services or offerings</li>
                  <li>Avoid stock photos - customers prefer authentic images</li>
                  <li>Ensure you have permission to use all images</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Selected Image Previews */}
          {previews.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Selected Photos ({previews.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-md overflow-hidden border">
                      <Image 
                        src={preview}
                        alt={`Selected image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button 
                onClick={handleUpload}
                disabled={isUploading || previews.length === 0}
                className="mt-4"
              >
                {isUploading ? 'Uploading...' : 'Upload Selected Photos'}
              </Button>
            </div>
          )}
          
          {/* Saved Business Photos */}
          {businessPhotos.length > 0 && (
            <div className="space-y-4 mt-8">
              <h4 className="text-sm font-medium">Saved Business Photos ({businessPhotos.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {businessPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square relative rounded-md overflow-hidden border">
                      <Image 
                        src={photo}
                        alt={`Business photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="absolute bottom-2 left-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          type="button"
                          aria-label="View image"
                        >
                          <ImagePlus className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Business Photo</DialogTitle>
                          <DialogDescription>
                            Uploaded photo for your business profile
                          </DialogDescription>
                        </DialogHeader>
                        <div className="relative w-full h-[50vh]">
                          <Image 
                            src={photo}
                            alt={`Business photo ${index + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button
                      onClick={() => handleDeleteSavedImage(index)}
                      className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      type="button"
                      aria-label="Delete image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 