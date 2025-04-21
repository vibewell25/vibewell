import { prisma } from '@/lib/prisma';
import { uploadToS3, getSignedUrl } from '@/lib/aws/s3';
import { v4 as uuidv4 } from 'uuid';

interface BusinessProfileData {
  name: string;
  description: string;
  location: string;
  website: string;
  phone: string;
  logoFile?: File | null;
  bannerImageFile?: File | null;
}

export async function fetchBusinessProfile(userId: string) {
  try {
    const profile = await prisma.businessProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      return null;
    }

    // Generate signed URLs for images if they exist
    let logoUrl = null;
    let bannerImageUrl = null;

    if (profile.logoPath) {
      logoUrl = await getSignedUrl(profile.logoPath);
    }

    if (profile.bannerImagePath) {
      bannerImageUrl = await getSignedUrl(profile.bannerImagePath);
    }

    return {
      ...profile,
      logoUrl,
      bannerImageUrl,
    };
  } catch (error) {
    console.error('Error fetching business profile:', error);
    throw new Error('Failed to fetch business profile');
  }
}

export async function updateBusinessProfile(userId: string, data: BusinessProfileData) {
  try {
    let logoPath = undefined;
    let bannerImagePath = undefined;

    // Upload logo if provided
    if (data.logoFile) {
      const fileName = `business-profiles/${userId}/logo-${uuidv4()}`;
      await uploadToS3(data.logoFile, fileName);
      logoPath = fileName;
    }

    // Upload banner image if provided
    if (data.bannerImageFile) {
      const fileName = `business-profiles/${userId}/banner-${uuidv4()}`;
      await uploadToS3(data.bannerImageFile, fileName);
      bannerImagePath = fileName;
    }

    // Check if profile exists
    const existingProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (existingProfile) {
      // Update existing profile
      return await prisma.businessProfile.update({
        where: {
          userId: userId,
        },
        data: {
          name: data.name,
          description: data.description,
          location: data.location,
          website: data.website,
          phone: data.phone,
          ...(logoPath && { logoPath }),
          ...(bannerImagePath && { bannerImagePath }),
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new profile
      return await prisma.businessProfile.create({
        data: {
          userId: userId,
          name: data.name,
          description: data.description,
          location: data.location,
          website: data.website,
          phone: data.phone,
          ...(logoPath && { logoPath }),
          ...(bannerImagePath && { bannerImagePath }),
        },
      });
    }
  } catch (error) {
    console.error('Error updating business profile:', error);
    throw new Error('Failed to update business profile');
  }
}
