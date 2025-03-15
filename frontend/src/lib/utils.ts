/**
 * Type-safe class name merger with Tailwind optimization
 * @param inputs - Class values to merge (string/array/object)
 * @returns Optimized class string with duplicate protection
 */
export function cn(...inputs: Array<string | Record<string, unknown> | unknown[] | false | null | undefined>): string {
  const classMap = new Map<string, string>();

  const processItem = (item: unknown) => {
    if (!item) return;

    if (typeof item === 'string') {
      item.split(/\s+/).forEach(cls => {
        if (!cls) return;
        // Extract Tailwind class prefix (e.g., 'bg-', 'hover:')
        const prefixMatch = cls.match(/^(.*?:)?(\w+?-)/);
        const key = prefixMatch ? prefixMatch[0] : cls;
        classMap.set(key, cls);
      });
    } else if (Array.isArray(item)) {
      item.forEach(processItem);
    } else if (typeof item === 'object') {
      for (const [key, value] of Object.entries(item)) {
        if (value) processItem(key);
      }
    }
  };

  inputs.forEach(input => {
    if (Array.isArray(input)) {
      input.forEach(processItem);
    } else if (typeof input === 'object' && input !== null) {
      Object.entries(input).forEach(([key, value]) => {
        if (value) processItem(key);
      });
    } else {
      processItem(input);
    }
  });

  return Array.from(classMap.values()).join(' ');
}