/**
 * Flattens a nested object structure into a single-level object with dot notation keys.
 * Arrays within the object are preserved intact.
 *
 * @param obj - The nested object to flatten
 * @param prefix - Optional prefix for keys (used in recursive calls)
 * @param result - Optional accumulator object (used in recursive calls)
 * @returns A flattened object with dot notation keys
 *
 * @example
 * // Returns {"hey.there": "world", "hey.people": [1, 2, {dave: true}]}
 * flattenObject({hey: {there: "world", people: [1, 2, {dave: true}]}});
 */

// Define recursive type for nested objects
export type NestedValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | unknown[]
  | Record<string, unknown>
  | DateTimeInfo
  | unknown;
export type NestedObject = Record<string, NestedValue>;

export const flattenObject = (
  obj: NestedObject,
  prefix: string = "",
  result: Record<string, unknown> = {},
): Record<string, unknown> => {
  // Iterate through each key in the object
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Create the new key with dot notation
      const newKey = prefix ? `${prefix}.${key}` : key;

      // If the value is an array, add it directly to the result
      if (Array.isArray(value)) {
        result[newKey] = value;
      }
      // If the value is an object but not an array, recursively flatten it
      else if (typeof value === "object" && value !== null) {
        flattenObject(value as NestedObject, newKey, result);
      }
      // Otherwise, add the primitive value directly to the result
      else {
        result[newKey] = value;
      }
    }
  }

  return result;
};

// Example usage:
// const nested = {hey: {there: "world", people: [1, 2, {dave: true}]}};
// const flattened = flattenObject(nested);
// console.log(flattened); // {"hey.there": "world", "hey.people": [1, 2, {dave: true}]}

/**
 * Returns a comprehensive object containing current date and time information
 *
 * @returns {DateTimeInfo} An object with detailed date and time properties
 *
 * Example return value:
 * {
 *   year: 2025,
 *   month: 3,
 *   day: 28,
 *   hour: 17,
 *   minute: 6,
 *   second: 22,
 *   millisecond: 458,
 *   day_of_week: "Friday",
 *   day_of_week_short: "Fri",
 *   day_of_year: 87,
 *   week_of_year: 13,
 *   month_name: "March",
 *   month_name_short: "Mar",
 *   quarter: 1,
 *   is_leap_year: false,
 *   timezone: "UTC-0700",
 *   timezone_name: "Pacific Daylight Time",
 *   timezone_offset: -420, // minutes
 *   is_dst: true,
 *   unix_timestamp: 1743055582, // seconds since Jan 1, 1970
 *   iso_string: "2025-03-28T17:06:22.458Z"
 * }
 */
interface DateTimeInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  day_of_week: string;
  day_of_week_short: string;
  day_of_year: number;
  week_of_year: number;
  month_name: string;
  month_name_short: string;
  quarter: number;
  is_leap_year: boolean;
  timezone: string;
  timezone_name: string;
  timezone_offset: number;
  is_dst: boolean;
  unix_timestamp: number;
  iso_string: string;
}

/**
 * Get comprehensive date and time information
 * @returns {DateTimeInfo} Object containing detailed date and time data
 */
export const getCurrentDateInfo = (): DateTimeInfo => {
  const now = new Date();

  // Get day of week
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate day of year
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Calculate week of year (ISO week number)
  const date = new Date(now.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1
  const weekOfYear =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );

  // Check if it's a leap year
  const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;

  // Get timezone information
  const timezoneOffset = now.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
  const offsetMinutes = Math.abs(timezoneOffset % 60);
  const timezoneString = `UTC${timezoneOffset <= 0 ? "+" : "-"}${offsetHours.toString().padStart(2, "0")}${offsetMinutes.toString().padStart(2, "0")}`;

  // Determine if daylight saving time is in effect
  // This is a simplification; actual DST logic can be complex
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  const isDST =
    now.getTimezoneOffset() <
    Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

  // Get timezone name (simplified approach)
  const timeString = now.toTimeString();
  const timezoneName = timeString.substring(
    timeString.indexOf("(") + 1,
    timeString.indexOf(")"),
  );

  // Calculate quarter
  const quarter = Math.floor((now.getMonth() + 3) / 3);

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
    millisecond: now.getMilliseconds(),
    day_of_week: days[now.getDay()],
    day_of_week_short: daysShort[now.getDay()],
    day_of_year: dayOfYear,
    week_of_year: weekOfYear,
    month_name: months[now.getMonth()],
    month_name_short: monthsShort[now.getMonth()],
    quarter: quarter,
    is_leap_year: isLeapYear,
    timezone: timezoneString,
    timezone_name: timezoneName,
    timezone_offset: timezoneOffset,
    is_dst: isDST,
    unix_timestamp: Math.floor(now.getTime() / 1000),
    iso_string: now.toISOString(),
  };
};

// Example usage:
// const dateInfo = getCurrentDateInfo();
// console.log(dateInfo);

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

// get64.ts
type PathSeg = string | number;

/**
 * Like lodash.get, but if a node is a base64-encoded JSON string,
 * it will decode+parse it and keep traversing.
 */
export function get64<T = unknown>(
  obj: unknown,
  path: string | PathSeg[],
  defaultValue?: T,
): T | undefined {
  const parts = Array.isArray(path) ? path.map(toSeg) : normalizePath(path);

  let cur: unknown = obj;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) return defaultValue;

    // If the current node is a base64 JSON string, unwrap it.
    if (typeof cur === "string") {
      const unwrapped = tryParseB64Json(cur);
      if (unwrapped !== undefined && unwrapped !== null) {
        cur = unwrapped;
      } else {
        // Can't go deeper through a plain string
        return defaultValue;
      }
    }

    const key = parts[i];

    if (Array.isArray(cur) && typeof key === "number") {
      cur = cur[key];
    } else if (isObj(cur)) {
      cur = (cur as Record<string, unknown>)[String(key)];
    } else {
      return defaultValue;
    }
  }

  return (cur as T) ?? defaultValue;
}

// ----------------- helpers -----------------

function isObj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object";
}

function toSeg(s: PathSeg): PathSeg {
  return typeof s === "string" && /^\d+$/.test(s) ? Number(s) : s;
}

function normalizePath(path: string): PathSeg[] {
  // Support simple bracket notation: a.b[0].c  -> ["a","b",0,"c"]
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map(toSeg);
}

function tryParseB64Json(s: string): unknown | undefined {
  const std = toStdB64(s);
  // Node (Lambda) first
  if (typeof Buffer !== "undefined") {
    try {
      const text = Buffer.from(std, "base64").toString("utf8");
      return JSON.parse(text);
    } catch {
      /* ignore */
    }
  }
  // Browser fallback
  if (typeof atob === "function") {
    try {
      const raw = atob(std);
      // Most JSON is ASCII; if you have UTF-8 payloads, wire a TextDecoder here.
      return JSON.parse(raw);
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

function toStdB64(b64: string): string {
  // Handle URL-safe base64 and missing padding
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);
  return s;
}
