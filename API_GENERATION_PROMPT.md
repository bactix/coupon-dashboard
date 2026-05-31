# API Generation Prompt for Coupon Dashboard

## Project Overview

This is a **Coupon Management Dashboard** built with Next.js that manages three main entities:
1. **Users** - End consumers of coupons
2. **Businesses** - Merchants offering coupons
3. **Coupons** - Promotional codes/discounts

The application currently uses localStorage for persistence. We need to generate a full Node.js/Express backend API that replaces localStorage while maintaining the exact same business logic.

---

## Architecture Principles

This project follows **Domain-Driven Design (DDD)** with 4 layers:

1. **Domain Layer** - Pure business logic (immutable, testable)
2. **Infrastructure Layer** - Data persistence (repositories)
3. **Features/Integration Layer** - React-specific logic
4. **Components Layer** - UI presentation

**For APIs**, this translates to:
- **Controllers/Routes** - REST endpoints (equivalent to React components)
- **Services** - Business logic from domain layer (reused directly)
- **Repositories** - Database access (replaces localStorage)

---

## Data Models & Types

### User
```typescript
interface AppUser {
  id: string;                          // UUID
  name: string;                        // Full name
  email: string;                       // Unique email
  password: string;                    // Hashed (use bcrypt)
  phone: string;                       // Lebanese format: +961 XX XXX XXXX
  status: "active" | "inactive";       // Account status
  createdAt: string;                   // ISO 8601 timestamp
  startDate: string;                   // ISO 8601 timestamp
  expiryDate: string;                  // ISO 8601 timestamp (1 year from creation)
}
```

**Validations:**
- Email must be valid and unique
- Password minimum 8 characters (hash with bcrypt)
- Phone must match Lebanese format: `+961 <digit> <6-9 more digits>`
- Status must be "active" or "inactive"
- expiryDate must be exactly 1 year after createdAt

**Business Rules:**
- Users can renew their subscription (sets new expiryDate to 1 year from renewal date)
- Users can be marked active/inactive
- User expiry is calculated as createdAt + 1 year

---

### Business
```typescript
type BusinessType = "restaurant" | "hotel" | "other";
type BusinessModel = "unlimited" | "limited";
type LebanesCity = "Beirut" | "Tripoli" | "Sidon" | "Tyre" | "Zahle" | 
                   "Jounieh" | "Baalbek" | "Nabatieh" | "Byblos" | 
                   "Aley" | "Chouf" | "Bint Jbeil";

interface Business {
  id: string;                          // UUID
  name: string;                        // Business name
  type: BusinessType;                  // "restaurant" | "hotel" | "other"
  email: string;                       // Unique business email
  password: string;                    // Hashed (use bcrypt)
  phone: string;                       // Lebanese format: +961 XX XXX XXXX
  ownerName: string;                   // Owner's full name
  city: LebanesCity;                   // One of 12 Lebanese cities
  createdAt: string;                   // ISO 8601 timestamp
  businessModel: BusinessModel;        // "unlimited" or "limited"
  usageLimit?: number;                 // Only required if businessModel === "limited"
}
```

**Validations:**
- Email must be valid and unique
- Password minimum 8 characters (hash with bcrypt)
- Phone must match Lebanese format
- businessModel "limited" requires usageLimit (>= 1)
- businessModel "unlimited" should not have usageLimit
- city must be one of 12 allowed Lebanese cities
- type must be one of: "restaurant", "hotel", "other"

**Business Rules:**
- Businesses can have unlimited or limited coupon usage
- Limited businesses track total coupons issued
- Each coupon issued decrements usageLimit (if limited model)

---

### Coupon
```typescript
interface Coupon {
  id: string;                          // UUID
  code: string;                        // Unique code (e.g., "SAVE20")
  businessId: string;                  // Foreign key to Business
  discount: number;                    // Discount percentage (0-100)
  description: string;                 // Coupon description
  expiryDate: string;                  // ISO 8601 timestamp
  maxUsagePerUser: number;             // How many times a user can use it
  totalUsageCount: number;             // Times this coupon was used globally
  createdAt: string;                   // ISO 8601 timestamp
}
```

