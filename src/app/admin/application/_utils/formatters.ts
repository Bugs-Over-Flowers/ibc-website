/**
 * Convert a string to Pascal Case with spaces
 * @example
 * toPascalCaseWithSpaces('regular_member') => 'Regular Member'
 * toPascalCaseWithSpaces('gold-member') => 'Gold Member'
 * toPascalCaseWithSpaces('newmember') => 'New Member'
 * toPascalCaseWithSpaces('newMember') => 'New Member'
 */
export function toPascalCaseWithSpaces(str: string): string {
  return (
    str
      // Split on capital letters, spaces, underscores, and hyphens
      .replace(/([A-Z])/g, " $1")
      .split(/[\s_-]+/)
      .filter((word) => word.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}
