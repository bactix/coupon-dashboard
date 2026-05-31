# Scalable Architecture Guide

This document outlines the refactored architecture separating UI from business logic.

## Directory Structure

```
src/
├── domain/                    # Pure Business Logic (No React)
│   ├── users/
│   │   ├── user.types.ts     # TypeScript interfaces
│   │   ├── user.service.ts   # Business logic
│   │   └── index.ts
│   ├── businesses/
│   │   ├── business.types.ts
│   │   ├── business.service.ts
│   │   └── index.ts
│   ├── coupons/
│   │   ├── coupon.types.ts
│   │   ├── coupon.service.ts
│   │   └── index.ts
│   └── index.ts
│
├── infrastructure/            # Data Access Layer
│   ├── storage/
│   │   ├── user.repository.ts
│   │   ├── business.repository.ts
│   │   ├── coupon.repository.ts
│   │   └── [index.ts]
│   └── index.ts
│
├── features/                  # Feature Modules (React Integration)
│   ├── users/
│   │   ├── hooks/
│   │   │   ├── useUserRepository.ts    # Repository provider
│   │   │   ├── useUserManager.ts       # State + operations
│   │   │   ├── use-user-form.ts        # Form-specific logic
│   │   │   └── index.ts
│   │   └── components/                 # Presentational components
│   │
│   ├── businesses/
│   │   ├── hooks/
│   │   │   ├── useBusinessRepository.ts
│   │   │   ├── useBusinessManager.ts
│   │   │   ├── use-business-form.ts
│   │   │   └── index.ts
│   │   └── components/
│   │
│   └── coupons/
│       ├── hooks/
│       │   ├── useCouponRepository.ts
│       │   ├── useCouponManager.ts
│       │   └── index.ts
│       └── components/
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)

**Purpose**: Pure business logic, independent of any framework or UI concerns.

**Contains**:
- **Types** (`*.types.ts`): TypeScript interfaces defining domain entities
- **Services** (`*.service.ts`): Business logic for creating, updating, validating entities

**Key Principles**:
- ✅ No React imports
- ✅ No framework dependencies
- ✅ Easily testable
- ✅ Reusable across different contexts

**Example - UserService**:
```typescript
// user.service.ts
export class UserService {
  createUser(input: CreateUserInput): User {
    // Pure business logic
    // No hooks, no localStorage, no React
  }

  renewUser(user: User, newExpiryDate: string): User {
    // Validates business rules, returns new object
  }

  isExpired(user: User): boolean {
    // Pure calculation
  }
}
```

### 2. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Abstracts data storage (localStorage, API, database).

**Contains**:
- **Repositories** (`*.repository.ts`): Interfaces + implementations for data access

**Key Principles**:
- ✅ Implements repository pattern
- ✅ Swappable implementations (localStorage → API → Database)
- ✅ Single responsibility: CRUD operations

**Example - UserRepository**:
```typescript
// Abstraction
interface IUserRepository {
  getAll(): Promise<User[]>;
  create(user: User): Promise<void>;
  update(id: string, user: User): Promise<void>;
}

// Implementation
class LocalStorageUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    // Concrete localStorage logic
  }
}

// Future: Can swap to API easily
class ApiUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    return fetch('/api/users').then(r => r.json());
  }
}
```

### 3. Feature/Hooks Layer (`src/features/*/hooks/`)

**Purpose**: React integration layer - bridges domain logic and UI components.

**Contains**:
- **Repository Hooks** (`useXxxRepository.ts`): Provides repository instance
- **Manager Hooks** (`useXxxManager.ts`): Manages state + orchestrates service + repository
- **Form Hooks** (`use-xxx-form.ts`): Form-specific state management

**Key Principles**:
- ✅ Only layer that uses React hooks
- ✅ Coordinates domain logic with state
- ✅ Handles side effects (async operations)

**Example - useUserManager Hook**:
```typescript
// useUserManager.ts
export function useUserManager() {
  const repository = useUserRepository();  // Data access
  const service = useMemo(() => new UserService(), []);  // Business logic

  const [users, setUsers] = useState<User[]>([]);

  // Coordinates service + repository + state
  const addUser = useCallback(async (input: CreateUserInput) => {
    const newUser = service.createUser(input);
    await repository.create(newUser);
    setUsers(prev => [newUser, ...prev]);
  }, [service, repository]);

  return { users, addUser, deleteUser, renewUser };
}
```

### 4. Component Layer (`src/features/*/components/`)

**Purpose**: Presentational components - receive data and callbacks as props.

**Characteristics**:
- ✅ Pure UI components
- ✅ Accept data via props
- ✅ Call callbacks for actions
- ✅ No direct service/repository access
- ✅ Easily testable without mocking complex dependencies

**Example - Presentational Component**:
```typescript
// UserTable.tsx
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onRenew: (user: User) => void;
}

