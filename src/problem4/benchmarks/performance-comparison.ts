/**
 * Performance Comparison Benchmark for Sum-to-N Implementations
 */

import { sum_to_n_a, sum_to_n_b, sum_to_n_c, clearMemoCache } from '../src/implementations';

interface BenchmarkResult {
  method: string;
  n: number;
  executionTime: number;
  result: number;
  iterations: number;
}

interface BenchmarkSummary {
  method: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalIterations: number;
  operationsPerSecond: number;
}

/**
 * Get high-precision timing
 */
function getHighPrecisionTime(): number {
  // Use process.hrtime.bigint() for Node.js high precision timing
  if (typeof process !== 'undefined' && process.hrtime && process.hrtime.bigint) {
    return Number(process.hrtime.bigint()) / 1000000; // Convert nanoseconds to milliseconds
  }
  // Fallback to Date.now() * 1000 for microsecond precision simulation
  return Date.now() + Math.random();
}

/**
 * Benchmark a single function with multiple iterations
 */
function benchmarkFunction(
  fn: (n: number) => number,
  methodName: string,
  n: number,
  iterations: number = 1000
): BenchmarkResult {
  const times: number[] = [];
  let result = 0;

  try {
    for (let i = 0; i < iterations; i++) {
      const startTime = getHighPrecisionTime();
      result = fn(n);
      const endTime = getHighPrecisionTime();
      const timeDiff = endTime - startTime;
      times.push(Math.max(timeDiff, 0.001)); // Ensure minimum time to avoid division issues
    }

    const validTimes = times.filter(t => t > 0 && !Number.isNaN(t) && Number.isFinite(t));
    const averageTime = validTimes.length > 0
      ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
      : 0.001; // Fallback minimum time

    return {
      method: methodName,
      n,
      executionTime: Math.max(averageTime, 0.001), // Ensure non-zero time
      result,
      iterations: validTimes.length
    };
  } catch (error: unknown) {
    // Return error result for functions that can't handle this input size
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`⚠️  ${methodName} failed for n=${n}: ${errorMessage}`);
    return {
      method: methodName,
      n,
      executionTime: NaN,
      result: NaN,
      iterations: 0
    };
  }
}

/**
 * Run comprehensive benchmark comparing all three methods
 */
function runPerformanceComparison(): void {
  console.log('🚀 Performance Comparison: Sum-to-N Implementations\n');
  console.log('='.repeat(80));

  const testSizes = [10, 100, 1000, 5000, 10000, 50000];
  const iterations = 100;

  const allResults: BenchmarkResult[] = [];

  for (const n of testSizes) {
    console.log(`\n📊 Testing with n = ${n.toLocaleString()}`);
    console.log('-'.repeat(60));

    // Clear memoization cache before each test set
    clearMemoCache();

    // Benchmark each method
    const methods = [
      { fn: sum_to_n_a, name: 'Iterative Loop' },
      { fn: sum_to_n_b, name: 'Recursive + Memo' },
      { fn: sum_to_n_c, name: 'Mathematical' }
    ];

    const results: BenchmarkResult[] = [];

    for (const { fn, name } of methods) {
      try {
        const result = benchmarkFunction(fn, name, n, iterations);
        results.push(result);
        allResults.push(result);

        const opsPerSecond = result.executionTime > 0 && Number.isFinite(result.executionTime)
          ? (1000 / result.executionTime).toFixed(0)
          : 'N/A';

        const resultDisplay = Number.isNaN(result.result) || !Number.isFinite(result.result)
          ? 'ERROR'
          : result.result.toLocaleString();

        const timeDisplay = Number.isNaN(result.executionTime) || !Number.isFinite(result.executionTime)
          ? 'ERROR'
          : result.executionTime.toFixed(4);

        const status = Number.isNaN(result.result) ? '❌' : '✅';

        console.log(
          `${status} ${name.padEnd(18)}: ${timeDisplay}ms avg | ${opsPerSecond} ops/sec | Result: ${resultDisplay}`
        );
      } catch (error) {
        console.log(`${name.padEnd(20)}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Find the fastest method for this input size (only from successful results)
    const successfulResults = results.filter(r => !Number.isNaN(r.result) && Number.isFinite(r.executionTime));

    if (successfulResults.length > 0) {
      const fastest = successfulResults.reduce((prev, current) =>
        current.executionTime < prev.executionTime ? current : prev
      );

      console.log(`⚡ Fastest: ${fastest.method} (${fastest.executionTime.toFixed(4)}ms)`);

      // Calculate relative performance (only for successful results)
      console.log('\nRelative Performance:');
      successfulResults.forEach(result => {
        const ratio = result.executionTime / fastest.executionTime;
        const percentage = ratio === 1 ? 'FASTEST' : `${ratio.toFixed(1)}x slower`;
        console.log(`  ${result.method.padEnd(20)}: ${percentage}`);
      });
    } else {
      console.log('⚠️  All methods failed for this input size');
    }
  }

  // Overall summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📈 OVERALL PERFORMANCE SUMMARY');
  console.log('='.repeat(80));

  const methods = ['Iterative Loop', 'Recursive + Memo', 'Mathematical'];
  const summaries: BenchmarkSummary[] = methods.map(method => {
    const methodResults = allResults.filter(r => r.method === method && !Number.isNaN(r.result) && Number.isFinite(r.executionTime));

    if (methodResults.length === 0) {
      return {
        method,
        averageTime: NaN,
        minTime: NaN,
        maxTime: NaN,
        totalIterations: 0,
        operationsPerSecond: NaN
      };
    }

    const times = methodResults.map(r => r.executionTime);

    return {
      method,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalIterations: methodResults.reduce((sum, r) => sum + r.iterations, 0),
      operationsPerSecond: times.length > 0 ? 1000 / (times.reduce((sum, time) => sum + time, 0) / times.length) : NaN
    };
  });

  summaries.forEach(summary => {
    console.log(`\n${summary.method}:`);
    if (Number.isNaN(summary.averageTime)) {
      console.log(`  Status: ❌ Failed for all test cases`);
    } else {
      console.log(`  Average Time: ${summary.averageTime.toFixed(4)}ms`);
      console.log(`  Min Time: ${summary.minTime.toFixed(4)}ms`);
      console.log(`  Max Time: ${summary.maxTime.toFixed(4)}ms`);
      console.log(`  Operations/sec: ${summary.operationsPerSecond.toFixed(0)}`);
    }
  });

  // Performance recommendations
  console.log('\n🎯 PERFORMANCE RECOMMENDATIONS');
  console.log('='.repeat(80));
  console.log('• For small inputs (n < 100): All methods perform similarly');
  console.log('• For medium inputs (100 ≤ n < 10,000): Mathematical formula recommended');
  console.log('• For large inputs (n ≥ 10,000): Mathematical formula strongly recommended');
  console.log('• For repeated calculations: Recursive with memoization can be beneficial');
  console.log('• For safety-critical applications: Iterative loop provides predictable performance');

  // Report benchmark completion
  console.log(`\n📊 Benchmark completed with ${allResults.length} data points`);
  const successCount = allResults.filter(r => !Number.isNaN(r.result)).length;
  const failCount = allResults.length - successCount;
  console.log(`   ✅ Successful: ${successCount}, ❌ Failed: ${failCount}`);
}

// Run the benchmark if this file is executed directly
if (require.main === module) {
  runPerformanceComparison();
}

export { runPerformanceComparison };
