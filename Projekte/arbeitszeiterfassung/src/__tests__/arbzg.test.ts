import { describe, it, expect } from "vitest";
import { calculateArbZG } from "../arbzg";

describe("Arbeitszeitgesetz (ArbZG §4 & §3) Logic", () => {
  const H1 = 3600 * 1000;

  it("should not deduct mandatory pause for working time <= 6 hours", () => {
    const result = calculateArbZG(5 * H1, 0, true);
    expect(result.mandatoryPauseMs).toBe(0);
    expect(result.effectivePauseMs).toBe(0);
    expect(result.netDurationMs).toBe(5 * H1);
    expect(result.warningMessage).toBeNull();
  });

  it("should mandate 30 minutes pause for working time between 6 and 9 hours when actual break is 0", () => {
    const result = calculateArbZG(7 * H1, 0, true);
    expect(result.mandatoryPauseMs).toBe(30 * 60 * 1000);
    expect(result.effectivePauseMs).toBe(30 * 60 * 1000);
    expect(result.netDurationMs).toBe(7 * H1 - 30 * 60 * 1000);
    expect(result.warningMessage).toContain("Pausenabzug");
  });

  it("should keep actual break if user took more than mandatory break (>30 min for 7h work)", () => {
    const actualPauseMs = 45 * 60 * 1000;
    const result = calculateArbZG(7 * H1, actualPauseMs, true);
    expect(result.mandatoryPauseMs).toBe(30 * 60 * 1000);
    expect(result.effectivePauseMs).toBe(45 * 60 * 1000);
    expect(result.netDurationMs).toBe(7 * H1 - 45 * 60 * 1000);
  });

  it("should mandate 45 minutes pause for working time > 9 hours", () => {
    const result = calculateArbZG(9.5 * H1, 0, true);
    expect(result.mandatoryPauseMs).toBe(45 * 60 * 1000);
    expect(result.effectivePauseMs).toBe(45 * 60 * 1000);
    expect(result.netDurationMs).toBe(9.5 * H1 - 45 * 60 * 1000);
  });

  it("should trigger ArbZG §3 warning when net working time exceeds 10 hours", () => {
    const result = calculateArbZG(11 * H1, 45 * 60 * 1000, true);
    expect(result.exceedsTenHoursLimit).toBe(true);
    expect(result.warningMessage).toContain("10 Stunden");
  });

  it("should bypass mandatory break deduction if disabled in settings", () => {
    const result = calculateArbZG(8 * H1, 0, false);
    expect(result.mandatoryPauseMs).toBe(0);
    expect(result.netDurationMs).toBe(8 * H1);
  });
});
