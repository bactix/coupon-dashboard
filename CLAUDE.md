@AGENTS.md

# Architecture Standard

## This Project Uses Scalable, Domain-Driven Architecture

**Every new feature automatically follows this 4-layer pattern** (no exceptions):

### The 4-Layer Pattern

```
1. Domain Layer (Business Logic)
   └─ src/domain/{feature}/{feature}.service.ts
   └─ src/domain/{feature}/{feature}.types.ts

2. Infrastructure Layer (Data Access)
   └─ src/infrastructure/storage/{feature}.repository.ts

3. Features/Hooks Layer (React Integration)
   └─ src/features/{feature}/hooks/use{Feature}Manager.ts
   └─ src/features/{feature}/hooks/use{Feature}Repository.ts

4. Components Layer (UI)
   └─ src/features/{feature}/components/{feature}-form.tsx
   └─ src/features/{feature}/components/{feature}-table.tsx
```

### How to Add a New Feature

Just say: **"Add {feature} management"**

Claude will automatically:
- ✅ Create domain layer with business logic
- ✅ Create repository with data access abstraction
- ✅ Create manager hook to coordinate everything
- ✅ Create presentational components (form, table, dialogs)
- ✅ Wire it all together in page component

**No need to specify code structure** — this IS the structure.

### Examples Already Built
- ✅ Users - Full implementation with renewal feature
- ✅ Businesses - Full implementation with model selection
- ✅ Coupons - Full implementation with usage tracking

### Key Principles
1. Services are **pure** (no React, no I/O)
2. Repositories are **swappable** (localStorage → API → DB)
3. Components are **presentational** (data as props only)
4. Hooks **coordinate** (service + repo + state)
5. **One source of truth** per business rule

### References
- See `ARCHITECTURE.md` for detailed explanation
- See `MIGRATION_GUIDE.md` for migration patterns
- See `REFACTORING_COMPLETE.md` for what was fixed