**Validations:**
- Code must be unique and non-empty
- discount must be 0-100
- expiryDate must be in the future
- maxUsagePerUser must be >= 1
- businessId must reference an existing Business

**Business Rules:**
- A coupon can only be used by active users
- A user can use a coupon up to maxUsagePerUser times
- Cannot use a coupon after its expiryDate
- Each usage increments totalUsageCount
- Businesses with limited model: each coupon issued decrements their usageLimit

---

### Coupon Usage (Transaction)
```typescript
interface CouponUsage {
  id: string;                          // UUID
  couponId: string;                    // Foreign key to Coupon
  userId: string;                      // Foreign key to User
  businessId: string;                  // Foreign key to Business
  usedAt: string;                      // ISO 8601 timestamp
}
```

---

## Authentication

**Type:** JWT (JSON Web Tokens)

**Implementation Requirements:**
1. `/auth/login` endpoint returns JWT token (valid 24 hours)
2. Token contains: `{ sub: userId, email, role: "user" | "business" }`
3. All protected routes require `Authorization: Bearer <token>` header
4. Middleware validates token and attaches user to request
5. Users can only access/modify their own data (except admins)
6. Businesses can only access/modify their own coupons

**Roles:**
- `user` - End consumer (can view/use coupons)
- `business` - Merchant (can create/manage coupons)
- `admin` - Dashboard admin (can manage users & businesses)

---

## API Endpoints

### Authentication

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Users

#### GET `/api/users` ✅ Admin only
Returns all users (paginated).

**Query Params:**
- `page=1` (default)
- `limit=20` (default)
- `status=active` (optional filter)

**Response (200):**
```json
{
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+961 71 123 456",
      "status": "active",
      "createdAt": "2025-05-28T10:00:00Z",
      "startDate": "2025-05-28T10:00:00Z",
      "expiryDate": "2026-05-28T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### GET `/api/users/me` ✅ Authenticated users
Get current user profile.

**Response (200):** User object

#### POST `/api/users` ✅ Public (self-registration)
Create new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "+961 71 123 456",
  "status": "active"
}
```

**Response (201):** User object

**Response (400):** Validation errors
```json
{
  "errors": {
    "email": "Email already exists",
    "phone": "Invalid Lebanese phone number"
  }
}
```

