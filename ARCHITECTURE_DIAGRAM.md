# Architecture Diagram - Businesses Feature

## Component Hierarchy & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Page Component                              │
│              (app/dashboard/businesses/page.tsx)                 │
│  - Orchestrates all sub-components                               │
│  - Manages deleteId state                                        │
│  - Coordinates hooks and dialogs                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ┌─────────┐   ┌──────────────────┐
   │ Hooks   │   │   Components     │
   └─────────┘   └──────────────────┘
        │             │
    ┌───┴─────┐   ┌───┴────────────────┐
    │         │   │                    │
┌───▼──┐ ┌────▼──┐ ┌────────┐ ┌──────────────┐
│ use- │ │ use-  │ │Business│ │ BusinessDelete
│ busi-│ │ busi- │ │FormDialog Dialog
│ nesses
│ ness- │ │       │ │        │ │
│ form  │ │       │ │        │ │
└──────┘ └───────┘ └────────┘ └──────────────┘
    │        │          │             │
    │        │          │             │
    └────┬───┴─────┬────┴─────────────┘
         │         │
    ┌────▼──┐  ┌───▼────────┐
    │ Util  │  │Components  │
    │ities  │  │ (Reusable) │
    └───────┘  └────────────┘
               │         │
         ┌─────┴─────────┴─────────┬──────────┐
         │                         │          │
    ┌────▼─────┐    ┌────────────▼──┐  ┌────▼────┐
    │Business  │    │BusinessTable  │  │Business│
    │Form      │    │               │  │PageHdr │
    └──────────┘    └────┬──────────┘  └────────┘
                         │
                    ┌────▼────────────┐
                    │BusinessTableRow │
                    │ (Memoized)      │
                    └─────────────────┘
```

---

## Data Flow Diagram

### Create Flow
```
User clicks "Add Business"
    │
    ▼
openCreateDialog()
    │
    ├─ setEditingBusiness(null)
    ├─ setIsDialogOpen(true)
    └─ getDefaultValues() → returns empty form defaults
        │
        ▼
    BusinessFormDialog opens
        │
        ▼
    User fills form
        │
        ▼
    User submits
        │
        ▼
    onSubmit(values)
        │
        ├─ isEditing = false
        ├─ addBusiness(values)
        │   ├─ createBusinessFromValues(values)
        │   │   ├─ generateId()
        │   │   └─ Add createdAt timestamp
        │   └─ setBusinesses([newBusiness, ...prev])
        └─ closeDialog()
            │
            ├─ setIsDialogOpen(false)
            └─ setEditingBusiness(null)
                │
                ▼
            Dialog closes, table re-renders with new business
```

### Edit Flow
```
User clicks Edit button on row
    │
    ▼
openEditDialog(business)
    │
    ├─ setEditingBusiness(business)
    ├─ setIsDialogOpen(true)
    └─ getDefaultValues() → returns business data
        │
        ▼
    BusinessFormDialog opens with pre-filled values
        │
        ▼
    User modifies form
        │
        ▼
    User submits
        │
        ▼
    onSubmit(values)
        │
        ├─ isEditing = true
        ├─ id = editingBusiness.id
        ├─ updateBusiness(id, values)
        │   ├─ setBusinesses((prev) =>
        │   │   prev.map(b =>
        │   │     b.id === id ? updateBusinessWithValues(b, values) : b
        │   │   )
        │   │ )
        └─ closeDialog()
            │
            ▼
        Dialog closes, table re-renders with updated business
```

### Delete Flow
```
User clicks Delete button on row
    │
    ▼
setDeleteId(business.id)
    │
    ▼
BusinessDeleteDialog opens
    │
    ├─ getBusinessById(deleteId) → shows name
    │
    ▼
User confirms
    │
    ▼
handleDelete()
    │
    ├─ deleteBusiness(deleteId)
    │   └─ setBusinesses(prev => prev.filter(b => b.id !== id))
    │
    └─ setDeleteId(null)
        │
        ▼
    Dialog closes, table re-renders without deleted business
```

---

## State Management Architecture

### Page Level State
```typescript
const [deleteId, setDeleteId] = useState<string | null>(null);
```
- Only used for delete confirmation dialog
- Reset after deletion

### Hook: useBusinesses()
```typescript
const [businesses, setBusinesses] = useLocalStorage<Business[]>(...)
```
- Manages all business data
- Persisted to localStorage
- Returns memoized CRUD operations

### Hook: useBusinessForm()
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
```
- Manages form dialog state
- Handles create vs edit mode
- Provides default values

---

## Component Props Flow

```
Page Component
│
├─ BusinessesPageHeader
│  └─ Props: onAddClick, businessCount
│
├─ BusinessTable
│  ├─ Props: businesses[], onEdit(business), onDelete(id)
│  │
│  └─ BusinessTableRow (for each business)
│     └─ Props: business, onEdit, onDelete
│
├─ BusinessFormDialog
│  ├─ Props: open, onOpenChange, onSubmit, defaultValues, isEditing
│  │
│  └─ BusinessForm
│     ├─ Props: onSubmit, defaultValues, isLoading, submitLabel
│     │
│     └─ FormField (for each form field)
│        └─ Props: id, label, error, children, required
│
└─ BusinessDeleteDialog
   └─ Props: open, onOpenChange, onConfirm, businessName, isLoading
```

---

## Error Flow (Future Implementation)

```
User Action (Add/Edit/Delete)
    │
    ▼
Try to execute CRUD operation
    │
    ├─ Success
    │  └─ Update UI, close dialog
    │
    └─ Error
       ├─ setError(message)
       │
       ├─ Show error toast/alert
       │
       └─ Keep dialog open for retry
```

