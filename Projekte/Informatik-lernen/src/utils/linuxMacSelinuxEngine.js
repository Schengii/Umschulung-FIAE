// @ts-check
/**
 * Linux AppArmor & SELinux Mandatory Access Control (MAC) Engine
 * Compares DAC (chmod/chown) with MAC (Type Enforcement & Path Profiles),
 * simulates AVC (Access Vector Cache) audit denial logs, and tests Enforcing vs. Permissive mode.
 */

/**
 * @typedef {Object} MacSubject
 * @property {string} processName (e.g. "nginx", "apache2")
 * @property {number} uid (e.g. 33 for www-data, 0 for root)
 * @property {string} selinuxDomain (e.g. "httpd_t")
 * @property {string} apparmorProfile (e.g. "/usr/sbin/nginx")
 */

/**
 * @typedef {Object} MacResource
 * @property {string} path (e.g. "/var/www/html/index.html", "/etc/shadow")
 * @property {number} ownerUid
 * @property {string} dacPermissions (e.g. "rwxr-xr-x")
 * @property {string} selinuxType (e.g. "httpd_sys_content_t", "shadow_t")
 * @property {string} apparmorRule (e.g. "r", "rw", "none")
 */

/**
 * Standard System Ressourcen
 * @type {MacResource[]}
 */
export const DEFAULT_MAC_RESOURCES = [
  {
    path: '/var/www/html/index.html',
    ownerUid: 33,
    dacPermissions: 'rw-r--r--',
    selinuxType: 'httpd_sys_content_t',
    apparmorRule: 'r'
  },
  {
    path: '/var/log/nginx/access.log',
    ownerUid: 33,
    dacPermissions: 'rw-r-----',
    selinuxType: 'httpd_log_t',
    apparmorRule: 'rw'
  },
  {
    path: '/etc/shadow',
    ownerUid: 0,
    dacPermissions: 'r--------',
    selinuxType: 'shadow_t',
    apparmorRule: 'none'
  },
  {
    path: '/etc/ssh/sshd_config',
    ownerUid: 0,
    dacPermissions: 'rw-r--r--',
    selinuxType: 'etc_t',
    apparmorRule: 'none'
  }
];

/**
 * Evaluates access under DAC, SELinux, and AppArmor
 * @param {MacSubject} subject
 * @param {MacResource} resource
 * @param {'read' | 'write' | 'execute'} action
 * @param {'Enforcing' | 'Permissive' | 'Disabled'} macMode
 * @param {'SELinux' | 'AppArmor'} macFramework
 */
export function evaluateMacAccess(subject, resource, action, macMode = 'Enforcing', macFramework = 'SELinux') {
  // 1. DAC Evaluation
  const isRoot = subject.uid === 0;
  const isOwner = subject.uid === resource.ownerUid;
  
  let dacAllowed = false;
  if (isRoot) {
    // Root bypasses standard read/write DAC permissions
    dacAllowed = true;
  } else if (isOwner) {
    if (action === 'read' && resource.dacPermissions.slice(0, 1) === 'r') dacAllowed = true;
    if (action === 'write' && resource.dacPermissions.slice(1, 2) === 'w') dacAllowed = true;
    if (action === 'execute' && resource.dacPermissions.slice(2, 3) === 'x') dacAllowed = true;
  } else {
    // Others
    if (action === 'read' && resource.dacPermissions.slice(6, 7) === 'r') dacAllowed = true;
    if (action === 'write' && resource.dacPermissions.slice(7, 8) === 'w') dacAllowed = true;
    if (action === 'execute' && resource.dacPermissions.slice(8, 9) === 'x') dacAllowed = true;
  }

  // 2. MAC Evaluation (Type Enforcement / Path Profile)
  let macPolicyAllowed = false;
  let ruleDetails = '';

  if (macFramework === 'SELinux') {
    // SELinux TE: httpd_t can read httpd_sys_content_t and write httpd_log_t
    if (subject.selinuxDomain === 'httpd_t') {
      if (resource.selinuxType === 'httpd_sys_content_t' && (action === 'read' || action === 'execute')) {
        macPolicyAllowed = true;
        ruleDetails = 'allow httpd_t httpd_sys_content_t:file { read getattr open };';
      } else if (resource.selinuxType === 'httpd_log_t' && (action === 'read' || action === 'write')) {
        macPolicyAllowed = true;
        ruleDetails = 'allow httpd_t httpd_log_t:file { read write append open };';
      } else {
        macPolicyAllowed = false;
        ruleDetails = `Keine TE-Regel für (${subject.selinuxDomain} -> ${resource.selinuxType})`;
      }
    }
  } else {
    // AppArmor Path-based
    if (resource.apparmorRule === 'r' && action === 'read') macPolicyAllowed = true;
    if (resource.apparmorRule === 'rw' && (action === 'read' || action === 'write')) macPolicyAllowed = true;
    ruleDetails = `AppArmor Profil ${subject.apparmorProfile}: ${resource.path} ${resource.apparmorRule}`;
  }

  // Final Decision considering MAC Mode (Enforcing, Permissive, Disabled)
  let finalAllowed = false;
  let avcAuditLog = null;

  if (macMode === 'Disabled') {
    finalAllowed = dacAllowed;
  } else if (!dacAllowed) {
    // DAC fails first: Linux never reaches MAC if DAC denies access
    finalAllowed = false;
  } else {
    // DAC passed, MAC checks next
    if (macPolicyAllowed) {
      finalAllowed = true;
    } else {
      // MAC denied
      if (macMode === 'Permissive') {
        finalAllowed = true; // Permissive logs but permits access!
        avcAuditLog = `type=AVC msg=audit(${Math.floor(Date.now() / 1000)}.123:45): avc: denied { ${action} } for pid=1337 comm="${subject.processName}" path="${resource.path}" dev="sda1" scontext=system_u:system_r:${subject.selinuxDomain}:s0 tcontext=system_u:object_r:${resource.selinuxType}:s0 tclass=file permissive=1`;
      } else {
        // Enforcing
        finalAllowed = false;
        avcAuditLog = `type=AVC msg=audit(${Math.floor(Date.now() / 1000)}.123:45): avc: denied { ${action} } for pid=1337 comm="${subject.processName}" path="${resource.path}" dev="sda1" scontext=system_u:system_r:${subject.selinuxDomain}:s0 tcontext=system_u:object_r:${resource.selinuxType}:s0 tclass=file permissive=0`;
      }
    }
  }

  return {
    finalAllowed,
    dacAllowed,
    macPolicyAllowed,
    macMode,
    ruleDetails,
    avcAuditLog,
    rootBypassAttempted: isRoot && !macPolicyAllowed && macMode === 'Enforcing'
  };
}
