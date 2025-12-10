import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { treeifyError, type ZodError, type ZodType } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transforms a ZodError into a Record of field errors for TanStack Form.
 *
 * @param error - The ZodError to transform
 * @returns A record where keys are field names and values contain the first error message
 *
 * @example
 * ```ts
 * const result = schema.safeParse(value);
 * if (!result.success) {
 *   return { fields: zodErrorToFieldErrors(result.error) };
 * }
 * ```
 */
type TreeNode = {
  errors?: string[];
  properties?: Record<string, TreeNode>;
  items?: (TreeNode | undefined)[];
};

/**
 * Recursively traverses a treeified Zod error and extracts field errors.
 * Handles nested objects and arrays, using dot notation for nested paths.
 *
 * @param node - The current tree node to process
 * @param fields - The accumulator object for field errors
 * @param prefix - The current path prefix (for nested fields)
 */
function traverseErrorTree(
  node: TreeNode,
  fields: Record<string, { message: string }>,
  prefix = "",
) {
  // If this node has errors, add the first one
  if (node.errors && node.errors.length > 0 && prefix) {
    fields[prefix] = { message: node.errors[0] };
  }

  // Handle object properties
  if (node.properties) {
    for (const [key, childNode] of Object.entries(node.properties)) {
      if (childNode) {
        const path = prefix ? `${prefix}.${key}` : key;
        traverseErrorTree(childNode, fields, path);
      }
    }
  }

  // Handle array items
  if (node.items) {
    for (const [index, childNode] of node.items.entries()) {
      if (childNode) {
        const path = prefix ? `${prefix}[${index}]` : `[${index}]`;
        traverseErrorTree(childNode, fields, path);
      }
    }
  }
}

export function zodErrorToFieldErrors(error: ZodError) {
  const tree = treeifyError(error) as TreeNode;
  const fields: Record<string, { message: string }> = {};

  traverseErrorTree(tree, fields);

  return fields;
}

/**
 * Creates a TanStack Form validator function from a Zod schema.
 *
 * @param schema - The Zod schema to use for validation
 * @returns A validator function compatible with TanStack Form's validators
 *
 * @example
 * ```ts
 * const f = useAppForm({
 *   defaultValues: { name: "", email: "" },
 *   validators: {
 *     onSubmit: zodValidator(MyFormSchema),
 *   },
 * });
 * ```
 */
export function zodValidator<T>(schema: ZodType<T>) {
  return ({ value }: { value: T }) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      console.error("Validation failed", result.error);
      return { fields: zodErrorToFieldErrors(result.error) };
    }
    return undefined;
  };
}

export function parseStringParam(
  param: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(param)) {
    return param[0]; // Returns the first occurrence
  }
  return param;
}
