# Supabase Functions Reference

All functions are available via `window.supabase` after including the scripts. They return objects with `{ success: true, data: ... }` or `{ success: false, error: "..." }` format.

---

## Authentication Functions

### signUp(email, password, userData)

Create a new user account.

**Parameters:**

- `email` (string) - User email
- `password` (string) - User password (min 6 chars)
- `userData` (object) - Optional: `{ full_name, phone, user_type }`

**Returns:** `{ success: bool, user: object, profile: object }`

**Example:**

```javascript
const result = await window.supabase.signUp("john@example.com", "password123", {
  full_name: "John Doe",
  phone: "555-1234",
  user_type: "donor",
});

if (result.success) {
  console.log("User created:", result.user.id);
}
```

---

### signIn(email, password)

Sign in an existing user.

**Parameters:**

- `email` (string)
- `password` (string)

**Returns:** `{ success: bool, user: object, session: object }`

**Example:**

```javascript
const result = await window.supabase.signIn("john@example.com", "password123");

if (result.success) {
  console.log("Logged in as:", result.user.email);
} else {
  console.log("Login failed:", result.error);
}
```

---

### signOut()

Sign out the current user.

**Returns:** `{ success: bool }`

**Example:**

```javascript
const result = await window.supabase.signOut();
if (result.success) {
  window.location.href = "index.html";
}
```

---

### getCurrentUser()

Get the currently logged-in user.

**Returns:** User object or `null`

**Example:**

```javascript
const user = await window.supabase.getCurrentUser();
if (user) {
  console.log("Logged in as:", user.email);
} else {
  console.log("Not logged in");
}
```

---

### getUserProfile()

Get current user's profile information (full_name, phone, user_type, etc).

**Returns:** Profile object or `null`

**Example:**

```javascript
const profile = await window.supabase.getUserProfile();
console.log("Name:", profile.full_name);
console.log("Type:", profile.user_type);
```

---

### updateUserProfile(updates)

Update current user's profile.

**Parameters:**

- `updates` (object) - Fields to update: `{ full_name, phone, ... }`

**Returns:** `{ success: bool, profile: object }`

**Example:**

```javascript
const result = await window.supabase.updateUserProfile({
  full_name: "Jane Doe",
  phone: "555-9999",
});

if (result.success) {
  console.log("Profile updated");
}
```

---

## Donor Functions

### createDonorProfile(donorData)

Create a donor profile for the current user.

**Parameters:**

- `donorData` (object) - Optional: `{ blood_type, status }`

**Returns:** `{ success: bool, donor: object }`

**Example:**

```javascript
const result = await window.supabase.createDonorProfile({
  blood_type: "O+",
  status: "active",
});

if (result.success) {
  console.log("Donor profile created:", result.donor.id);
}
```

---

### getActiveDonors()

Get all active donors (public data).

**Returns:** Array of donor objects

**Example:**

```javascript
const donors = await window.supabase.getActiveDonors();
donors.forEach((donor) => {
  console.log(`${donor.profiles.full_name} - ${donor.blood_type}`);
});
```

---

### getCurrentUserDonor()

Get current user's donor profile (if they are a donor).

**Returns:** Donor object or `null`

**Example:**

```javascript
const donor = await window.supabase.getCurrentUserDonor();
if (donor) {
  console.log("Blood type:", donor.blood_type);
  console.log("Donations:", donor.donation_count);
} else {
  console.log("User is not a donor");
}
```

---

## Product/Inventory Functions

### getProducts(category)

Get all products, optionally filtered by category.

**Parameters:**

- `category` (string, optional) - Filter by category

**Returns:** Array of product objects

**Example:**

```javascript
// Get all products
const allProducts = await window.supabase.getProducts();

// Get products in a specific category
const supplements = await window.supabase.getProducts("supplements");

allProducts.forEach((product) => {
  console.log(`${product.name}: ${product.quantity_in_stock} in stock`);
});
```

---

### getProduct(productId)

Get a single product by ID.

**Parameters:**

- `productId` (string) - UUID of product

**Returns:** Product object or `null`

**Example:**

```javascript
const product = await window.supabase.getProduct(
  "550e8400-e29b-41d4-a716-446655440000",
);
console.log(product.name, "$" + product.unit_price);
```

---

### addProduct(productData)

Add a new product (staff/admin only).

**Parameters:**

- `productData` (object) - Must include: `{ name, sku, ... }`
  - `name` (string) - Product name
  - `sku` (string) - Stock keeping unit (unique)
  - `description` (string, optional)
  - `quantity_in_stock` (number, optional)
  - `unit_price` (number, optional)
  - `category` (string, optional)

**Returns:** `{ success: bool, product: object }`

**Example:**

