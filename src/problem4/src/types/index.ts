/**
 * Type definitions and interfaces for sum-to-n implementations
 */

export interface SumToNResult {
  value: number;
  method: string;
  inputValidated: boolean;
  executionTime?: number;
}

export interface SumToNFunction {
  (n: number): number;
  methodName: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
}
