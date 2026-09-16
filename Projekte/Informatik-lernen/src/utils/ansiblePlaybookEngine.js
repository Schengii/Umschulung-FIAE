/**
 * Ansible Playbook & Idempotenz Simulator Engine
 * IHK Standard für DevOps, Automatisierung & Systemintegration (FISI)
 */

export const DEFAULT_ANSIBLE_INVENTORY = [
  { id: 'web1', name: 'web1.production.internal', group: 'webservers', ip: '10.0.1.10', os: 'ubuntu-22.04' },
  { id: 'web2', name: 'web2.production.internal', group: 'webservers', ip: '10.0.1.11', os: 'ubuntu-22.04' },
  { id: 'db1', name: 'db1.production.internal', group: 'dbservers', ip: '10.0.2.20', os: 'debian-12' }
];

export const DEFAULT_ANSIBLE_PLAYBOOK = {
  name: 'NGINX Webserver Deployment & Security Hardening',
  hosts: 'webservers',
  become: true,
  vars: {
    http_port: 80,
    https_port: 443,
    server_name: 'api.enterprise.de'
  },
  tasks: [
    {
      id: 't1',
      name: 'Paketlisten aktualisieren und NGINX installieren',
      module: 'apt',
      args: { name: 'nginx', state: 'present', update_cache: 'yes' },
      causesChangeOnCleanSystem: true
    },
    {
      id: 't2',
      name: 'Nginx VirtualHost Konfigurations-Template ausrollen',
      module: 'template',
      args: { src: 'nginx.conf.j2', dest: '/etc/nginx/sites-available/default', mode: '0644' },
      causesChangeOnCleanSystem: true,
      notify: 'Nginx Dienst neu starten'
    },
    {
      id: 't3',
      name: 'Dokumenten-Root Verzeichnisrechte absichern',
      module: 'file',
      args: { path: '/var/www/html', state: 'directory', owner: 'www-data', group: 'www-data', mode: '0755' },
      causesChangeOnCleanSystem: true
    },
    {
      id: 't4',
      name: 'NGINX Dienst aktivieren und starten',
      module: 'systemd',
      args: { name: 'nginx', state: 'started', enabled: 'yes' },
      causesChangeOnCleanSystem: true
    }
  ],
  handlers: [
    {
      id: 'h1',
      name: 'Nginx Dienst neu starten',
      module: 'systemd',
      args: { name: 'nginx', state: 'restarted' }
    }
  ]
};

/**
 * Führt einen Ansible Playbook Run auf dem Ziel-System aus
 * @param {Object} playbook Playbook-Definition
 * @param {Array} inventory Server-Liste
 * @param {Object} systemState Aktueller Zustand der Zielserver
 */
export function executeAnsiblePlaybook(playbook = DEFAULT_ANSIBLE_PLAYBOOK, inventory = DEFAULT_ANSIBLE_INVENTORY, systemState = {}) {
  const targetHosts = inventory.filter(h => playbook.hosts === 'all' || h.group === playbook.hosts || h.name === playbook.hosts);
  
  if (targetHosts.length === 0) {
    return {
      success: false,
      error: `Keine passenden Hosts für Gruppe "${playbook.hosts}" im Inventory gefunden.`,
      hostResults: {}
    };
  }

  const hostResults = {};
  const triggeredHandlers = new Set();

  targetHosts.forEach(host => {
    const hostState = systemState[host.id] || { installedPackages: [], files: {}, services: {} };
    const taskLogs = [];
    let hostChangedCount = 0;
    let hostOkCount = 0;
    let hostFailedCount = 0;

    (playbook.tasks || []).forEach(task => {
      let isChanged = false;
      let isFailed = false;

      if (task.module === 'apt') {
        const pkg = task.args.name;
        if (!hostState.installedPackages.includes(pkg)) {
          isChanged = true;
          hostState.installedPackages.push(pkg);
        }
      } else if (task.module === 'template' || task.module === 'copy') {
        const dest = task.args.dest;
        if (!hostState.files[dest]) {
          isChanged = true;
          hostState.files[dest] = { mode: task.args.mode || '0644' };
        }
      } else if (task.module === 'file') {
        const p = task.args.path;
        if (!hostState.files[p]) {
          isChanged = true;
          hostState.files[p] = { mode: task.args.mode || '0755' };
        }
      } else if (task.module === 'systemd' || task.module === 'service') {
        const svc = task.args.name;
        if (!hostState.services[svc] || hostState.services[svc].state !== task.args.state) {
          isChanged = true;
          hostState.services[svc] = { state: task.args.state, enabled: task.args.enabled === 'yes' };
        }
      }

      if (isChanged) {
        hostChangedCount++;
        if (task.notify) triggeredHandlers.add(task.notify);
      } else {
        hostOkCount++;
      }

      taskLogs.push({
        taskId: task.id,
        name: task.name,
        module: task.module,
        status: isFailed ? 'failed' : isChanged ? 'changed' : 'ok'
      });
    });

    // Handlers ausführen wenn getriggert
    const handlerLogs = [];
    (playbook.handlers || []).forEach(handler => {
      if (triggeredHandlers.has(handler.name)) {
        handlerLogs.push({
          name: handler.name,
          module: handler.module,
          status: 'changed'
        });
        hostChangedCount++;
      }
    });

    hostResults[host.id] = {
      host: host.name,
      ip: host.ip,
      taskLogs,
      handlerLogs,
      summary: {
        ok: hostOkCount,
        changed: hostChangedCount,
        unreachable: 0,
        failed: hostFailedCount,
        skipped: 0
      }
    };
  });

  return {
    success: true,
    targetHostCount: targetHosts.length,
    hostResults,
    updatedSystemState: systemState
  };
}

/**
 * Validiert ein Ansible YAML Playbook auf Syntax & Best Practices
 */
export function validateAnsiblePlaybook(playbook) {
  const issues = [];

  if (!playbook || typeof playbook !== 'object') {
    return { isValid: false, issues: ['Playbook ist ungültig oder leer.'] };
  }

  if (!playbook.name) {
    issues.push({ type: 'warning', message: 'Playbook hat keinen beschreibenden "name".' });
  }

  if (!playbook.hosts) {
    issues.push({ type: 'error', message: 'Pflichtfeld "hosts" fehlt.' });
  }

  if (!Array.isArray(playbook.tasks) || playbook.tasks.length === 0) {
    issues.push({ type: 'error', message: 'Playbook enthält keine "tasks".' });
  } else {
    playbook.tasks.forEach((t, i) => {
      if (!t.name) {
        issues.push({ type: 'warning', message: `Task #${i + 1} hat keinen Namen. Best Practice erfordert sprechende Namen.` });
      }
      if (!t.module) {
        issues.push({ type: 'error', message: `Task #${i + 1} ("${t.name || 'unbenannt'}") definiert kein Modul.` });
      }
    });
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    taskCount: Array.isArray(playbook?.tasks) ? playbook.tasks.length : 0
  };
}
