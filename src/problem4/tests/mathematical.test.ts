/**
 * Unit tests for sum_to_n_c (Mathematical Formula Implementation)
 */

import { sum_to_n_c } from '../src/implementations';

describe('sum_to_n_c (Mathematical Formula)', () => {
  describe('Basic Functionality', () => {
    test('should return 0 for n = 0', () => {
      expect(sum_to_n_c(0)).toBe(0);
    });

    test('should return 1 for n = 1', () => {
      expect(sum_to_n_c(1)).toBe(1);
    });

    test('should return 3 for n = 2', () => {
      expect(sum_to_n_c(2)).toBe(3);
    });

    test('should return 6 for n = 3', () => {
      expect(sum_to_n_c(3)).toBe(6);
    });

    test('should return 15 for n = 5', () => {
      expect(sum_to_n_c(5)).toBe(15);
    });

    test('should return 55 for n = 10', () => {
      expect(sum_to_n_c(10)).toBe(55);
    });

    test('should handle larger numbers correctly', () => {
      expect(sum_to_n_c(100)).toBe(5050);
      expect(sum_to_n_c(1000)).toBe(500500);
      expect(sum_to_n_c(10000)).toBe(50005000);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for negative numbers', () => {
      expect(() => sum_to_n_c(-1)).toThrow('Input must be non-negative');
    });

    test('should throw error for non-integer inputs', () => {
      expect(() => sum_to_n_c(5.5)).toThrow('Input must be an integer');
    });

    test('should throw error for extremely large numbers', () => {
      expect(() => sum_to_n_c(Number.MAX_SAFE_INTEGER)).toThrow('would produce result exceeding MAX_SAFE_INTEGER');
    });

    test('should handle edge case inputs correctly', () => {
      expect(() => sum_to_n_c(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => sum_to_n_c(Number.NEGATIVE_INFINITY)).toThrow();
      expect(() => sum_to_n_c(NaN)).toThrow();
    });
  });

  describe('Mathematical Formula Correctness', () => {
    test('should implement Gauss formula correctly', () => {
      // Test against the formula: n(n+1)/2
      const testCases = [1, 2, 3, 4, 5, 10, 25, 50, 100, 500, 1000];

      testCases.forEach(n => {
        const expected = (n * (n + 1)) / 2;
        expect(sum_to_n_c(n)).toBe(expected);
      });
    });

    test('should maintain precision for large valid inputs', () => {
      const maxSafeN = Math.floor(Math.sqrt(2 * Number.MAX_SAFE_INTEGER)) - 1000;
      const result = sum_to_n_c(maxSafeN);
      const expected = (maxSafeN * (maxSafeN + 1)) / 2;

      expect(result).toBe(expected);
      expect(result).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });

    test('should produce exact integer results', () => {
      // Test that results are integers, not floats
      const testCases = [1, 2, 3, 4, 5, 10, 17, 23, 50, 99, 101];

      testCases.forEach(n => {
        const result = sum_to_n_c(n);
        expect(Number.isInteger(result)).toBe(true);
      });
    });
  });
});
