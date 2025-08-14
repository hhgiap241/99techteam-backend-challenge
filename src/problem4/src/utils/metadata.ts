/**
 * Function metadata for sum-to-n implementations
 */

export const functionMetadata = {
  sum_to_n_a: {
    methodName: 'Iterative Loop',
    description: 'Simple and predictable iterative approach using a single loop',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  sum_to_n_b: {
    methodName: 'Recursive with Memoization',
    description: 'Classic recursive approach with memoization for performance optimization',
    timeComplexity: 'O(n) first call, O(1) subsequent',
    spaceComplexity: 'O(n)'
  },
  sum_to_n_c: {
    methodName: 'Mathematical Formula (Gauss)',
    description: 'Direct calculation using Gauss arithmetic series formula',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)'
  }
} as const;

/**
 * Get metadata for a specific function
 */
export function getMetadata(functionName: keyof typeof functionMetadata) {
  return functionMetadata[functionName];
}