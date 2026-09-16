/**
 * 19-Inch Server Rack, UPS (USV) & Data Center HVAC Engine
 */

export const RACK_PRESET_DEVICES = [
  { id: 'dev_server_1u', name: '1HE Dual-Xeon Storage Server', heightU: 1, powerWatts: 250, powerVa: 280, weightKg: 14, type: 'server' },
  { id: 'dev_server_2u', name: '2HE GPU / AI Inference Server', heightU: 2, powerWatts: 650, powerVa: 720, weightKg: 24, type: 'server' },
  { id: 'dev_switch_48p', name: '48-Port Gigabit PoE+ Managed Switch', heightU: 1, powerWatts: 120, powerVa: 140, weightKg: 6, type: 'network' },
  { id: 'dev_core_switch', name: 'Core 10GbE SFP+ Aggregation Switch', heightU: 2, powerWatts: 220, powerVa: 250, weightKg: 10, type: 'network' },
  { id: 'dev_patch_panel', name: '24-Port Cat.6A Keystone Patchfeld', heightU: 1, powerWatts: 0, powerVa: 0, weightKg: 2, type: 'passive' },
  { id: 'dev_firewall', name: 'Enterprise Next-Gen HA Firewall', heightU: 1, powerWatts: 90, powerVa: 105, weightKg: 5, type: 'security' },
  { id: 'dev_ups_3000va', name: '3000VA Online Double-Conversion USV (3HE)', heightU: 3, powerWatts: 60, powerVa: 70, weightKg: 35, type: 'power', batteryWh: 1440 },
  { id: 'dev_cable_mgr', name: '1HE Bürstenleiste & Kabelführung', heightU: 1, powerWatts: 0, powerVa: 0, weightKg: 1, type: 'passive' }
];

/**
 * Calculates total rack load, UPS runtime and HVAC cooling requirements
 */
export function calculateRackMetrics(installedDevices, totalRackU = 42) {
  const usedU = installedDevices.reduce((sum, d) => sum + d.heightU, 0);
  const freeU = Math.max(0, totalRackU - usedU);

  const totalWatts = installedDevices.reduce((sum, d) => sum + (d.powerWatts || 0), 0);
  const totalVa = installedDevices.reduce((sum, d) => sum + (d.powerVa || 0), 0);
  const totalWeightKg = installedDevices.reduce((sum, d) => sum + (d.weightKg || 0), 0);

  // Power Factor cos(phi)
  const powerFactor = totalVa > 0 ? Number((totalWatts / totalVa).toFixed(2)) : 1.0;

  // Thermal dissipation: 1 Watt = 3.412142 BTU/h
  const btuPerHour = Math.round(totalWatts * 3.412142);
  const coolingKwRequired = Number((totalWatts / 1000 * 1.15).toFixed(2)); // +15% safety buffer for RZ climate

  // Find installed UPS battery Wh
  const upsDevices = installedDevices.filter(d => d.batteryWh && d.batteryWh > 0);
  const totalBatteryWh = upsDevices.reduce((sum, d) => sum + d.batteryWh, 0);

  let upsRuntimeMinutes = 0;
  if (totalWatts > 0 && totalBatteryWh > 0) {
    // Standard UPS battery discharge efficiency ~85%
    upsRuntimeMinutes = Math.round(((totalBatteryWh * 0.85) / totalWatts) * 60);
  }

  return {
    totalRackU,
    usedU,
    freeU,
    utilizationPercent: Number(((usedU / totalRackU) * 100).toFixed(1)),
    totalWatts,
    totalVa,
    powerFactor,
    totalWeightKg,
    btuPerHour,
    coolingKwRequired,
    totalBatteryWh,
    upsRuntimeMinutes
  };
}
