-- Udaipur Warehouse Hub - Database Schema
-- Run this in Supabase SQL Editor

-- Inquiries from potential renters
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  space_required TEXT,
  duration TEXT,
  purpose TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiating', 'converted', 'rejected')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery images for the warehouse
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Warehouse features/amenities
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings (key-value config)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on inquiries
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can INSERT inquiries (submit form)
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admins) can read/update/delete inquiries
CREATE POLICY "Admins can read inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete inquiries"
  ON inquiries FOR DELETE
  TO authenticated
  USING (true);

-- Gallery images: public read, admin write
CREATE POLICY "Anyone can view gallery"
  ON gallery_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gallery"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true);

-- Features: public read, admin write
CREATE POLICY "Anyone can view features"
  ON features FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage features"
  ON features FOR ALL
  TO authenticated
  USING (true);

-- Site settings: public read, admin write
CREATE POLICY "Anyone can view settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true);

-- Seed default features
INSERT INTO features (title, description, icon, display_order) VALUES
  ('15,000 Sq Ft', 'Grade-A warehouse space with high ceiling clearance and open floor plan', 'Maximize', 1),
  ('NH Golden Quadrilateral', 'Prime location on National Highway at Gukhar Magri, Udaipur', 'MapPin', 2),
  ('24/7 Security', 'Round-the-clock security with CCTV surveillance and guard patrol', 'Shield', 3),
  ('Loading Docks', 'Multiple loading/unloading docks for trucks and heavy vehicles', 'Truck', 4),
  ('Power Backup', 'Uninterrupted power supply with industrial-grade backup generators', 'Zap', 5),
  ('Fire Safety', 'Complete fire safety systems including sprinklers and extinguishers', 'Flame', 6),
  ('Flexible Leasing', 'Short-term and long-term lease options to suit your business needs', 'Calendar', 7),
  ('Easy Access', 'Wide approach road with easy access for heavy commercial vehicles', 'Route', 8);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('warehouse_name', 'Udaipur Warehouse Hub'),
  ('tagline', '15,000 Sq Ft Grade-A Warehouse'),
  ('location', 'Gukhar Magri, NH Golden Quadrilateral, Udaipur, Rajasthan'),
  ('contact_email', 'contact@udaipurwarehousehub.com'),
  ('contact_phone', '+91 XXXXXXXXXX'),
  ('google_maps_embed', ''),
  ('monthly_rate', 'Contact for pricing');
