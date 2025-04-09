import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ShareData {
  email: string;
  imageData: string;
  type: 'makeup' | 'hairstyle' | 'accessory';
  userId?: string;
}

export class SharingService {
  static async shareImage(data: ShareData): Promise<{ success: boolean; shareId?: string; error?: string }> {
    try {
      // Generate a unique ID for the share
      const shareId = uuidv4();
      
      // Upload image to Supabase Storage
      const imageBuffer = Buffer.from(data.imageData.split(',')[1], 'base64');
      const { error: uploadError } = await supabase.storage
        .from('shared-images')
        .upload(`${shareId}.png`, imageBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Create share record in database
      const { error: dbError } = await supabase
        .from('shares')
        .insert({
          id: shareId,
          user_id: data.userId,
          email: data.email,
          type: data.type,
          image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/shared-images/${shareId}.png`,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      return { success: true, shareId };
    } catch (error) {
      console.error('Error sharing image:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to share image' 
      };
    }
  }

  static async getShare(shareId: string) {
    try {
      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('id', shareId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting share:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get share' 
      };
    }
  }
} 