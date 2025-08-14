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
