import { validateInput } from '../utils/validation';

const memoCache = new Map<number, number>();

/**
 * Sum from 1 to n using recursive approach with memoization
 * @param n - The upper bound for summation
 * @returns The sum from 1 to n
 */
export function sum_to_n_b(n: number): number {
  validateInput(n);

  if (n === 0) return 0;
  if (n === 1) return 1;

  // Check memoization cache
  if (memoCache.has(n)) {
    return memoCache.get(n) || 0;
  }

  // Recursive calculation with memoization
  const result = n + sum_to_n_b(n - 1);
  memoCache.set(n, result);

  return result;
}

/**
 * Clear memoization cache (useful for benchmarking)
 */
export function clearMemoCache(): void {
  memoCache.clear();
}
