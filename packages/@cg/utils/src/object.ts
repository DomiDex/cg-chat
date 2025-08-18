/**
 * Object utility functions
 */

export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Map) {
    const cloned = new Map();
    obj.forEach((value, key) => cloned.set(key, deepClone(value)));
    return cloned as any;
  }
  if (obj instanceof Set) {
    const cloned = new Set();
    obj.forEach(value => cloned.add(deepClone(value)));
    return cloned as any;
  }
  
  const cloned = {} as T;
  Object.keys(obj).forEach(key => {
    cloned[key as keyof T] = deepClone(obj[key as keyof T]);
  });
  return cloned;
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

export function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function isEmpty(obj: any): boolean {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;
    
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    if (a instanceof Map) {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (!b.has(key) || !isEqual(value, b.get(key))) return false;
      }
      return true;
    }
    
    if (a instanceof Set) {
      if (a.size !== b.size) return false;
      for (const value of a) {
        if (!b.has(value)) return false;
      }
      return true;
    }
    
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    
    for (const key of keys) {
      if (!isEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
}

export function mapKeys<T extends Record<string, any>>(
  obj: T,
  fn: (key: string, value: any) => string
): Record<string, any> {
  const result: Record<string, any> = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[fn(key, value)] = value;
  });
  return result;
}

export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  fn: (value: any, key: string) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  Object.entries(obj).forEach(([key, value]) => {
    result[key as keyof T] = fn(value, key);
  });
  return result;
}

export function filterObject<T extends Record<string, any>>(
  obj: T,
  predicate: (value: any, key: string) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(value, key)) {
      result[key as keyof T] = value;
    }
  });
  return result;
}

export function flattenObject(
  obj: Record<string, any>,
  prefix = ''
): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (isObject(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
}

export function unflattenObject(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const keys = key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      if (currentKey && !(currentKey in current)) {
        current[currentKey] = {};
      }
      if (currentKey) {
        current = current[currentKey];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
  });
  
  return result;
}

export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const currentKey = keys[i];
    if (currentKey && (!(currentKey in current) || typeof current[currentKey] !== 'object')) {
      current[currentKey] = {};
    }
    if (currentKey) {
      current = current[currentKey];
    }
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
}

export function has(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || !(key in current)) return false;
    current = current[key];
  }
  
  return true;
}

export function invert<T extends Record<string, string | number>>(
  obj: T
): Record<string | number, keyof T> {
  const result: Record<string | number, keyof T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[value] = key as keyof T;
  });
  return result;
}