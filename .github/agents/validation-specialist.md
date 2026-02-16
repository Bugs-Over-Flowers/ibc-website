# Validation Specialist Agent

## When to Apply

Use this agent when working with:
- Zod schema creation
- Form validation patterns
- Reusable validators
- Type inference with Zod

## Basic Zod Schema

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be at least 18").optional(),
});

type User = z.infer<typeof userSchema>;
```

## Reusable Validators

Import from `@/lib/validation/utils`:

```typescript
import {
  phoneSchema,    // Philippine phone: +639XXXXXXXXX or 09XXXXXXXXX
  emailSchema,    // Standard email validation
} from "@/lib/validation/utils";

const contactSchema = z.object({
  email: emailSchema,
  phone: phoneSchema.optional(),
});
```

## String Validation

```typescript
const schema = z.object({
  // Basic string
  name: z.string(),
  
  // Min/max length
  username: z.string().min(3).max(20),
  
  // Email
  email: z.string().email(),
  
  // Regex pattern
  code: z.string().regex(/^[A-Z]{3}-\d{4}$/, "Invalid format (ABC-1234)"),
  
  // URL
  website: z.string().url().optional(),
  
  // UUID
  id: z.string().uuid(),
  
  // Trim and transform
  name: z.string().trim().toLowerCase(),
});
```

## Number Validation

```typescript
const schema = z.object({
  // Integer
  count: z.number().int(),
  
  // Min/max
  age: z.number().min(0).max(120),
  
  // Positive/negative
  price: z.number().positive(),
  discount: z.number().negative().optional(),
  
  // Multiple of
  quantity: z.number().multipleOf(1), // Must be integer
});
```

## Object Validation

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  name: z.string(),
  address: addressSchema,              // Required nested object
  billingAddress: addressSchema.optional(), // Optional nested object
});

// Partial (all fields optional)
const partialUserSchema = userSchema.partial();

// Pick/omit
const userCredentials = userSchema.pick({ email: true, password: true });
const userWithoutPassword = userSchema.omit({ password: true });

// Extend
const adminSchema = userSchema.extend({
  role: z.literal("admin"),
  permissions: z.array(z.string()),
});
```

## Array Validation

```typescript
const schema = z.object({
  // Basic array
  tags: z.array(z.string()),
  
  // Min/max length
  categories: z.array(z.string()).min(1).max(5),
  
  // Non-empty
  items: z.array(z.string()).nonempty(),
  
  // Unique
  emails: z.array(z.string().email()).unique(),
});
```

## Enum/Literal Validation

```typescript
// String enum
const statusSchema = z.enum(["pending", "active", "inactive"]);

// Literal (for single values)
const roleSchema = z.literal("admin");

// Union of literals
const themeSchema = z.union([
  z.literal("light"),
  z.literal("dark"),
  z.literal("system"),
]);

// Native enum
enum Role {
  Admin = "admin",
  User = "user",
}
const roleSchema = z.nativeEnum(Role);
```

## Date Validation

```typescript
const schema = z.object({
  // Date object
  createdAt: z.date(),
  
  // Date string (ISO)
  birthDate: z.string().datetime(),
  
  // Date coercion (string -> Date)
  eventDate: z.coerce.date(),
});
```

## Coercion (Type Transformation)

```typescript
const schema = z.object({
  // String to number
  count: z.coerce.number(),
  
  // String to boolean
  isActive: z.coerce.boolean(),
  
  // String to date
  date: z.coerce.date(),
  
  // String to bigint
  id: z.coerce.bigint(),
});
```

## Custom Validation

```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .refine(
    (val) => val !== "password123",
    { message: "Password is too common" }
  );

// Async validation
const uniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const exists = await checkEmailExists(email);
    return !exists;
  },
  { message: "Email already exists" }
);
```

## Form Integration with TanStack Form

```typescript
"use client";

import { useAppForm } from "@/hooks/_formHooks";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

export function UserForm() {
  const form = useAppForm({
    defaultValues: { name: "", email: "", age: undefined },
    validation: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      // value is typed as z.infer<typeof schema>
      console.log(value);
    },
  });
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField name="email">
        {(field) => <field.TextField label="Email" type="email" />}
      </form.AppField>
    </form>
  );
}
```

## Error Handling

```typescript
// Safe parse (returns result object)
const result = schema.safeParse(data);
if (!result.success) {
  console.log(result.error.issues);
}

// Throw on error
try {
  const validated = schema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
  }
}

// Type guard
if (schema.safeParse(data).success) {
  // data is validated
}
```

## Validation Patterns

### Philippine Phone Number

```typescript
// From @/lib/validation/utils
export const phoneSchema = z.string()
  .regex(
    /^(\+639|09)\d{9}$/,
    "Invalid Philippine phone number format"
  );
```

### Email with Domain Restriction

```typescript
const workEmailSchema = z.string()
  .email()
  .regex(
    /@company\.com$/,
    "Must be a company email"
  );
```

### File Upload

```typescript
const fileSchema = z.instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File must be less than 5MB"
  )
  .refine(
    (file) => ["image/jpeg", "image/png"].includes(file.type),
    "Only JPEG and PNG images are allowed"
  );
```

## Common Pitfalls

1. **Always use `z.infer<typeof schema>`** for type inference
2. **Use `.safeParse()`** when you don't want to throw
3. **Use `.parse()`** when you want validation to throw on error
4. **Add custom error messages** for better UX
5. **Use coercion carefully** - it can hide type issues
6. **Validate on both client and server** - never trust client-side validation alone
7. **Use `.optional()`** for nullable fields, not `z.null()`
8. **Prefer `.refine()`** for complex validation logic
