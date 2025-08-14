import { validateInput } from '../utils/validation';

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
