-- Extend product catalog with more categories and additional fields

-- First, alter the type column to allow more product categories
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products ADD CONSTRAINT products_type_check 
  CHECK (type IN ('makeup', 'hairstyle', 'accessory', 'skincare', 'clothing', 'wellness'));

-- Add additional fields for better filtering and search
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS trending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'low_stock', 'out_of_stock', 'pre_order')),
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ar_compatible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS color_variants JSONB,
  ADD COLUMN IF NOT EXISTS size_variants JSONB,
  ADD COLUMN IF NOT EXISTS meta JSONB;

-- Create additional indexes for efficient filtering and search
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(trending);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);

-- Insert sample products in new categories
INSERT INTO products 
  (name, description, type, category, subcategory, tags, price, brand, model_url, image_url, rating, review_count, featured, ar_compatible)
VALUES
  -- Skincare products
  ('Hydrating Face Mask', 'Deep hydration for dry skin', 'skincare', 'Face', 'Masks', ARRAY['hydrating', 'dry skin', 'vegan'], 24.99, 'NaturGlow', '/models/skincare/face-mask.glb', '/images/skincare/face-mask.jpg', 4.7, 145, true, true),
  ('Vitamin C Serum', 'Brightening serum with antioxidants', 'skincare', 'Face', 'Serums', ARRAY['brightening', 'anti-aging', 'vitamin c'], 39.99, 'PureSkin', '/models/skincare/vitamin-c-serum.glb', '/images/skincare/vitamin-c-serum.jpg', 4.9, 287, true, true),
  ('Gentle Exfoliating Scrub', 'Removes dead skin cells without irritation', 'skincare', 'Face', 'Exfoliators', ARRAY['gentle', 'sensitive skin', 'exfoliating'], 18.50, 'DermaCare', '/models/skincare/exfoliating-scrub.glb', '/images/skincare/exfoliating-scrub.jpg', 4.3, 98, false, true),
  
  -- Clothing items
  ('Athleisure Yoga Set', 'Comfortable yoga set for workouts and casual wear', 'clothing', 'Activewear', 'Yoga', ARRAY['comfortable', 'stretchy', 'breathable'], 89.99, 'ZenFit', '/models/clothing/yoga-set.glb', '/images/clothing/yoga-set.jpg', 4.6, 76, true, true),
  ('Casual Linen Dress', 'Light summer dress made from natural linen', 'clothing', 'Dresses', 'Casual', ARRAY['summer', 'linen', 'breathable'], 65.00, 'EcoStyle', '/models/clothing/linen-dress.glb', '/images/clothing/linen-dress.jpg', 4.8, 124, true, true),
  ('Denim Jacket', 'Classic denim jacket with modern details', 'clothing', 'Outerwear', 'Jackets', ARRAY['denim', 'casual', 'versatile'], 79.99, 'UrbanThreads', '/models/clothing/denim-jacket.glb', '/images/clothing/denim-jacket.jpg', 4.5, 58, false, true),
  
  -- Wellness products
  ('Aromatherapy Diffuser', 'Essential oil diffuser with LED lights', 'wellness', 'Home', 'Aromatherapy', ARRAY['relaxing', 'essential oils', 'sleep aid'], 45.99, 'ZenHome', '/models/wellness/diffuser.glb', '/images/wellness/diffuser.jpg', 4.7, 203, true, false),
  ('Yoga Mat', 'Non-slip eco-friendly yoga mat', 'wellness', 'Fitness', 'Yoga', ARRAY['eco-friendly', 'non-slip', 'durable'], 38.50, 'EcoYoga', '/models/wellness/yoga-mat.glb', '/images/wellness/yoga-mat.jpg', 4.4, 176, false, false),
  ('Meditation Cushion', 'Comfortable cushion for meditation practice', 'wellness', 'Mindfulness', 'Meditation', ARRAY['comfortable', 'supportive', 'meditation'], 29.99, 'MindfulSpace', '/models/wellness/meditation-cushion.glb', '/images/wellness/meditation-cushion.jpg', 4.6, 88, false, false),
  
  -- More makeup products
  ('Natural Foundation', 'Buildable coverage with skin-loving ingredients', 'makeup', 'Face', 'Foundation', ARRAY['natural', 'buildable', 'hydrating'], 32.50, 'PureGlow', '/models/makeup/foundation-natural.glb', '/images/makeup/foundation-natural.jpg', 4.8, 312, true, true),
  ('Volumizing Mascara', 'Dramatic volume without clumping', 'makeup', 'Eyes', 'Mascara', ARRAY['volumizing', 'long-lasting', 'smudge-proof'], 22.99, 'LashLuxe', '/models/makeup/volumizing-mascara.glb', '/images/makeup/volumizing-mascara.jpg', 4.7, 245, true, true),
  ('Matte Liquid Lipstick', 'Long-wearing matte finish in vibrant colors', 'makeup', 'Lips', 'Liquid Lipstick', ARRAY['matte', 'long-lasting', 'vegan'], 18.99, 'ColorPop', '/models/makeup/matte-lipstick.glb', '/images/makeup/matte-lipstick.jpg', 4.5, 178, false, true),
  
  -- More hairstyles
  ('Pixie Cut', 'Short, stylish pixie cut', 'hairstyle', 'Short', 'Pixie', ARRAY['short', 'low-maintenance', 'edgy'], 0.00, 'StyleHub', '/models/hairstyle/pixie-cut.glb', '/images/hairstyle/pixie-cut.jpg', 4.4, 67, true, true),
  ('Beach Waves', 'Effortless beach waves for medium to long hair', 'hairstyle', 'Medium', 'Wavy', ARRAY['wavy', 'casual', 'summer'], 0.00, 'StyleHub', '/models/hairstyle/beach-waves.glb', '/images/hairstyle/beach-waves.jpg', 4.9, 203, true, true),
  ('Braided Updo', 'Elegant braided updo for special occasions', 'hairstyle', 'Updo', 'Braided', ARRAY['formal', 'elegant', 'special occasion'], 0.00, 'StyleHub', '/models/hairstyle/braided-updo.glb', '/images/hairstyle/braided-updo.jpg', 4.7, 118, false, true),
  
  -- More accessories
  ('Designer Watch', 'Elegant timepiece for any occasion', 'accessory', 'Watches', 'Luxury', ARRAY['elegant', 'luxury', 'timeless'], 189.99, 'TimeKeeper', '/models/accessory/designer-watch.glb', '/images/accessory/designer-watch.jpg', 4.8, 54, true, true),
  ('Boho Bracelet Set', 'Set of layered boho-style bracelets', 'accessory', 'Jewelry', 'Bracelets', ARRAY['boho', 'layered', 'casual'], 35.99, 'BohoChic', '/models/accessory/boho-bracelets.glb', '/images/accessory/boho-bracelets.jpg', 4.4, 88, false, true),
  ('Wide Brim Hat', 'Stylish sun protection with wide brim', 'accessory', 'Hats', 'Sun Hats', ARRAY['summer', 'sun protection', 'beach'], 49.99, 'SunStyle', '/models/accessory/wide-brim-hat.glb', '/images/accessory/wide-brim-hat.jpg', 4.6, 72, true, true)
