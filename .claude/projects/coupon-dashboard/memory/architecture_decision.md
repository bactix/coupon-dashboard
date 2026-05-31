---
name: scalable-architecture-standard
description: This project uses domain-driven, layered architecture for all features
metadata:
  type: project
---

# Architecture Standard for Coupon Dashboard

All new features MUST follow this 4-layer architecture automatically. No exceptions.

## Pattern Overview

Every feature has these 4 layers:

### 1. Domain Layer (`src/domain/{feature}/`)
- **Files**: `{feature}.types.ts`, `{feature}.service.ts`, `index.ts`
- **Purpose**: Pure business logic, no React, no framework dependencies
- **Contains**: TypeScript interfaces, validation rules, calculations, transformations

### 2. Infrastructure Layer (`src/infrastructure/storage/`)
- **File**: `{feature}.repository.ts`
- **Purpose**: Data access abstraction, swappable storage
- **Contains**: Interface definition + LocalStorageRepository implementation

### 3. Features/Hooks Layer (`src/features/{feature}/hooks/`)
- **Files**: `use{Feature}Repository.ts`, `use{Feature}Manager.ts`, `index.ts`
- **Purpose**: React integration, coordinates service + repository + state
- **Contains**: Manager hook that uses service + repository, form hook for form state

### 4. Components Layer (`src/features/{feature}/components/`)
- **Files**: `{feature}-form.tsx`, `{feature}-table.tsx`, `{feature}-table-row.tsx`, `{feature}-form-dialog.tsx`, `{feature}-delete-dialog.tsx`, `index.ts`
- **Purpose**: Presentational components only
- **Contains**: UI components that receive data via props, no direct data fetching

## Page Component Pattern

```typescript
// src/app/dashboard/{feature}/page.tsx
"use client";

import { useState, useEffect } from "react";
import { use{Feature}Manager } from "@/features/{feature}/hooks";
import { use{Feature}Form } from "@/features/{feature}/hooks";

export default function {Feature}Page() {
  const { 
    items,
    addItem,
    updateItem,
    deleteItem,
    initialize
  } = use{Feature}Manager();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Use hooks, render components
}
```

## Important Rules

1. **Services are pure** - No React, no localStorage, no API calls
2. **Repositories are swappable** - Can go from localStorage → API → Database
3. **Components are presentational** - Take data as props, call callbacks
4. **Hooks coordinate** - Service + Repository + State management
5. **One source of truth** - Business rule exists in exactly ONE place

## Examples in Codebase

Implemented for:
- Users (src/domain/users/, src/features/users/)
- Businesses (src/domain/businesses/, src/features/businesses/)
- Coupons (src/domain/coupons/, src/features/coupons/)

## When Asked to Add New Feature

Just say: "Add products management" or "Build customer reviews"

I will automatically:
1. Create domain/products/ with ProductService
2. Create infrastructure/storage/product.repository.ts
3. Create features/products/hooks/ with useProductManager
4. Create features/products/components/ with form, table, dialogs
5. Wire it all together in app/dashboard/products/page.tsx

No need to specify structure - it's the standard!
