import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

const SETUP_SQL = `
-- Inquiries from potential renters
CREATE TABLE IF NOT EXISTS inquiries (
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
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Warehouse features/amenities
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings (key-value config)
CREATE TABLE IF NOT EXISTS site_settings (
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

DROP TRIGGER IF EXISTS inquiries_updated_at ON inquiries;
CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit inquiries') THEN
    CREATE POLICY "Anyone can submit inquiries" ON inquiries FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read inquiries') THEN
    CREATE POLICY "Admins can read inquiries" ON inquiries FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update inquiries') THEN
    CREATE POLICY "Admins can update inquiries" ON inquiries FOR UPDATE TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete inquiries') THEN
    CREATE POLICY "Admins can delete inquiries" ON inquiries FOR DELETE TO authenticated USING (true);
  END IF;
END $$;

-- RLS Policies for gallery_images
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view gallery') THEN
    CREATE POLICY "Anyone can view gallery" ON gallery_images FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage gallery') THEN
    CREATE POLICY "Admins can manage gallery" ON gallery_images FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- RLS Policies for features
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view features') THEN
    CREATE POLICY "Anyone can view features" ON features FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage features') THEN
    CREATE POLICY "Admins can manage features" ON features FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- RLS Policies for site_settings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view settings') THEN
    CREATE POLICY "Anyone can view settings" ON site_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage settings') THEN
    CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL TO authenticated USING (true);
  END IF;
END $$;

-- Seed default features (only if empty)
INSERT INTO features (title, description, icon, display_order)
SELECT * FROM (VALUES
  ('15,000 Sq Ft', 'Grade-A warehouse space with high ceiling clearance and open floor plan', 'Maximize', 1),
  ('NH Golden Quadrilateral', 'Prime location on National Highway at Gukhar Magri, Udaipur', 'MapPin', 2),
  ('24/7 Security', 'Round-the-clock security with CCTV surveillance and guard patrol', 'Shield', 3),
  ('Loading Docks', 'Multiple loading/unloading docks for trucks and heavy vehicles', 'Truck', 4),
  ('Power Backup', 'Uninterrupted power supply with industrial-grade backup generators', 'Zap', 5),
  ('Fire Safety', 'Complete fire safety systems including sprinklers and extinguishers', 'Flame', 6),
  ('Flexible Leasing', 'Short-term and long-term lease options to suit your business needs', 'Calendar', 7),
  ('Easy Access', 'Wide approach road with easy access for heavy commercial vehicles', 'Route', 8)
) AS v(title, description, icon, display_order)
WHERE NOT EXISTS (SELECT 1 FROM features LIMIT 1);

-- Seed default site settings (only if empty)
INSERT INTO site_settings (key, value)
SELECT * FROM (VALUES
  ('warehouse_name', 'Udaipur Warehouse Hub'),
  ('tagline', '15,000 Sq Ft Grade-A Warehouse'),
  ('location', 'Gukhar Magri, NH Golden Quadrilateral, Udaipur, Rajasthan'),
  ('contact_email', 'contact@udaipurwarehousehub.com'),
  ('contact_phone', '+91 XXXXXXXXXX'),
  ('google_maps_embed', ''),
  ('monthly_rate', 'Contact for pricing')
) AS v(key, value)
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
`

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-setup-secret')
  if (secret !== 'warehouse-setup-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })

    await client.connect()
    await client.query(SETUP_SQL)
    await client.end()

    return NextResponse.json({ success: true, message: 'Database setup complete — tables, RLS policies, and seed data created' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
