# Supabase Setup Guide for LactoCare

## Phase 1: Initial Setup

### Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**
4. Fill in:
   - Project name: `lactoare` or `milkbank`
   - Database password: Save this securely!
   - Region: Choose closest to your location
5. Wait 2-3 minutes for creation to complete

### Step 2: Get Your API Keys

1. Go to **Settings → API**
2. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJ0eXAi...` (long string)

These will go in your `supabase-config.js` file.

---

## Phase 2: Create Database Tables

Go to **SQL Editor** in Supabase and run these queries one by one:

### Table 1: Profiles (extends Supabase auth)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL CHECK (user_type IN ('donor', 'staff', 'admin', 'user')),
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Table 2: Donors

```sql
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blood_type TEXT,
  last_donation_date DATE,
  donation_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active donors" ON donors FOR SELECT USING (status = 'active');
CREATE POLICY "Users can read own donor record" ON donors FOR SELECT USING (auth.uid() = user_id);
```

### Table 3: Products/Inventory

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  quantity_in_stock INTEGER DEFAULT 0,
  unit_price DECIMAL(10, 2),
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Only staff can write products" ON products FOR INSERT, UPDATE, DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type IN ('staff', 'admin')));
```

### Table 4: Donations

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE NOT NULL,
  donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount_ml INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read donations" ON donations FOR SELECT USING (true);
CREATE POLICY "Donors can insert own donations" ON donations FOR INSERT
  USING (donor_id IN (SELECT id FROM donors WHERE user_id = auth.uid()));
```

### Table 5: Staff (for managing staff members)

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('center_manager', 'technician', 'admin')),
  center_location TEXT,
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can read staff" ON staff FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
CREATE POLICY "Only admins can manage staff" ON staff FOR INSERT, UPDATE, DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
```

---

## Phase 3: Enable Authentication

1. Go to **Authentication → Settings**
2. Under **Auth Providers**, enable **Email**
3. Configure email templates if needed
4. Note your JWT expiration (usually 1 hour)

---

## Phase 4: Add to Your Project

See `supabase-config.js` and `supabase-client.js` files in this project.