#### PUT `/api/users/:id` ✅ User can edit own, admin can edit any
Update user information.

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "+961 71 987 654",
  "status": "inactive"
}
```

**Response (200):** Updated user object

#### POST `/api/users/:id/renew` ✅ User can renew own, admin can renew any
Renew user subscription (set expiryDate to 1 year from now).

**Response (200):**
```json
{
  "id": "user-123",
  "expiryDate": "2027-05-28T10:00:00Z"
}
```

#### DELETE `/api/users/:id` ✅ Admin only
Delete a user (soft delete: mark as inactive).

**Response (204):** No content

---

### Businesses

#### GET `/api/businesses` ✅ Public
Returns all active businesses (paginated).

**Query Params:**
- `page=1`
- `limit=20`
- `type=restaurant` (optional filter)
- `city=Beirut` (optional filter)

**Response (200):**
```json
{
  "data": [
    {
      "id": "biz-123",
      "name": "Restaurant ABC",
      "type": "restaurant",
      "city": "Beirut",
      "ownerName": "Owner Name",
      "email": "owner@restaurant.com",
      "phone": "+961 71 111 111",
      "businessModel": "limited",
      "usageLimit": 500,
      "createdAt": "2025-05-28T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 150, "pages": 8 }
}
```

#### GET `/api/businesses/:id` ✅ Public
Get business details with coupon count.

**Response (200):**
```json
{
  "id": "biz-123",
  "name": "Restaurant ABC",
  "type": "restaurant",
  "city": "Beirut",
  "ownerName": "Owner Name",
  "businessModel": "limited",
  "usageLimit": 500,
  "couponsCount": 15,
  "totalUsageCount": 342
}
```

#### POST `/api/businesses` ✅ Public (self-registration)
Create new business account.

**Request:**
```json
{
  "name": "Restaurant ABC",
  "type": "restaurant",
  "email": "owner@restaurant.com",
  "password": "securepass123",
  "phone": "+961 71 111 111",
  "ownerName": "Owner Name",
  "city": "Beirut",
  "businessModel": "limited",
  "usageLimit": 500
}
```

**Response (201):** Business object

#### PUT `/api/businesses/:id` ✅ Business can edit own, admin can edit any
Update business information (no email/password changes here).

**Request:**
```json
{
  "name": "Restaurant ABC Updated",
  "type": "hotel",
  "ownerName": "New Owner Name",
  "usageLimit": 1000
}
```

**Response (200):** Updated business object

#### GET `/api/businesses/:id/usage-remaining` ✅ Business owner only
Get remaining usage count for limited businesses.

**Response (200):**
```json
{
  "businessModel": "limited",
  "totalLimit": 500,
  "usedCount": 342,
  "remainingCount": 158
}
```

---

### Coupons

#### GET `/api/coupons` ✅ Public
Get all active coupons (paginated).

**Query Params:**
- `page=1`
- `limit=20`
- `businessId=biz-123` (optional filter)
- `code=SAVE20` (optional filter)

**Response (200):**
```json
{
  "data": [
    {
      "id": "coupon-123",
      "code": "SAVE20",
      "businessId": "biz-123",
      "businessName": "Restaurant ABC",
      "discount": 20,
      "description": "20% off on all items",
      "expiryDate": "2025-12-31T23:59:59Z",
      "maxUsagePerUser": 5,
      "totalUsageCount": 342,
      "createdAt": "2025-05-28T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 2450, "pages": 123 }
}
```

#### GET `/api/coupons/:id` ✅ Public
Get coupon details with usage stats.

**Response (200):** Coupon object (as above)

#### POST `/api/coupons` ✅ Business owner only
Create new coupon.

**Request:**
```json
{
  "code": "SAVE20",
  "discount": 20,
  "description": "20% off on all items",
  "expiryDate": "2025-12-31T23:59:59Z",
  "maxUsagePerUser": 5
}
```

**Response (201):** Coupon object

**Business Rules to Enforce:**
1. If business model is "limited": check if usageLimit allows this coupon
   - Creating a coupon for a limited business decrements their usageLimit
   - e.g., if limit is 500 and they create 1 coupon, remaining is 499
2. Coupon code must be unique
3. expiryDate must be in future
4. discount must be 0-100

#### PUT `/api/coupons/:id` ✅ Business owner only
Update coupon (cannot change discount or code after creation).

**Request:**
```json
{
  "description": "Updated description",
  "expiryDate": "2026-12-31T23:59:59Z",
  "maxUsagePerUser": 10
}
```

**Response (200):** Updated coupon object

#### DELETE `/api/coupons/:id` ✅ Business owner only
Delete coupon (soft delete: mark as inactive).

**Response (204):** No content

#### POST `/api/coupons/:id/use` ✅ Authenticated users only
User uses/redeems a coupon.

**Request:**
```json
{
  "userId": "user-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Coupon used successfully",
  "couponUsage": {
    "id": "usage-456",
    "couponId": "coupon-123",
    "userId": "user-123",
    "businessId": "biz-123",
    "usedAt": "2025-05-28T15:30:45Z"
  }
}
```

**Response (400):** Invalid use
```json
{
  "error": "Coupon usage limit exceeded for this user"
}
```

**Business Rules to Enforce:**
1. User must be active (status === "active")
2. User's expiryDate must be in future
3. Coupon's expiryDate must be in future
4. User hasn't exceeded maxUsagePerUser
5. Create CouponUsage record
6. Increment coupon's totalUsageCount
7. If business is "limited" model: decrement usageLimit and check for 0

#### GET `/api/coupons/:id/usage-stats` ✅ Business owner only
Get usage statistics for a coupon.

**Response (200):**
```json
{
  "couponId": "coupon-123",
  "code": "SAVE20",
  "totalUsageCount": 342,
  "maxUsagePerUser": 5,
  "uniqueUsersCount": 89,
  "usageHistory": [
    {
      "userId": "user-123",
      "userEmail": "user@example.com",
      "usedAt": "2025-05-28T15:30:45Z",
      "usageCount": 3
    }
  ]
}
```

---

## Error Handling

All errors return JSON with consistent format:

```json
{
  "error": "Human-readable error message",
  "statusCode": 400,
  "timestamp": "2025-05-28T10:00:00Z"
}
```

**Status Codes:**
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate email/code)
- `500` - Server error

**Validation Errors:**
```json
{
  "error": "Validation failed",
  "statusCode": 400,
  "errors": {
    "email": "Email already exists",
    "password": "Password must be at least 8 characters",
    "phone": "Invalid Lebanese phone number"
  }
}
```

---

## Database Schema

Create these tables/collections:

### users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  startDate DATETIME NOT NULL,
  expiryDate DATETIME NOT NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_expiryDate (expiryDate)
);
```

### businesses
```sql
CREATE TABLE businesses (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('restaurant', 'hotel', 'other') NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  ownerName VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  businessModel ENUM('unlimited', 'limited') NOT NULL,
  usageLimit INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_type (type),
  INDEX idx_city (city),
  FOREIGN KEY (city) REFERENCES cities(name)
);
```

### coupons
```sql
CREATE TABLE coupons (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  businessId VARCHAR(36) NOT NULL,
  discount INT NOT NULL,
  description TEXT,
  expiryDate DATETIME NOT NULL,
  maxUsagePerUser INT NOT NULL,
  totalUsageCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN DEFAULT TRUE,
  INDEX idx_code (code),
  INDEX idx_businessId (businessId),
  INDEX idx_expiryDate (expiryDate),
  FOREIGN KEY (businessId) REFERENCES businesses(id)
);
```

### coupon_usage
```sql
CREATE TABLE coupon_usage (
  id VARCHAR(36) PRIMARY KEY,
  couponId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  businessId VARCHAR(36) NOT NULL,
  usedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (couponId) REFERENCES coupons(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (businessId) REFERENCES businesses(id),
  INDEX idx_couponId (couponId),
  INDEX idx_userId (userId),
  INDEX idx_businessId (businessId)
);
```

---

## Implementation Stack

- **Framework:** Express.js (Node.js)
- **Database:** PostgreSQL or MySQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Zod (same as frontend)
- **ID Generation:** uuid v4
- **Environment:** Node 18+

---

## Key Requirements

1. **Reuse domain logic:** All business logic from the frontend domain layer should be ported to backend services (same validation rules, same calculations)

2. **Consistent timestamps:** Always use ISO 8601 format for dates (e.g., `2025-05-28T10:00:00Z`)

3. **Authorization:** Implement role-based access control (user, business, admin)

4. **Idempotency:** Coupon usage should be idempotent (using twice with same userId + couponId within short time = same result)

5. **Error messages:** Match the validation errors from Zod schemas exactly

6. **Response format:** Always wrap data in `{ data: ..., pagination: ... }` for list endpoints

7. **Soft deletes:** Users and coupons are marked inactive, not hard deleted

8. **No password in responses:** Never return password field in any response

9. **Hashed passwords:** Always hash passwords before storing (bcrypt with salt rounds = 10)

10. **Pagination:** All list endpoints should support `page` and `limit` query params

---

## Testing Scenarios

When generating, consider these test cases:

1. User creation with validation errors
2. Business with limited model reaching usage limit
3. Coupon usage when user is expired
4. Coupon usage when coupon is expired
5. Authorization: business cannot modify another business's coupons
6. Pagination: requesting page 999 returns empty results
7. Duplicate coupon code returns 409 Conflict
8. User renews subscription: expiryDate updates correctly
9. Usage limit enforcement: limited business cannot exceed usage
10. Soft deletes: deleted items don't appear in lists

---

## Generate Instructions

When you see this prompt, please:

1. **Create a complete Express.js backend** with all endpoints listed above
2. **Implement database layer** with proper migrations/seeds
3. **Add authentication middleware** for JWT validation
4. **Implement all business rules** exactly as specified
5. **Add proper error handling** with consistent error responses
6. **Include input validation** using Zod schemas (reuse from frontend)
7. **Set up environment configuration** (.env.example)
8. **Include database initialization script**
9. **Document setup instructions** (npm install, migrations, etc.)

Do NOT skip any endpoints or business rules. This is a complete backend generation.
