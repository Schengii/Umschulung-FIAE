import { describe, it, expect } from "vitest";
import { calculateDistance, isInsideGeofence } from "../geo";

describe("Geolocation & Geofencing Helper", () => {
  // Brandenburger Tor (Berlin): 52.516275, 13.377704
  // Reichstag (Berlin): 52.5186, 13.3762 (~270m away)
  const officeLat = 52.516275;
  const officeLng = 13.377704;

  it("should return 0 meters for identical coordinates", () => {
    const dist = calculateDistance(officeLat, officeLng, officeLat, officeLng);
    expect(dist).toBe(0);
  });

  it("should calculate correct distance between known coordinates", () => {
    const reichstagLat = 52.5186;
    const reichstagLng = 13.3762;
    const dist = calculateDistance(officeLat, officeLng, reichstagLat, reichstagLng);
    expect(dist).toBeGreaterThan(240);
    expect(dist).toBeLessThan(300);
  });

  it("should correctly identify when user is inside geofence radius", () => {
    // 50m away point
    const nearLat = 52.5165;
    const nearLng = 13.3777;
    const inside = isInsideGeofence(nearLat, nearLng, officeLat, officeLng, 100);
    expect(inside).toBe(true);
  });

  it("should correctly identify when user is outside geofence radius", () => {
    // ~270m away point
    const farLat = 52.5186;
    const farLng = 13.3762;
    const inside = isInsideGeofence(farLat, farLng, officeLat, officeLng, 100);
    expect(inside).toBe(false);
  });
});
