# Refactoring Checklist

This document tracks the refactoring progress from monolithic to scalable architecture.

## ✅ Domain Layer

- [x] Users domain (types + service)
- [x] Businesses domain (types + service)
- [x] Coupons domain (types + service)

## ✅ Infrastructure Layer

- [x] User repository
- [x] Business repository
- [x] Coupon repository

## ✅ Hooks Layer

- [x] useUserRepository + useUserManager
- [x] useBusinessRepository + useBusinessManager
- [x] useCouponRepository + useCouponManager

## 📋 Component Refactoring (Next Steps)

### Users Feature
- [ ] Update `users/page.tsx` to use new hooks
- [ ] Update user form components (already separated, no changes needed)
- [ ] Update user table components (already separated, no changes needed)
- [ ] Delete old `use-users.ts` hook (superseded by useUserManager)

### Businesses Feature
- [ ] Update `businesses/page.tsx` to use new hooks
- [ ] Review business form components
- [ ] Review business table components
- [ ] Delete old `use-businesses.ts` hook (superseded by useBusinessManager)

### Coupons Feature
- [ ] Create coupons page (if missing)
- [ ] Create coupon components
- [ ] Create coupon form components
- [ ] Create coupon table components

## 🔄 Gradual Migration Strategy

### Phase 1: New code only ✅
- [x] Create domain/infrastructure layers
- [x] Create manager hooks
- **Current state**: New features can use this architecture

### Phase 2: Refactor pages (in progress)
- Update page components to use manager hooks
- Keep old hooks alongside temporarily
- Test thoroughly before deletion

### Phase 3: Cleanup
- Remove old hooks (use-users.ts, use-businesses.ts)
- Remove old form logic duplications
- Remove any direct useState/localStorage access from components

## 📝 How to Use the New Architecture

### Example: Users Page

**Before (Old Pattern)**:
```typescript
// page.tsx - Mixed concerns
export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  // useUsers does: state + localStorage + business logic (all mixed)
}
```

**After (New Pattern)**:
```typescript
// page.tsx - Clean separation
export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, renewUser, initializeUsers } 
    = useUserManager();
  
  useEffect(() => {
    initializeUsers();
  }, [initializeUsers]);

  return (
    <UserTable
      users={users}
      onEdit={openEditDialog}
      onDelete={deleteUser}
      onRenew={(user) => renewUser(user.id, newDate)}
    />
  );
}
```

### Benefits
1. `useUserManager` handles all coordination
2. Components just render, don't manage state
3. Business logic (in UserService) is testable independently
4. Repository can be swapped without touching components

## 📊 Comparison

| Aspect | Old Pattern | New Pattern |
|--------|-----------|-----------|
| State Management | Scattered | Centralized in manager hook |
| Business Logic | In components/hooks | In domain services |
| Data Access | Direct localStorage | Through repository |
| Testability | Hard (mixed concerns) | Easy (isolated layers) |
| Reusability | Limited | High (services are pure) |
| Scalability | Low | High |

## 🚀 Next Steps

1. **Update Users Page**: Use `useUserManager` instead of `useUsers`
2. **Update Businesses Page**: Use `useBusinessManager` instead of `useBusinesses`
3. **Create Coupons Page**: Use `useCouponManager` from the start
4. **Remove Old Hooks**: Delete superseded hooks once pages are migrated
5. **Add Tests**: Create `.test.ts` files for services

## 📚 Key Files to Review

- `src/domain/*/` - Business logic (no React)
- `src/infrastructure/storage/` - Data access (swappable)
- `src/features/*/hooks/useXxxManager.ts` - State coordination (React)
- `ARCHITECTURE.md` - Full architectural documentation