ON CONFLICT (id) DO NOTHING;

-- Update existing products with new fields
UPDATE products
SET 
  category = CASE 
    WHEN type = 'makeup' THEN (ARRAY['Face', 'Eyes', 'Lips'])[floor(random() * 3 + 1)]
    WHEN type = 'hairstyle' THEN (ARRAY['Short', 'Medium', 'Long'])[floor(random() * 3 + 1)]
    WHEN type = 'accessory' THEN (ARRAY['Jewelry', 'Eyewear', 'Hair'])[floor(random() * 3 + 1)]
    ELSE category
  END,
  subcategory = CASE
    WHEN type = 'makeup' THEN (ARRAY['Foundation', 'Blush', 'Eyeshadow', 'Lipstick'])[floor(random() * 4 + 1)]
    WHEN type = 'hairstyle' THEN (ARRAY['Straight', 'Wavy', 'Curly'])[floor(random() * 3 + 1)]
    WHEN type = 'accessory' THEN (ARRAY['Necklaces', 'Earrings', 'Sunglasses'])[floor(random() * 3 + 1)]
    ELSE subcategory
  END,
  price = CASE
    WHEN type = 'makeup' THEN floor(random() * (40-10) + 10)::numeric
    WHEN type = 'accessory' THEN floor(random() * (100-25) + 25)::numeric
    ELSE 0
  END,
  brand = CASE
    WHEN type = 'makeup' THEN (ARRAY['GlamCosmetics', 'PureBeauty', 'NaturalGlow'])[floor(random() * 3 + 1)]
    WHEN type = 'hairstyle' THEN 'StyleHub'
    WHEN type = 'accessory' THEN (ARRAY['FashionFit', 'LuxeStyle', 'TrendyAccessories'])[floor(random() * 3 + 1)]
    ELSE brand
  END,
  tags = CASE
    WHEN type = 'makeup' THEN ARRAY[type, 'beauty', 'cosmetics']
    WHEN type = 'hairstyle' THEN ARRAY[type, 'style', 'hair']
    WHEN type = 'accessory' THEN ARRAY[type, 'fashion', 'style']
    ELSE tags
  END,
  review_count = floor(random() * 150 + 10)::int,
  featured = random() < 0.3,
  trending = random() < 0.2,
  ar_compatible = true
WHERE category IS NULL; 