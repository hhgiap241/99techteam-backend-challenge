# Problem 4: Three Ways to Sum to n

## 📑 Table of Contents

- [🎯 Problem Statement](#-problem-statement)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🏃‍♂️ How to Run](#️-how-to-run)
  - [1. Run Interactive Demo](#1-run-interactive-demo)
  - [2. Run Tests](#2-run-tests)
  - [3. Run Benchmarks](#3-run-benchmarks)
- [🧮 Algorithm Details](#-algorithm-details)
  - [Implementation A: Iterative Approach (`sum_to_n_a`)](#implementation-a-iterative-approach-sum_to_n_a)
  - [Implementation B: Recursive with Memoization (`sum_to_n_b`)](#implementation-b-recursive-with-memoization-sum_to_n_b)
  - [Implementation C: Mathematical Formula (`sum_to_n_c`)](#implementation-c-mathematical-formula-sum_to_n_c)
- [🛡️ Input Validation](#️-input-validation)
- [📊 Performance Characteristics](#-performance-characteristics)
- [📈 Benchmark Results](#-benchmark-results)
- [🎓 Key Learnings](#-key-learnings)

---

## 🎯 Problem Statement

Provide 3 different implementations of a function that computes the sum from 1 to n:

- Implementation A: Using iteration
- Implementation B: Using recursion with memoization
- Implementation C: Using mathematical formula

Each implementation should handle edge cases and provide optimal performance for different scenarios.

## 📁 Project Structure

```
src/problem4/
├── README.md                           # This file
├── package.json                        # Dependencies and scripts
├── jest.config.js                      # Jest configuration
├── src/                                # Source code
│   ├── demo.ts                         # Interactive demonstration
│   ├── implementations/                # Algorithm implementations
│   │   ├── index.ts                    # Export all implementations
│   │   ├── iterative.ts                # Implementation A: Iterative approach
│   │   ├── recursive.ts                # Implementation B: Recursive with memoization
│   │   └── mathematical.ts             # Implementation C: Mathematical formula
│   ├── types/                          # TypeScript type definitions
│   │   └── index.ts                    # Common types and interfaces
│   └── utils/                          # Utility functions
│       ├── validation.ts               # Input validation logic
│       └── metadata.ts                 # Implementation metadata
├── tests/                              # Test suites
│   ├── iterative.test.ts               # Tests for iterative implementation
│   ├── recursive.test.ts               # Tests for recursive implementation
│   └── mathematical.test.ts            # Tests for mathematical implementation
└── benchmarks/                         # Performance benchmarks
    └── performance-comparison.ts       # Comparative performance analysis
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Navigate to the problem4 directory
cd src/problem4

# Install dependencies
npm install
```

## 🏃‍♂️ How to Run

### 1. Run Interactive Demo

The demo showcases all three implementations with various test cases:

```bash
npm run demo
```

This will:

- Test all three implementations with multiple input values
- Show edge case handling (negative numbers, decimals, overflow)
- Demonstrate input validation
- Compare results across implementations

### 2. Run Tests

Execute the comprehensive test suite:

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test iterative.test.ts
npm test recursive.test.ts
npm test mathematical.test.ts
```

The test suite includes:

- Unit tests for each implementation
- Edge case validation
- Performance constraints
- Error handling verification

### 3. Run Benchmarks

Compare performance across all implementations:

```bash
npm run benchmark
```

This will:

- Benchmark each implementation with various input sizes
- Measure execution time and memory usage
- Generate performance comparison reports
- Identify optimal implementation for different scenarios

## 🧮 Algorithm Details

### Implementation A: Iterative Approach (`sum_to_n_a`)

```typescript
/**
 * Advantages:
 * - Simple and easy to understand
 * - Predictable memory usage (constant space)
 * - No risk of stack overflow
 * - Easy to debug and modify
 *
 * Disadvantages:
 * - Linear time complexity
 *
 * Best for: General purpose, educational examples, when simplicity is preferred
 *
 * Time complexity: O(n)
 * Space complexity: O(1)
 */

function sum_to_n_a(n: number): number {
  validateInput(n);

  if (n === 0) return 0;

  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
}
```

### Implementation B: Recursive with Memoization (`sum_to_n_b`)

```typescript
/**
 * Advantages:
 * - Elegant and mathematically intuitive
 * - Memoization prevents redundant calculations
 * - Great educational value for understanding recursion
 * - Efficient for repeated calls with same inputs
 *
 * Disadvantages:
 * - Risk of stack overflow for very large n
 * - Memory overhead for memoization table
 * - Slower than mathematical approach for single calls
 *
 * Best for: When elegance is valued, repeated calculations, moderate input sizes
 *
 * Time complexity: O(n) - first call, O(1) - subsequent calls with memoization
 * Space complexity: O(n) - due to recursion stack and memoization
 */

function sum_to_n_b(n: number): number {
  validateInput(n);

  if (n === 0) return 0;
  if (n === 1) return 1;

  // Check memoization cache
  if (memoCache.has(n)) {
    return memoCache.get(n) || 0;
  }

  // Recursive calculation with memoization
  const result = n + sum_to_n_b(n - 1);
  memoCache.set(n, result);

  return result;
}
```

### Implementation C: Mathematical Formula (`sum_to_n_c`)

```typescript
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

function sum_to_n_c(n: number): number {
  validateInput(n);

  if (n === 0) return 0;

  // Use Gauss's formula: n(n+1)/2
  return (n * (n + 1)) / 2;
}
```

## 🛡️ Input Validation

All implementations include comprehensive validation:

- **Type checking**: Ensures input is a number
- **Integer validation**: Rejects decimal numbers
- **Range validation**: Prevents integer overflow
- **Edge case handling**: Handles negative numbers, zero, and special values

```typescript
// Validation errors for:
n < 0; // "Input must be non-negative"
!Number.isInteger(n); // "Input must be an integer"
n > Number.MAX_SAFE_INTEGER; // "Input too large"
Number.isNaN(n); // "Input must be a valid number"
```

## 📊 Performance Characteristics

| Implementation   | Time Complexity | Space Complexity | Best Use Case                          |
| ---------------- | --------------- | ---------------- | -------------------------------------- |
| Iterative (A)    | O(n)            | O(1)             | Medium inputs, predictable performance |
| Recursive (B)    | O(n)/O(1)\*     | O(n)             | Repeated calls, caching benefits       |
| Mathematical (C) | O(1)            | O(1)             | **Recommended for all cases**          |

\*O(1) for cached results

## 📈 Benchmark Results

Run `npm run benchmark` to see current performance metrics. Expected results:

- **Mathematical (C)**: ~0.0011ms (fastest)
- **Recursive (B)**: ~0.0054ms
- **Iterative (A)**: ~0.0082ms

## 🎓 Key Learnings

1. **Mathematical approach is optimal** for this problem - O(1) time and space
2. **Memoization helps** when the same calculations are repeated
3. **Input validation is crucial** for robust production code
4. **Modular architecture** makes code maintainable and testable
5. **Performance testing** reveals real-world characteristics
