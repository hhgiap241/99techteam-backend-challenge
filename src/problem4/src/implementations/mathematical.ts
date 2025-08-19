import { validateInput } from '../utils/validation';

/**
 * Advantages:
 * - Constant time execution regardless of input size
 * - Minimal memory usage
 * - Mathematically elegant and efficient
 * - Perfect for large inputs
 *
 * Disadvantages:
 * - Less intuitive for those unfamiliar with the formula
 * - Not suitable for learning basic programming concepts
 * - Less flexible for modifications to the calculation
 *
 * Best for: High-performance scenarios, large inputs, production systems
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */

/**
 * Sum from 1 to n using Gauss's arithmetic series formula
 * @param n - The upper bound for summation
 * @returns The sum from 1 to n using Gauss's formula: n(n+1)/2
 */
export function sum_to_n_c(n: number): number {
  validateInput(n);

  if (n === 0) return 0;

  // Use Gauss's formula: n(n+1)/2
  return (n * (n + 1)) / 2;
}
