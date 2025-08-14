/**
 * Problem 4: Three Ways to Sum to n
 */

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './implementations';

export function runDemo(): void {
  console.log('🚀 Problem 4: Three Ways to Sum to n\n');

  const testCases = [0, 1, 5, 10, 100, 1000, -10, 5.5, Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER];

  for (const n of testCases) {
    try {
      const a = sum_to_n_a(n);
      const b = sum_to_n_b(n);
      const c = sum_to_n_c(n);

      const allEqual = a === b && b === c;
      const status = allEqual ? '✅ PASS' : '❌ FAIL';

      console.log(`n = ${n.toString().padStart(4)}: a=${a.toString().padStart(8)}, b=${b.toString().padStart(8)}, c=${c.toString().padStart(8)} => ${status}`);
    } catch (error) {
      console.log(`n = ${n.toString().padStart(4)}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n📊 Method Comparison:');
  console.log('- Method A (Loop): Safe, predictable, O(n) time, O(1) space');
  console.log('- Method B (Memo): Elegant, cached results, O(n) time, O(n) space');
  console.log('- Method C (Math): Fastest, O(1) time & space');
}

// Auto-run demo if this file is executed directly
if (require.main === module) {
  runDemo();
}
