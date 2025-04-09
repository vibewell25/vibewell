-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure a user can only get a specific badge once
  UNIQUE (user_id, badge_id)
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure a user can only have one entry per achievement type
  UNIQUE (user_id, type)
);

-- Create products table if it doesn't exist yet (for recommendations)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('makeup', 'hairstyle', 'accessory')),
  model_url TEXT,
  image_url TEXT,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(type);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Set up Row Level Security policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own badges
CREATE POLICY "Users can read their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to read their own points
CREATE POLICY "Users can read their own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to read their own achievements
CREATE POLICY "Users can read their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anyone to read products
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  USING (true);

-- Allow service role to insert and update badges
CREATE POLICY "Service role can manage badges"
  ON user_badges FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to insert and update points
CREATE POLICY "Service role can manage points"
  ON user_points FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to insert and update achievements
CREATE POLICY "Service role can manage achievements"
  ON user_achievements FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow service role to manage products
CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow admins to read all engagement data
CREATE POLICY "Admins can read all badges"
  ON user_badges FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can read all points"
  ON user_points FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can read all achievements"
  ON user_achievements FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Insert sample products for testing
INSERT INTO products (name, description, type, model_url, image_url, rating)
VALUES
  ('Natural Blush', 'Subtle pink blush for everyday wear', 'makeup', '/models/makeup/blush.glb', '/images/makeup/blush.jpg', 4.5),
  ('Bold Red Lipstick', 'Vibrant red lipstick for a statement look', 'makeup', '/models/makeup/lipstick-red.glb', '/images/makeup/lipstick-red.jpg', 4.8),
  ('Smokey Eye Shadow', 'Dark eye shadow for evening looks', 'makeup', '/models/makeup/eyeshadow-smokey.glb', '/images/makeup/eyeshadow-smokey.jpg', 4.3),
  ('Wavy Long Hair', 'Elegant wavy hairstyle for long hair', 'hairstyle', '/models/hairstyle/wavy-long.glb', '/images/hairstyle/wavy-long.jpg', 4.7),
  ('Short Bob Cut', 'Modern bob cut for a professional look', 'hairstyle', '/models/hairstyle/bob-cut.glb', '/images/hairstyle/bob-cut.jpg', 4.6),
  ('Curly Style', 'Natural curly hairstyle', 'hairstyle', '/models/hairstyle/curly.glb', '/images/hairstyle/curly.jpg', 4.4),
  ('Classic Sunglasses', 'Timeless design for any occasion', 'accessory', '/models/accessory/sunglasses-classic.glb', '/images/accessory/sunglasses-classic.jpg', 4.2),
  ('Statement Earrings', 'Bold earrings to elevate your look', 'accessory', '/models/accessory/earrings-statement.glb', '/images/accessory/earrings-statement.jpg', 4.5),
  ('Minimalist Necklace', 'Simple elegant necklace for everyday wear', 'accessory', '/models/accessory/necklace-minimalist.glb', '/images/accessory/necklace-minimalist.jpg', 4.6)
ON CONFLICT (id) DO NOTHING; 