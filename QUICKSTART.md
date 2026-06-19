# LactoCare + Supabase Integration - Quick Start Guide

## What You'll Have When Done

- User authentication (register, login, logout)
- Multi-role support (donors, staff, admins)
- Database for donors, products, donations, and staff
- Ready-to-use JavaScript functions for all operations

---

## STEP 1: Create Supabase Project (5 minutes)

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **Sign Up** → create account with email
3. Click **New Project**
4. Fill in:
   - Project name: `lactoare`
   - Database password: Create a STRONG password (write it down!)
   - Region: Choose closest region (or US East if unsure)
5. Click **Create new project**
6. **WAIT** - This takes 2-3 minutes. You'll see "Initializing..." then "Initializing schema..."

### 1.2 Get Your API Keys

Once ready, click **Settings** (gear icon) → **API**

You'll see:

- **Project URL**: Looks like `https://xyz123.supabase.co`
- **Anon Key**: Long string starting with `eyJ...`

**Copy both and keep them safe!**

---

## STEP 2: Set Up Database (10 minutes)

Go to **SQL Editor** (left sidebar) and run these 5 queries one by one.

### Query 1: Create Profiles Table

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
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
```

### Query 2: Create Donors Table

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
CREATE POLICY "Users can insert own donor record" ON donors FOR INSERT USING (auth.uid() = user_id);
```

### Query 3: Create Products Table

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

### Query 4: Create Donations Table

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
CREATE POLICY "Donors can read own donations" ON donations FOR SELECT USING (donor_id IN (SELECT id FROM donors WHERE user_id = auth.uid()));
CREATE POLICY "Donors can insert own donations" ON donations FOR INSERT USING (donor_id IN (SELECT id FROM donors WHERE user_id = auth.uid()));
```

### Query 5: Create Staff Table

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

## STEP 3: Add Supabase to Your Project (5 minutes)

### Files You Now Have:

1. `supabase-config.js` - Configuration file
2. `supabase-client.js` - All the functions you need
3. `auth.js` - Login/Register form handlers
4. `SUPABASE_SETUP_GUIDE.md` - Reference guide

### Update `supabase-config.js`

Open [supabase-config.js](supabase-config.js) and replace:

```javascript
PROJECT_URL: "https://YOUR_PROJECT_URL.supabase.co";
ANON_KEY: "YOUR_ANON_KEY_HERE";
```

With your actual values from Step 1.2. Example:

```javascript
PROJECT_URL: "https://abc123xyz.supabase.co";
ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Add Scripts to Your HTML

Add these 3 lines to your `<head>` or before `</body>` in every HTML file that needs authentication:

```html
<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
<script src="supabase-client.js"></script>
<script src="auth.js"></script>
```

**Order matters!** They must be in this order.

---

## STEP 4: Update Your Forms (15 minutes)

### Update `login.html`

Find your login form and update it:

```html
<form onsubmit="handleLogin(event)">
  <div id="login-error" style="display: none;"></div>
  <div id="login-success" style="display: none;"></div>

  <input type="email" id="login-email" placeholder="Email" required />

  <input type="password" id="login-password" placeholder="Password" required />

  <button type="submit">Sign In</button>
</form>

<p>Don't have an account? <a href="register.html">Register here</a></p>
```

### Update `register.html`

Find your registration form and update it:

```html
<form onsubmit="handleRegister(event)">
  <div
    id="register-error"
    style="display: Error! Please try again later;"
  ></div>
  <div
    id="register-success"
    style="display: Your account has been created;"
  ></div>

  <select id="register-user-type" required>
    <option value="">Select account type</option>
    <option value="donor">Donor</option>
    <option value="staff">Staff Member</option>
    <option value="user">Regular User</option>
  </select>

  <input type="email" id="register-email" placeholder="Email" required />

  <input type="text" id="register-full-name" placeholder="Full Name" />

  <input type="tel" id="register-phone" placeholder="Phone Number" />

  <input
    type="password"
    id="register-password"
    placeholder="Password"
    required
  />

  <input
    type="password"
    id="register-password-confirm"
    placeholder="Confirm Password"
    required
  />

  <button type="submit">Create Account</button>
</form>

<p>Already have an account? <a href="login.html">Sign in here</a></p>
```

---

## STEP 5: Test Everything

### Test Registration

1. Open `register.html` in your browser
2. Fill in the form with test data
3. Click "Create Account"
4. You should see a success message
5. Check your Supabase **Authentication → Users** table - you should see the new user!

### Test Login

1. Open `login.html`
2. Use the email/password you just created
3. Click "Sign In"
4. You should be redirected to the appropriate dashboard

### Test Database

1. Go to Supabase → **Table Editor**
2. Click **profiles** - you should see your registered user
3. Click **donors** - test donor creation

---

## Authorization Levels

After logging in, users get different access based on their account type:

| Action             | Donor | Staff | Admin | User |
| ------------------ | ----- | ----- | ----- | ---- |
| View own profile   | ✅    | ✅    | ✅    | ✅   |
| Record donation    | ✅    | ✅    | ✅    | ❌   |
| View inventory     | ✅    | ✅    | ✅    | ✅   |
| Edit inventory     | ❌    | ✅    | ✅    | ❌   |
| Manage staff       | ❌    | ❌    | ✅    | ❌   |
| View all donations | ❌    | ✅    | ✅    | ❌   |

---

## Using Functions in Your Code

### Example: Get Current User

```javascript
const user = await window.supabase.getCurrentUser();
console.log(user.email);
```

### Example: Get All Products

```javascript
const products = await window.supabase.getProducts();
products.forEach((product) => {
  console.log(product.name, product.quantity_in_stock);
});
```

### Example: Record a Donation

```javascript
const result = await window.supabase.recordDonation({
  amount_ml: 450,
  notes: "Routine donation",
});

if (result.success) {
  console.log("Donation recorded:", result.donation);
} else {
  console.error("Error:", result.error);
}
```

See [supabase-client.js](supabase-client.js) for all available functions.

---

## Common Issues & Solutions

### Issue: "Anon Key is undefined"

**Solution:** Make sure `supabase-config.js` is loaded BEFORE `supabase-client.js` in your HTML.

### Issue: "Cannot create user - email already exists"

**Solution:** That email is already registered. Try a different email or reset the database.

### Issue: "Table doesn't exist"

**Solution:** Make sure you ran ALL 5 SQL queries in Step 2. Check **Table Editor** in Supabase.

### Issue: "User can't login"

**Solution:**

1. Check that email exists in Supabase → **Auth → Users**
2. Make sure password is correct
3. Check browser console for error messages

---

## Next Steps

1. ✅ Update your staffdashboard pages to use `getProducts()`, `getAllDonations()`, etc.
2. ✅ Add a user profile page
3. ✅ Implement donor history page using `getUserDonationHistory()`
4. ✅ Add product management for staff using `addProduct()` and `updateProductInventory()`

---

## Need Help?

Check:

- Supabase Docs: https://supabase.com/docs
- Browser console for error messages (Press F12)
- Supabase Dashboard → Logs for database errors
