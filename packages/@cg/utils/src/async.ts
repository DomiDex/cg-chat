/**
 * Async utility functions
 */

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay: initialDelay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries - 1) {
        onRetry?.(lastError, i + 1);
        const delayMs = initialDelay * Math.pow(backoff, i);
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}

export async function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency = Infinity
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = task().then(result => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

export async function race<T>(
  promises: Promise<T>[],
  timeoutMs?: number
): Promise<T> {
  const racers = [...promises];
  
  if (timeoutMs) {
    racers.push(
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Race timeout')), timeoutMs)
      )
    );
  }
  
  return Promise.race(racers);
}

export async function allSettled<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: any }>> {
  return Promise.allSettled(promises);
}

export async function any<T>(promises: Promise<T>[]): Promise<T> {
  return Promise.any(promises);
}

export async function sequential<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  
  for (const task of tasks) {
    results.push(await task());
  }
  
  return results;
}

export async function batch<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

export class Queue<T> {
  private queue: (() => Promise<T>)[] = [];
  private running = false;
  private concurrency: number;
  
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
  }
  
  async add(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });
      
      if (!this.running) {
        this.run();
      }
    });
  }
  
  private async run(): Promise<void> {
    if (this.running || this.queue.length === 0) return;
    
    this.running = true;
    const executing: Promise<any>[] = [];
    
    while (this.queue.length > 0) {
      while (executing.length < this.concurrency && this.queue.length > 0) {
        const task = this.queue.shift()!;
        const promise = task().finally(() => {
          executing.splice(executing.indexOf(promise), 1);
        });
        executing.push(promise);
      }
      
      if (executing.length > 0) {
        await Promise.race(executing);
      }
    }
    
    await Promise.all(executing);
    this.running = false;
  }
  
  get size(): number {
    return this.queue.length;
  }
  
  clear(): void {
    this.queue = [];
  }
}

export function promisify<T>(
  fn: (callback: (err: Error | null, result?: T) => void) => void
): () => Promise<T> {
  return () => new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result!);
    });
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: any) => boolean = () => true,
  maxAttempts = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }
      await delay(Math.pow(2, attempt) * 1000);
    }
  }
  
  throw lastError;
}