```javascript
const result = await window.supabase.addProduct({
  name: "Breast Pump",
  sku: "BP-001",
  description: "Electric breast pump",
  quantity_in_stock: 5,
  unit_price: 89.99,
  category: "equipment",
});

if (result.success) {
  console.log("Product added:", result.product.id);
}
```

---

### updateProductInventory(productId, newQuantity)

Update product inventory count.

**Parameters:**

- `productId` (string)
- `newQuantity` (number)

**Returns:** `{ success: bool, product: object }`

**Example:**

```javascript
const result = await window.supabase.updateProductInventory(
  "550e8400-e29b-41d4-a716-446655440000",
  3,
);

if (result.success) {
  console.log("Inventory updated");
}
```

---

## Donation Functions

### recordDonation(donationData)

Record a new donation for the current user (must be a donor).

**Parameters:**

- `donationData` (object) - Optional: `{ amount_ml, notes, status }`

**Returns:** `{ success: bool, donation: object }`

**Example:**

```javascript
const result = await window.supabase.recordDonation({
  amount_ml: 450,
  notes: "Regular donation",
  status: "pending", // or 'approved', 'rejected'
});

if (result.success) {
  console.log("Donation recorded on:", result.donation.donation_date);
}
```

---

### getUserDonationHistory()

Get the current user's donation history (donors only).

**Returns:** Array of donation objects, sorted newest first

**Example:**

```javascript
const donations = await window.supabase.getUserDonationHistory();
console.log(`Total donations: ${donations.length}`);

donations.forEach((donation) => {
  console.log(
    `${donation.donation_date}: ${donation.amount_ml}ml - ${donation.status}`,
  );
});
```

---

### getAllDonations()

Get all donations in the system (admin/staff only).

**Returns:** Array of all donation objects

**Example:**

```javascript
const allDonations = await window.supabase.getAllDonations();
allDonations.forEach((donation) => {
  console.log(`Donor: ${donation.donors.profile.full_name}`);
  console.log(`Amount: ${donation.amount_ml}ml`);
  console.log(`Status: ${donation.status}`);
});
```

---

## Staff Functions

### getAllStaff()

Get all staff members (admin only).

**Returns:** Array of staff objects

**Example:**

```javascript
const staff = await window.supabase.getAllStaff();
staff.forEach((member) => {
  console.log(`${member.profiles.full_name} - ${member.role}`);
  console.log(`Location: ${member.center_location}`);
});
```

---

## Utility Functions (in auth.js)

### requireAuth(redirectUrl)

Redirect to login page if user is not logged in.

**Parameters:**

- `redirectUrl` (string, optional) - Where to redirect if not auth. Default: 'login.html'

**Example:**

```javascript
// At the top of staff.html
await requireAuth("login.html");
// If user is not logged in, they'll be redirected to login.html
```

---

### updateAuthUI()

Update UI elements based on authentication status.

Shows/hides elements with `data-auth="guest"` (not logged in) or `data-auth="protected"` (logged in).

**Example in HTML:**

```html
<li data-auth="guest"><a href="login.html">Sign In</a></li>
<li data-auth="protected" style="display: none;">
  <a href="#" onclick="handleLogout()">Logout</a>
</li>
```

---

### handleLogout()

Sign out the current user.

**Example in HTML:**

```html
<button onclick="handleLogout()">Logout</button>
```

---

## Error Handling

All functions return an object. Check `success` and `error`:

```javascript
const result = await window.supabase.signIn(email, password);

if (result.success) {
  // Do something with result.user, result.session, etc
} else {
  // Handle error
  console.error("Error:", result.error);
}
```

Common errors:

- "Invalid login credentials" - Wrong email or password
- "User already registered" - Email already exists
- "No user logged in" - Requires authentication
- "User is not a registered donor" - Must create donor profile first

---

## Database Schema Reference

### profiles table

- `id` (UUID, Primary Key)
- `user_type` (TEXT) - 'donor', 'staff', 'admin', or 'user'
- `full_name` (TEXT)
- `email` (TEXT, Unique)
- `phone` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### donors table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles.id)
- `blood_type` (TEXT)
- `last_donation_date` (DATE)
- `donation_count` (INTEGER)
- `status` (TEXT) - 'active', 'inactive', or 'suspended'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### products table

- `id` (UUID, Primary Key)
- `name` (TEXT)
- `description` (TEXT)
- `sku` (TEXT, Unique)
- `quantity_in_stock` (INTEGER)
- `unit_price` (DECIMAL)
- `category` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### donations table

- `id` (UUID, Primary Key)
- `donor_id` (UUID, Foreign Key → donors.id)
- `donation_date` (TIMESTAMP)
- `amount_ml` (INTEGER)
- `status` (TEXT) - 'pending', 'approved', or 'rejected'
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### staff table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles.id)
- `role` (TEXT) - 'center_manager', 'technician', or 'admin'
- `center_location` (TEXT)
- `hire_date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
