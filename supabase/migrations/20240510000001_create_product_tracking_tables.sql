-- Create product tracking tables for recommendations

-- Table for tracking product views
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 1,
  last_viewed TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, product_id)
);

-- Table for tracking user feedback on products
CREATE TABLE IF NOT EXISTS product_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id, product_id)
);

-- Table for orders (simplified for tracking purposes)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  total NUMERIC(10, 2) NOT NULL,
  products JSONB NOT NULL, -- Array of { id, name, price, quantity }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table for product relationships (for recommendation engine)
CREATE TABLE IF NOT EXISTS product_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  strength NUMERIC NOT NULL DEFAULT 0, -- Relationship strength (0-1)
  type TEXT NOT NULL, -- 'similar', 'complementary', 'frequently_bought_together', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(source_product_id, related_product_id, type)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_user_id ON product_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_product_id ON product_feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_source ON product_relationships(source_product_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_related ON product_relationships(related_product_id);
CREATE INDEX IF NOT EXISTS idx_product_relationships_type ON product_relationships(type);

-- Enable Row Level Security (RLS)
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_relationships ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for product_views
CREATE POLICY "Users can view their own product views"
  ON product_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product views"
  ON product_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product views"
  ON product_views FOR UPDATE
  USING (auth.uid() = user_id);

-- Set up RLS policies for product_feedback
CREATE POLICY "Users can view their own product feedback"
  ON product_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view all product feedback"
  ON product_feedback FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own product feedback"
  ON product_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product feedback"
  ON product_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Set up RLS policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Set up RLS policies for product_relationships
CREATE POLICY "Anyone can view product relationships"
  ON product_relationships FOR SELECT
  USING (true);

-- Allow admins to manage all data
CREATE POLICY "Admins can manage all product views"
  ON product_views FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all product feedback"
  ON product_feedback FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all product relationships"
  ON product_relationships FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Service role can manage all data
CREATE POLICY "Service role can manage product views"
  ON product_views FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage product feedback"
  ON product_feedback FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage product relationships"
  ON product_relationships FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role'); 