import { type ClassValue, clsx } from "clsx";
import type { ReadonlyURLSearchParams } from "next/navigation";
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

export function setParamsOrDelete(
  param: string,
  value: string | undefined,
  undefinedValues: string[],
  searchParams: ReadonlyURLSearchParams,
) {
  const params = new URLSearchParams(searchParams.toString());

  if (value === undefined || value === "" || undefinedValues.includes(value)) {
    params.delete(param);
  } else {
    params.set(param, value);
  }

  return params.toString();
}
export const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

/**
 *  Delays execution for the specified number of milliseconds.
 * Can be used to simulate network latency, other asynchronous operations,
 * or for animation purposes.
 *
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Converts a string to title case.
 *
 * @param str - The string to convert
 * @returns The string in title case
 */
export const titleCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(
      /(^|[\s-])([a-z])/g,
      (_, space, letter) => space + letter.toUpperCase(),
    );
};

export const areRecordsEqual = <T extends Record<string, unknown>>(
  obj1: T,
  obj2: T,
): boolean => {
  // Handle reference equality and simple null/undefined cases first
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  // Ensure both records have the same own keys
  const hasOwn = Object.prototype.hasOwnProperty;
  for (const key of keys1) {
    if (!hasOwn.call(obj2, key)) {
      return false;
    }
  }

  // Compare values for each key
  return keys1.every((key) => obj1[key] === obj2[key]);
};

/**
 * Extracts file extension from MIME type.
 *
 * @param mimeType - MIME type string (e.g., "image/jpeg", "application/pdf")
 * @returns File extension without the dot (e.g., "jpeg", "pdf")
 * @throws Error if MIME type is invalid
 *
 * @example
 * getExtensionFromMimeType("image/jpeg") // "jpeg"
 * getExtensionFromMimeType("application/pdf") // "pdf"
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const parts = mimeType.split("/");
  if (parts.length !== 2) {
    throw new Error(`Invalid MIME type: ${mimeType}`);
  }
  return parts[1];
}
