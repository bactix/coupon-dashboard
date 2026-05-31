# API Integration Summary

## Overview
Successfully integrated the frontend with the external API backend. Replaced all localStorage-based data access with real HTTP API calls while maintaining the 4-layer architecture.

## Files Created

### Core API Infrastructure
1. **`src/lib/api-client.ts`** - Central API fetch wrapper
   - Reads `NEXT_PUBLIC_API_URL` from environment
   - Attaches JWT token to Authorization header
   - Throws `ApiError` on non-2xx responses
   - Exports token helpers: `getToken()`, `setToken()`, `clearToken()`

### API Repository Implementations
2. **`src/infrastructure/api/user.repository.ts`** - `ApiUserRepository`
   - Implements `IUserRepository` interface
   - Maps methods to REST endpoints:
     - `getAll()` → GET `/api/dashboard/users`
     - `getById(id)` → GET `/api/dashboard/users/:id`
     - `create(user)` → POST `/api/dashboard/users`
     - `update(id, data)` → PUT `/api/dashboard/users/:id`
     - `delete(id)` → DELETE `/api/dashboard/users/:id`
     - `renew(id)` → POST `/api/dashboard/users/:id/renew`

3. **`src/infrastructure/api/business.repository.ts`** - `ApiBusinessRepository`
   - Same pattern as user repository
   - All CRUD operations mapped to REST endpoints

4. **`src/infrastructure/api/coupon.repository.ts`** - `ApiCouponRepository`
   - Implements `ICouponRepository` interface
   - Extra method: `use(id)` → POST `/api/dashboard/coupons/:id/use`
   - Filters by businessId in `getByBusinessId()`

5. **`src/infrastructure/api/index.ts`** - Barrel export

6. **`src/types/coupon.ts`** - Coupon type definition
   - `code`, `discount` (0-100), `description`, `expiryDate`
   - `maxUsagePerUser`, `totalUsageCount`

7. **`src/components/ui/textarea.tsx`** - Textarea UI component

8. **`.env.local`** - Environment configuration
   - `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Files Modified

### Authentication
- **`src/lib/auth.ts`** - Removed `verifyCredentials`, kept session storage helpers
- **`src/hooks/use-auth.ts`** - Made `login()` async, added `type` parameter, calls `POST /api/dashboard/auth`
- **`src/lib/schemas.ts`** - Added `type` field to `loginSchema`
- **`src/components/auth/login-form.tsx`** - Added type selector (User/Business), properly awaits login

### Repository Hooks
- **`src/features/users/hooks/useUserRepository.ts`** - Swapped `LocalStorageUserRepository` → `ApiUserRepository`
- **`src/features/businesses/hooks/useBusinessRepository.ts`** - Swapped `LocalStorageBusinessRepository` → `ApiBusinessRepository`
- **`src/features/coupons/hooks/useCouponRepository.ts`** - Swapped `LocalStorageCouponRepository` → `ApiCouponRepository`

### Manager Hooks
- **`src/features/users/hooks/useUserManager.ts`** - Updated `renewUser()` to call API `renew()` method
- **`src/features/coupons/hooks/useCouponManager.ts`** - Added `useCoupon()` method for POST coupon use endpoint

### Business Logic
- **`src/domain/coupons/coupon.types.ts`** - Updated to match API spec
  - Changed from `type/value` to `discount` percentage
  - Removed `status` field (computed from expiryDate)
  - Added `maxUsagePerUser` and `totalUsageCount`

- **`src/domain/coupons/coupon.service.ts`** - Updated validation and creation

### Pages & Components
- **`src/app/dashboard/coupons/page.tsx`** - Complete rewrite
  - Uses `useCouponManager` instead of `useLocalStorage`
  - Updated form to include `description` and `maxUsagePerUser`
  - Properly calls API methods for CRUD and coupon usage

- **`src/features/users/components/user-renewal-dialog.tsx`** - Updated to auto-calculate 1-year renewal
- **`src/app/dashboard/users/page.tsx`** - Updated `handleRenewal()` to call without date parameter

- **`src/features/account/hooks/use-account.ts`** - Replaced localStorage updates with API calls
  - Detects user type via `"startDate" in currentUser`
  - Calls PUT `/api/dashboard/users/:id` or `/api/dashboard/businesses/:id`

- **`src/infrastructure/index.ts`** - Exports both localStorage (deprecated) and API repositories

## Architecture Changes

### Before (localStorage)
```
Page Component
  ↓
Manager Hook (useUserManager)
  ├→ Domain Service (UserService)
  └→ LocalStorageRepository
     └→ localStorage.getItem/setItem
```

### After (API)
```
Page Component
  ↓
Manager Hook (useUserManager)
  ├→ Domain Service (UserService)
  └→ ApiRepository
     └→ apiRequest()
        └→ fetch + JWT header → Backend API
```

## Key Features

✅ **JWT Authentication**
- Login returns JWT token
- Token auto-attached to all subsequent requests
- Token cleared on logout

✅ **Type Safety**
- TypeScript interfaces match API contracts
- Zod schemas for validation

✅ **Error Handling**
- `ApiError` class with statusCode and body
- Consistent error response format

✅ **Role-Based Access**
- Login with account type (user/business)
- Account operations detect user type automatically

✅ **Pagination Ready**
- Repository methods support list endpoints
- Page components can add pagination later

## Testing Checklist

Before using in production, verify:

1. ✅ Backend is running at `http://localhost:4000`
2. ✅ Login form shows type selector
3. ✅ Login calls `POST /api/dashboard/auth` (check Network tab)
4. ✅ JWT token stored in `localStorage["auth-token"]`
5. ✅ User stored in `localStorage["currentUser"]`
6. ✅ `/dashboard/users` loads users via `GET /api/dashboard/users`
7. ✅ Create/Edit/Delete users triggers API calls
8. ✅ Renew subscription calls `POST /api/dashboard/users/:id/renew`
9. ✅ Same for businesses CRUD
10. ✅ Coupons page uses manager hook (not useLocalStorage)
11. ✅ Coupon form includes description and maxUsagePerUser fields
12. ✅ Logout clears both token and user from localStorage

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Notes

- All domain services remain pure (no React, no I/O)
- All repositories implement the same interface pattern
- Components remain presentational (data as props)
- Error handling follows consistent pattern
- No localStorage is used for data (only auth token/user cache)