export function UserTable({ users, onEdit, onDelete, onRenew }: UserTableProps) {
  return (
    <table>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <button onClick={() => onEdit(user)}>Edit</button>
        </tr>
      ))}
    </table>
  );
}
```

## Usage Pattern

### In a Page/Container Component

```typescript
"use client";

import { useUserManager } from "@/features/users/hooks";
import { UserTable } from "@/features/users/components";

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser, renewUser } = useUserManager();

  // Initialize on mount
  useEffect(() => {
    const loadUsers = async () => {
      const data = await someRepository.getAll();
      setUsers(data);
    };
    loadUsers();
  }, []);

  return (
    <UserTable
      users={users}
      onEdit={(user) => /* handle edit */}
      onDelete={(id) => deleteUser(id)}
      onRenew={(user) => renewUser(user.id, newDate)}
    />
  );
}
```

## Benefits of This Architecture

### ✅ Separation of Concerns
- Business logic ≠ Data access ≠ React integration ≠ UI

### ✅ Testability
- Domain services are pure functions - no mocking needed
- Repositories can be mocked easily via interfaces
- Components can be tested without actual data loading

### ✅ Reusability
- Same service/repository can be used in:
  - React components
  - CLI scripts
  - Node.js backend
  - Unit tests

### ✅ Maintainability
- Clear folder structure reflects architectural layers
- Easy to find where to add new logic
- Changes to localStorage don't affect business logic

### ✅ Scalability
- Easy to add new domains (just create new service + repository)
- Easy to swap implementations (localStorage → API → Database)
- Parallel feature development without conflicts

### ✅ Testing
```typescript
// Test service in isolation
test('UserService.createUser should set expiry 1 year from now', () => {
  const service = new UserService();
  const user = service.createUser(testInput);
  expect(user.expiryDate).toBeDefined();
});

// Test with mock repository
test('useUserManager.addUser should save to repository', async () => {
  const mockRepo = {
    create: jest.fn()
  };
  // Pass mock repo, assert it was called
});
```

## Migration Guide

### Old Pattern (Before)
```
Page Component
  ↓ (directly manages state)
  ↓ (directly calls localStorage)
  ↓ (mixed business logic + UI)
```

### New Pattern (After)
```
Page Component
  ↓ (uses hook)
Manager Hook (useUserManager)
  ↓ (orchestrates)
  ├→ Domain Service (UserService)
  │  ├→ Business logic
  │  └→ Validation
  │
  └→ Repository (IUserRepository)
     └→ Data access (localStorage/API/DB)
```

## Future Enhancements

1. **API Integration**: Swap `LocalStorageRepository` → `ApiRepository`
   ```typescript
   class ApiUserRepository implements IUserRepository {
     async getAll() {
       return fetch('/api/users').then(r => r.json());
     }
   }
   ```

2. **Error Handling**: Add domain errors
   ```typescript
   class DomainError extends Error {}
   class ValidationError extends DomainError {}
   ```

3. **Unit Tests**: Add tests for all services
   ```typescript
   // user.service.test.ts
   describe('UserService', () => {
     it('should create user with correct dates', () => { ... });
   });
   ```

4. **Caching/Optimization**: Add to hooks layer
5. **Logging/Monitoring**: Add to repository/service layers
