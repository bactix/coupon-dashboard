# Migration Guide: From Spaghetti to Scalable Architecture

## Overview

The codebase has been refactored to separate UI from business logic into clean architectural layers.

### New Structure:
- **Domain** (`src/domain/`) - Pure business logic
- **Infrastructure** (`src/infrastructure/`) - Data access abstraction
- **Features** (`src/features/*/hooks/`) - React integration
- **Components** (`src/features/*/components/`) - Presentational UI

## What Changed

### Domain Services (NEW)

All business logic moved to services in `src/domain/`:

```
UserService - User creation, renewal, expiry checks
BusinessService - Business model changes, limit validation
CouponService - Coupon usage tracking, status calculation
```

**Benefits**: Testable without React, reusable anywhere

### Repositories (NEW)

Data access abstracted into repositories in `src/infrastructure/`:

```
IUserRepository - Interface for user storage
LocalStorageUserRepository - Current localStorage implementation
```

**Benefits**: Easy to swap localStorage for API/database later

### Manager Hooks (NEW)

New hooks coordinate domain + infrastructure in `src/features/*/hooks/`:

```
useUserManager - Manages users state + operations
useBusinessManager - Manages businesses state + operations  
useCouponManager - Manages coupons state + operations
```

**Benefits**: Simpler page components, clear separation

## Migration Examples

### Example 1: Users Page

#### OLD (Mixed Concerns):
```typescript
// Before: src/features/users/hooks/use-users.ts
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const addUser = useCallback((values: UserFormValues) => {
    const newUser = {
      id: generateId(),
      ...values,
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      expiryDate: new Date(/* +1 year */),  // Business logic here!
    };
    setUsers((prev) => [newUser, ...prev]);  // Direct state mutation
  }, []);

  return { users, addUser, updateUser, deleteUser };
}

// Page component
export default function UsersPage() {
  const { users, addUser, deleteUser } = useUsers();
  // Business logic not visible here
}
```

#### NEW (Separated Concerns):
```typescript
// src/domain/users/user.service.ts
export class UserService {
  createUser(input: CreateUserInput): User {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);
    return {
      id: generateId(),
      ...input,
      createdAt: now.toISOString(),
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
    };
  }
}

// src/features/users/hooks/useUserManager.ts
export function useUserManager() {
  const repository = useUserRepository();
  const service = useMemo(() => new UserService(), []);
  const [users, setUsers] = useState<User[]>([]);

  const addUser = useCallback(async (input: CreateUserInput) => {
    const newUser = service.createUser(input);  // Business logic
    await repository.create(newUser);            // Data access
    setUsers((prev) => [newUser, ...prev]);      // State
  }, [service, repository]);

  return { users, addUser, deleteUser, renewUser };
}

// Page component - cleaner!
export default function UsersPage() {
  const { users, addUser, deleteUser, renewUser } = useUserManager();
  
  return (
    <UserTable 
      users={users}
      onEdit={...}
      onDelete={deleteUser}
      onRenew={renewUser}
    />
  );
}
```

### Example 2: Business Model Validation

#### OLD:
```typescript
// Mixed in form component
if (businessModel === "limited" && !usageLimit) {
  setError("Usage limit required");
}
```

#### NEW:
```typescript
// In domain service
export class BusinessService {
  validateCreateInput(input: CreateBusinessInput) {
    const errors: string[] = [];
    if (input.businessModel === "limited" && !input.usageLimit) {
      errors.push("Usage limit required");
    }
    return { valid: errors.length === 0, errors };
  }
}

// In hook
const validation = service.validateCreateInput(input);
if (!validation.valid) {
  // handle errors
}
```

## Step-by-Step Migration

### Step 1: Update Page Components

**File**: `src/app/dashboard/users/page.tsx`

```typescript
// BEFORE
const { users, addUser, updateUser, deleteUser } = useUsers();

// AFTER  
const { 
  users, 
  addUser, 
  updateUser, 
  deleteUser,
  renewUser,
  initializeUsers 
} = useUserManager();

// Add initialization
useEffect(() => {
  initializeUsers();
}, [initializeUsers]);
```

### Step 2: Update Form Hooks

Old form hooks (`use-user-form.ts`) stay the same - they're still needed for form state.

### Step 3: Keep Components Unchanged

Form and table components don't need changes - they're already presentational!

### Step 4: Delete Old Hooks (After Testing)

Once pages are working with new hooks:
- Delete `src/features/users/hooks/use-users.ts`
- Delete `src/features/businesses/hooks/use-businesses.ts`

## New Features Using This Architecture

### Adding a Feature: Coupons Management

```typescript
// 1. Domain (business logic)
export class CouponService {
  useCoupon(coupon: Coupon): Coupon {
    return {
      ...coupon,
      currentUses: coupon.currentUses + 1,
      status: this.calculateStatus(coupon),
    };
  }
}

// 2. Infrastructure (data access)
export class LocalStorageCouponRepository implements ICouponRepository {
  async useCoupon(id: string): Promise<void> {
    // Update in storage
  }
}

// 3. Hooks (React integration)
export function useCouponManager() {
  const service = useMemo(() => new CouponService(), []);
  // Coordinate service + repository
}

// 4. Components (UI only)
export function CouponTable({ coupons, onUse }) {
  return <table>{/* render */}</table>;
}

// 5. Page (use the hook)
export default function CouponsPage() {
  const { coupons, useCoupon } = useCouponManager();
  return <CouponTable coupons={coupons} onUse={useCoupon} />;
}
```

## Quick Reference

### Where to put what:

| What | Where | Example |
|------|-------|---------|
| User interface | `src/features/*/components/` | `UserTable.tsx` |
| Form validation | `src/lib/schemas.ts` | `userSchema` |
| Form state | `src/features/*/hooks/use-*-form.ts` | `useUserForm.ts` |
| Business logic | `src/domain/*/service.ts` | `UserService` |
| Data access | `src/infrastructure/storage/*.ts` | `UserRepository` |
| State coordination | `src/features/*/hooks/use*Manager.ts` | `useUserManager.ts` |

## Testing Examples

### Test Domain Service (No React)
```typescript
import { UserService } from '@/domain/users';

test('UserService.createUser sets expiry 1 year out', () => {
  const service = new UserService();
  const user = service.createUser({ name: 'John', ... });
  expect(user.expiryDate).toBeDefined();
  // Pure function - no mocking needed!
});
```

### Test Manager Hook (With Mock Repository)
```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserManager } from '@/features/users/hooks';

test('useUserManager.addUser saves to repository', async () => {
  const { result } = renderHook(() => useUserManager());
  
  await act(async () => {
    await result.current.addUser({ name: 'John', ... });
  });
  
  expect(result.current.users).toHaveLength(1);
});
```

## Benefits Summary

✅ **Easier Testing** - Services are pure functions
✅ **Clearer Code** - Business logic separated from UI
✅ **Better Maintainability** - Changes in one layer don't ripple
✅ **Increased Reusability** - Services work in any context
✅ **Future-Proof** - Easy to swap localStorage for API
✅ **Team Scalability** - Parallel feature development
✅ **Onboarding** - New developers understand the structure quickly

## Questions?

Refer to:
- `ARCHITECTURE.md` - Full architectural details
- `REFACTORING_CHECKLIST.md` - Migration progress tracking
- Domain services (`src/domain/*/`) - See examples for each domain
- Manager hooks (`src/features/*/hooks/use*Manager.ts`) - See how to use services
