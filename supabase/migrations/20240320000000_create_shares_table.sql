-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('makeup', 'hairstyle', 'accessory')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read shares
CREATE POLICY "Shares are viewable by everyone"
  ON shares FOR SELECT
  USING (true);

-- Allow authenticated users to create shares
CREATE POLICY "Users can create shares"
  ON shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for shared images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-images', 'shared-images', true);

-- Create storage policies
CREATE POLICY "Shared images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shared-images');

CREATE POLICY "Authenticated users can upload shared images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shared-images');

CREATE POLICY "Users can update their own shared images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'shared-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own shared images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'shared-images' AND auth.uid()::text = (storage.foldername(name))[1]); 