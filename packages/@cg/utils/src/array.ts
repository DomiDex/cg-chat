/**
 * Array utility functions
 */

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(array: T[][]): T[] {
  return array.reduce((flat, item) => flat.concat(item), []);
}

export function deepFlatten<T>(array: any[]): T[] {
  return array.reduce((flat, item) => 
    flat.concat(Array.isArray(item) ? deepFlatten(item) : item), []
  );
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any): T[] {
  return [...array].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}

export function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

export function sampleSize<T>(array: T[], n: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, n);
}

export function difference<T>(array1: T[], array2: T[]): T[] {
  const set = new Set(array2);
  return array1.filter(item => !set.has(item));
}

export function intersection<T>(array1: T[], array2: T[]): T[] {
  const set = new Set(array2);
  return array1.filter(item => set.has(item));
}

export function union<T>(...arrays: T[][]): T[] {
  return unique(flatten(arrays));
}

export function zip<T>(...arrays: T[][]): (T | undefined)[][] {
  const minLength = Math.min(...arrays.map(arr => arr.length));
  const result: (T | undefined)[][] = [];
  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map(arr => arr[i]));
  }
  return result;
}

export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  return [truthy, falsy];
}

export function range(start: number, end?: number, step = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

export function compact<T>(array: (T | null | undefined | false | 0 | '')[]): T[] {
  return array.filter(Boolean) as T[];
}

export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function first<T>(array: T[]): T | undefined {
  return array[0];
}

export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

export function drop<T>(array: T[], n: number): T[] {
  return array.slice(n);
}

export function sum(array: number[]): number {
  return array.reduce((sum, num) => sum + num, 0);
}

export function average(array: number[]): number {
  return array.length === 0 ? 0 : sum(array) / array.length;
}

export function median(array: number[]): number {
  if (array.length === 0) return 0;
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const val1 = sorted[mid - 1] ?? 0;
    const val2 = sorted[mid] ?? 0;
    return (val1 + val2) / 2;
  }
  return sorted[mid] ?? 0;
}

export function mode<T>(array: T[]): T | undefined {
  const frequency = new Map<T, number>();
  let maxFreq = 0;
  let modeValue: T | undefined;
  
  array.forEach(item => {
    const freq = (frequency.get(item) || 0) + 1;
    frequency.set(item, freq);
    if (freq > maxFreq) {
      maxFreq = freq;
      modeValue = item;
    }
  });
  
  return modeValue;
}

export function countBy<T>(array: T[], iteratee: (item: T) => string | number): Record<string | number, number> {
  return array.reduce((acc, item) => {
    const key = iteratee(item);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string | number, number>);
}