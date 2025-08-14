/**
 * Implementation A: Iterative Loop - The Reliable Workhorse
 * 
 * Advantages:
 * - Simple and easy to understand
 * - Predictable memory usage (constant space)
 * - No risk of stack overflow
 * - Easy to debug and modify
 * 
 * Disadvantages:
 * - Linear time complexity
 * - More CPU cycles for large n compared to mathematical approach
 * 
 * Best for: General purpose, educational examples, when simplicity is preferred
 * 
 * Time complexity: O(n)
 * Space complexity: O(1)
 */

import { validateInput } from '../utils/validation';

/**
 * Sum from 1 to n using iterative approach
 * @param n - The upper bound for summation (1 + 2 + ... + n)
 * @returns The sum from 1 to n
 */
export function sum_to_n_a(n: number): number {
  validateInput(n);

  if (n === 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
}
