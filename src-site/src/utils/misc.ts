type Primitive = string | number | boolean | null | undefined;
type Traversable = Record<string, unknown> | unknown[];

function traverse(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => traverse(item));
  } else if (obj && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      result[key] = traverse(value);
    });
    return result;
  } else if (typeof obj === "string") {
    // Try to decode as base64
    try {
      let target = atob(obj);
      // Try to parse as JSON
      try {
        let json = JSON.parse(target);
        return traverse(json);
      } catch (e) {
        // not parsable JSON, return original string
        return obj;
      }
    } catch (e) {
      // not base64, return original string
      return obj;
    }
  } else {
    // number, boolean, null, undefined - return as-is
    return obj;
  }
}

export const base64traverse = traverse;
