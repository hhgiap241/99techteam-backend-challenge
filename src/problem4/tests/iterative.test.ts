/**
 * Unit tests for sum_to_n_a (Iterative Loop Implementation)
 */

import { sum_to_n_a } from '../src/implementations';

describe('sum_to_n_a (Iterative Loop)', () => {
  describe('Basic Functionality', () => {
    test('should return 0 for n = 0', () => {
      expect(sum_to_n_a(0)).toBe(0);
    });

    test('should return 1 for n = 1', () => {
      expect(sum_to_n_a(1)).toBe(1);
    });

    test('should return 3 for n = 2', () => {
      expect(sum_to_n_a(2)).toBe(3);
    });

    test('should return 6 for n = 3', () => {
      expect(sum_to_n_a(3)).toBe(6);
    });

    test('should return 15 for n = 5', () => {
      expect(sum_to_n_a(5)).toBe(15);
    });

    test('should return 55 for n = 10', () => {
      expect(sum_to_n_a(10)).toBe(55);
    });

    test('should handle larger numbers correctly', () => {
      expect(sum_to_n_a(100)).toBe(5050);
      expect(sum_to_n_a(1000)).toBe(500500);
    });
  });

  describe('Input Validation', () => {
    test('should throw error for negative numbers', () => {
      expect(() => sum_to_n_a(-1)).toThrow('Input must be non-negative');
    });

    test('should throw error for non-integer inputs', () => {
      expect(() => sum_to_n_a(5.5)).toThrow('Input must be an integer');
    });

    test('should throw error for extremely large numbers', () => {
      expect(() => sum_to_n_a(Number.MAX_SAFE_INTEGER)).toThrow('would produce result exceeding MAX_SAFE_INTEGER');
    });

    test('should handle edge case inputs correctly', () => {
      expect(() => sum_to_n_a(Number.POSITIVE_INFINITY)).toThrow();
      expect(() => sum_to_n_a(Number.NEGATIVE_INFINITY)).toThrow();
      expect(() => sum_to_n_a(NaN)).toThrow();
    });
  });
});
