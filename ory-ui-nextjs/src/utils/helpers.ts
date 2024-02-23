type ValidArg = string | number | boolean | null | undefined;
type ClsxArg = ValidArg | ClsxArgObject | ClsxArg[];

interface ClsxArgObject {
  [key: string]: ValidArg;
}

export function customClsx(...args: ClsxArg[]): string {
  let classes: string[] = [];

  args.forEach((arg) => {
    if (arg === null || arg === undefined || arg === false) return;

    const argType = typeof arg;

    if (argType === "string" || argType === "number" || argType === "boolean") {
      if (arg) {
        // Check for truthy values if arg is boolean
        classes.push(arg.toString());
      }
    } else if (Array.isArray(arg)) {
      classes.push(customClsx(...arg)); // Recursively process arrays
    } else if (argType === "object") {
      Object.keys(arg as ClsxArgObject).forEach((key) => {
        if ((arg as ClsxArgObject)[key]) {
          classes.push(key);
        }
      });
    }
  });

  return classes.join(" "); // Join all class names with spaces
}

export function generateCsrfToken(): string {
  // Generate a random CSRF token
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  return token;
}