---

## Performance Optimization Points

```
┌─────────────────────────────────────────┐
│  Performance Optimization Strategies    │
└─────────────────────────────────────────┘

1. Component Memoization
   ├─ BusinessesPageHeader (memo)
   │  └─ Only re-renders if props change
   ├─ BusinessTable (memo)
   │  └─ Stays stable during form edits
   ├─ BusinessTableRow (memo)
   │  └─ Individual rows stay stable
   ├─ BusinessFormDialog (memo)
   └─ BusinessDeleteDialog (memo)

2. Callback Memoization
   ├─ addBusiness (useCallback)
   ├─ updateBusiness (useCallback)
   ├─ deleteBusiness (useCallback)
   ├─ openCreateDialog (useCallback)
   ├─ openEditDialog (useCallback)
   └─ closeDialog (useCallback)

3. Efficient State Management
   ├─ useLocalStorage hook caches data
   ├─ Derived state (getBusinessById) computed on demand
   └─ Form state isolated in dialog

4. Lazy Loading Ready
   └─ Can be added to table pagination
```

---

## Accessibility Architecture

```
┌────────────────────────────────────────┐
│  Accessibility Features                │
└────────────────────────────────────────┘

1. Semantic HTML
   ├─ <Table> for data display
   ├─ <Button> for interactions
   ├─ <Dialog> for forms
   ├─ <Label> for form fields
   └─ <AlertDialog> for confirmations

2. ARIA Labels
   ├─ aria-label on action buttons
   │  └─ "Edit {businessName}"
   │  └─ "Delete {businessName}"
   ├─ Dialog titles and descriptions
   └─ Alert dialog descriptions

3. Form Accessibility
   ├─ Label for each input
   ├─ Error messages linked to fields
   ├─ Required field indicator
   ├─ Proper input types (email, password, etc.)
   └─ Form validation feedback

4. Keyboard Navigation
   ├─ Tab through buttons
   ├─ Enter to submit forms
   ├─ Escape to close dialogs
   └─ Proper focus management
```

---

## Testing Strategy

```
┌────────────────────────────────────────┐
│  Unit Testing Opportunities            │
└────────────────────────────────────────┘

1. Hooks (test independently)
   ├─ useBusinesses()
   │  ├─ Test addBusiness()
   │  ├─ Test updateBusiness()
   │  ├─ Test deleteBusiness()
   │  └─ Test getBusinessById()
   │
   └─ useBusinessForm()
      ├─ Test dialog state management
      ├─ Test default values logic
      └─ Test form submission

2. Components (with mock data)
   ├─ BusinessForm
   │  ├─ Test field rendering
   │  └─ Test form submission
   ├─ BusinessTable
   │  ├─ Test empty state
   │  └─ Test row rendering
   └─ BusinessTableRow
      └─ Test edit/delete actions

3. Utilities (pure functions)
   ├─ createBusinessFromValues()
   ├─ updateBusinessWithValues()
   └─ formatBusinessForDisplay()

4. Integration Tests
   ├─ Full CRUD flow
   ├─ Dialog open/close
   ├─ Form submission
   └─ Table updates
```

---

## API Integration Ready Architecture

```
Current: localStorage
    │
    ▼
Future: API Integration (minimal changes needed)

Update useBusinesses() hook:
┌─────────────────────────────┐
│ Replace localStorage calls  │
│ with API calls:             │
├─────────────────────────────┤
│ - GET /api/businesses       │
│ - POST /api/businesses      │
│ - PATCH /api/businesses/:id │
│ - DELETE /api/businesses/:id│
└─────────────────────────────┘
    │
    ▼
All components work unchanged!
(They only care about the hook API, not implementation)
```

---

## File Dependencies Graph

```
app/dashboard/businesses/page.tsx
  │
  ├─→ @/features/businesses/hooks/use-businesses.ts
  │     └─→ @/hooks/use-local-storage.ts
  │     └─→ @/features/businesses/utils.ts
  │           └─→ @/lib/id-generator.ts
  │           └─→ @/lib/schemas.ts (types)
  │
  ├─→ @/features/businesses/hooks/use-business-form.ts
  │     └─→ @/features/businesses/constants.ts
  │
  ├─→ @/features/businesses/components/businesses-page-header.tsx
  │     └─→ @/components/ui/* (Button, Breadcrumb, etc.)
  │
  ├─→ @/features/businesses/components/business-table.tsx
  │     ├─→ @/features/businesses/components/business-table-row.tsx
  │     │     ├─→ @/features/businesses/constants.ts
  │     │     └─→ @/components/ui/* (Button, Badge, etc.)
  │     └─→ @/features/businesses/constants.ts
  │
  ├─→ @/features/businesses/components/business-form-dialog.tsx
  │     └─→ @/features/businesses/components/business-form.tsx
  │           ├─→ @/features/businesses/components/form-field.tsx
  │           ├─→ @/features/businesses/constants.ts
  │           ├─→ @/lib/constants.ts
  │           ├─→ @/lib/schemas.ts
  │           └─→ @/components/ui/* (Input, Select, etc.)
  │
  └─→ @/features/businesses/components/business-delete-dialog.tsx
        └─→ @/components/ui/* (AlertDialog, etc.)

Legend:
→  imports/depends on
```

---

## Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ High reusability
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Performance optimized
- ✅ Accessibility compliant
- ✅ Ready for API integration
- ✅ Scalable for future features
