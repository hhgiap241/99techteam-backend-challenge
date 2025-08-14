/**
 * Input validation utilities for sum-to-n implementations
 */

/**
 * Validates input for sum-to-n functions
 * @param n - The input number to validate
 * @throws Error if input is invalid
 */
export function validateInput(n: number): void {
  if (!Number.isInteger(n)) {
    throw new Error(`Input must be an integer, received: ${n}`);
  }

  if (n < 0) {
    throw new Error(`Input must be non-negative, received: ${n}`);
  }

  if (n > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Input exceeds maximum safe integer: ${Number.MAX_SAFE_INTEGER}`);
  }

  // Check if result would exceed MAX_SAFE_INTEGER
  const maxN = Math.floor(Math.sqrt(2 * Number.MAX_SAFE_INTEGER));
  if (n > maxN) {
    throw new Error(`Input ${n} would produce result exceeding MAX_SAFE_INTEGER`);
  }
}
