/**
 * Unit tests for sum_to_n_b (Recursive with Memoization Implementation)
 */

import { sum_to_n_b, clearMemoCache } from '../src/implementations';

describe('sum_to_n_b (Recursive with Memoization)', () => {
  beforeEach(() => {
    clearMemoCache();
  });

  describe('Basic Functionality', () => {
    test('should return 0 for n = 0', () => {
      expect(sum_to_n_b(0)).toBe(0);
    });

    test('should return 1 for n = 1', () => {
      expect(sum_to_n_b(1)).toBe(1);
    });

    test('should return 3 for n = 2', () => {
      expect(sum_to_n_b(2)).toBe(3);
    });

    test('should return 6 for n = 3', () => {
      expect(sum_to_n_b(3)).toBe(6);
    });

    test('should return 15 for n = 5', () => {
      expect(sum_to_n_b(5)).toBe(15);
    });

    test('should return 55 for n = 10', () => {
      expect(sum_to_n_b(10)).toBe(55);
    });

    test('should handle larger numbers correctly', () => {
      expect(sum_to_n_b(100)).toBe(5050);
      expect(sum_to_n_b(1000)).toBe(500500);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for negative numbers', () => {
      expect(() => sum_to_n_b(-1)).toThrow('Input must be non-negative');
    });

    test('should throw error for non-integer inputs', () => {
      expect(() => sum_to_n_b(5.5)).toThrow('Input must be an integer');
    });

    test('should throw error for extremely large numbers', () => {
      expect(() => sum_to_n_b(Number.MAX_SAFE_INTEGER)).toThrow('would produce result exceeding MAX_SAFE_INTEGER');
    });
  });

  describe('Memoization Functionality', () => {
    test('should cache results for reuse', () => {
      clearMemoCache();

      // First call - should compute and cache
      const startTime1 = Date.now();
      const result1 = sum_to_n_b(1000);
      const endTime1 = Date.now();
      const time1 = endTime1 - startTime1;

      // Second call - should use cached result
      const startTime2 = Date.now();
      const result2 = sum_to_n_b(1000);
      const endTime2 = Date.now();
      const time2 = endTime2 - startTime2;

      expect(result1).toBe(result2);
      expect(result1).toBe(500500);

      // Second call should be faster or equal (cached)
      expect(time2).toBeLessThanOrEqual(time1 + 5); // Allow 5ms tolerance
    });

    test('should cache intermediate results', () => {
      clearMemoCache();

      // Calculate sum_to_n_b(10) - this should cache 1 through 10
      sum_to_n_b(10);

      // Now calling sum_to_n_b(5) should be very fast (cached)
      const startTime = Date.now();
      const result = sum_to_n_b(5);
      const endTime = Date.now();

      expect(result).toBe(15);
      expect(endTime - startTime).toBeLessThanOrEqual(10); // Should be very fast
    });

    test('should handle cache clearing', () => {
      // Fill cache
      sum_to_n_b(100);

      // Clear cache
      clearMemoCache();

      // Should work normally after clearing
      expect(sum_to_n_b(5)).toBe(15);
      expect(sum_to_n_b(10)).toBe(55);
    });
  });

  describe('Recursion Limits', () => {
    test('should handle moderately large inputs without stack overflow', () => {
      clearMemoCache();

      expect(() => sum_to_n_b(1000)).not.toThrow();
      expect(sum_to_n_b(1000)).toBe(500500);
    });

    test('should demonstrate recursion limits with very large inputs', () => {
      clearMemoCache();

      // Very large inputs will cause stack overflow (this is expected behavior)
      expect(() => sum_to_n_b(50000)).toThrow('Maximum call stack size exceeded');
    });
  });
});
