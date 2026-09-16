/**
 * Linux Systemd Unit Lifecycle & Cgroups v2 Service Engine
 * Simuliert Systemd Service States (inactive, activating, running, failed),
 * Restart-Policies (always, on-failure, no), Cgroups Resource Limits (MemoryMax, CPUQuota)
 * und OOM-Kill-Ereignisse.
 */

export const RESTART_POLICIES = ['no', 'always', 'on-failure', 'on-abort'];

export const DEFAULT_SERVICE_CONFIG = {
  unitName: 'api-backend.service',
  description: 'IT-DevGame REST API Backend Service',
  after: 'network.target postgresql.service',
  type: 'simple',
  execStart: '/usr/bin/node /opt/app/server.js',
  user: 'appuser',
  restart: 'on-failure',
  restartSec: 5,
  memoryMaxMb: 256,
  cpuQuotaPercent: 50,
  wantedBy: 'multi-user.target'
};

/**
 * Generiert ein formatierungsreines systemd Unit-File
 */
export function generateSystemdUnitFile(config = DEFAULT_SERVICE_CONFIG) {
  return `[Unit]
Description=${config.description || 'Custom Service'}
After=${config.after || 'network.target'}
Wants=network-online.target

[Service]
Type=${config.type || 'simple'}
ExecStart=${config.execStart || '/usr/bin/service'}
User=${config.user || 'root'}
Restart=${config.restart || 'on-failure'}
RestartSec=${config.restartSec || 5}s

# Cgroups v2 Resource Accounting & Limits
MemoryMax=${config.memoryMaxMb || 256}M
CPUQuota=${config.cpuQuotaPercent || 50}%

[Install]
WantedBy=${config.wantedBy || 'multi-user.target'}
`;
}

/**
 * Simuliert Zustandsübergänge des Systemd-Dienstes
 */
export function transitionServiceState(currentState, event, config = DEFAULT_SERVICE_CONFIG, currentMemoryMb = 80) {
  let nextState = currentState;
  let logMessage = '';
  let willAutoRestart = false;
  let oomKilled = false;

  switch (event) {
    case 'start':
      if (currentState === 'active') {
        logMessage = `${config.unitName} läuft bereits (active: running).`;
      } else {
        nextState = 'active';
        logMessage = `systemd[1]: Started ${config.description}.`;
      }
      break;

    case 'stop':
      nextState = 'inactive';
      logMessage = `systemd[1]: Stopped ${config.description}.`;
      break;

    case 'restart':
      nextState = 'active';
      logMessage = `systemd[1]: Reloaded and restarted ${config.description}.`;
      break;

    case 'crash':
      if (config.restart === 'always' || config.restart === 'on-failure') {
        nextState = 'restarting';
        willAutoRestart = true;
        logMessage = `systemd[1]: ${config.unitName}: Main process exited, code=exited, status=1/FAILURE. Restarting in ${config.restartSec}s...`;
      } else {
        nextState = 'failed';
        logMessage = `systemd[1]: ${config.unitName}: Failed with result 'exit-code'. Service halted (Restart=${config.restart}).`;
      }
      break;

    case 'simulate_oom':
      if (currentMemoryMb > config.memoryMaxMb) {
        oomKilled = true;
        if (config.restart === 'always' || config.restart === 'on-failure') {
          nextState = 'restarting';
          willAutoRestart = true;
          logMessage = `kernel: cgroups v2 Memory limit reached (${currentMemoryMb}MB > ${config.memoryMaxMb}MB). Out of memory: Killed process. systemd[1]: Restarting in ${config.restartSec}s...`;
        } else {
          nextState = 'failed';
          logMessage = `kernel: Out of memory: Killed process (${currentMemoryMb}MB > ${config.memoryMaxMb}MB). systemd[1]: Unit entered failed state.`;
        }
      } else {
        logMessage = `Speicherverbrauch (${currentMemoryMb}MB) liegt innerhalb des Cgroups-Limits (${config.memoryMaxMb}MB). Kein OOM-Kill.`;
      }
      break;

    default:
      logMessage = `Unbekannter Event-Typ: ${event}`;
  }

  return {
    previousState: currentState,
    nextState,
    event,
    logMessage,
    willAutoRestart,
    oomKilled
  };
}
