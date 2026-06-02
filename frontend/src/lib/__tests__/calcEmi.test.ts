// src/lib/__tests__/calcEmi.test.ts
/**
 * Unit tests for EMI calculation utilities.
 * Covers normal scenarios, edge cases, and affordability boundaries.
 */

import {
  calcEMI,
  calcTotalPayment,
  calcTotalInterest,
  calcDisposableIncome,
  isAffordable,
} from "../calcEmi";

describe("calcEMI", () => {
  test("valid loan calculation", () => {
    // principal 100,000, interest 12% annual, 12 months
    const emi = calcEMI(100000, 12, 12);
    // Expected EMI calculated via standard formula ~8884.17
    expect(emi).toBeCloseTo(8884.17, 2);
  });

  test("zero interest returns principal/tenure", () => {
    const emi = calcEMI(120000, 0, 12);
    expect(emi).toBeCloseTo(10000, 2);
  });

  test("high interest still returns a number", () => {
    const emi = calcEMI(50000, 50, 24);
    expect(emi).toBeGreaterThan(0);
  });

  test("negative inputs are treated as zero", () => {
    const emi = calcEMI(-50000, -5, -12);
    // All values become 0, result should be 0 (division by zero guarded)
    expect(emi).toBe(0);
  });

  test("NaN inputs fallback to 0", () => {
    // @ts-ignore – deliberately passing NaN
    const emi = calcEMI(NaN, NaN, NaN);
    expect(emi).toBe(0);
  });
});

describe("calcTotalPayment and calcTotalInterest", () => {
  test("total payment matches EMI * months", () => {
    const emi = calcEMI(80000, 10, 10);
    const total = calcTotalPayment(emi, 10);
    expect(total).toBeCloseTo(emi * 10, 2);
  });

  test("interest is total - principal", () => {
    const principal = 80000;
    const emi = calcEMI(principal, 10, 10);
    const total = calcTotalPayment(emi, 10);
    const interest = calcTotalInterest(total, principal);
    expect(interest).toBeCloseTo(total - principal, 2);
  });
});

describe("calcDisposableIncome", () => {
  test("calculates disposable correctly", () => {
    const disposable = calcDisposableIncome(15000, 9000);
    expect(disposable).toBe(6000);
  });
});

describe("isAffordable", () => {
  test("affordable when EMI <= 30% of disposable", () => {
    const disposable = 6000;
    const emi = 1500; // 25%
    expect(isAffordable(emi, disposable)).toBe(true);
  });

  test("not affordable when EMI > 30% of disposable", () => {
    const disposable = 6000;
    const emi = 2500; // >30%
    expect(isAffordable(emi, disposable)).toBe(false);
  });

  test("zero or negative disposable income is not affordable", () => {
    expect(isAffordable(1000, 0)).toBe(false);
    expect(isAffordable(1000, -500)).toBe(false);
  });
});
