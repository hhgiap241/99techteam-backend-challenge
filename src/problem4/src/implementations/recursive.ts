/**
 * Implementation B: Recursive with Memoization - The Elegant Solution
 * 
 * Advantages:
 * - Elegant and mathematically intuitive
 * - Memoization prevents redundant calculations
 * - Great educational value for understanding recursion
 * - Efficient for repeated calls with same inputs
 * 
 * Disadvantages:
 * - Risk of stack overflow for very large n
 * - Memory overhead for memoization table
 * - Slower than mathematical approach for single calls
 * 
 * Best for: When elegance is valued, repeated calculations, moderate input sizes
 * 
 * Time complexity: O(n) - first call, O(1) - subsequent calls with memoization
 * Space complexity: O(n) - due to recursion stack and memoization
 */

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
