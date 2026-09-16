/**
 * Linux BPFtrace & Dynamic Kernel Tracing Engine
 * Simulates bpftrace one-liners and scripts (kprobes, tracepoints, uprobes),
 * evaluates map aggregations (count(), hist(), lquantize()), and formats terminal trace output.
 */

export class BpftraceSimulator {
  constructor() {
    this.scripts = {
      vfs_read_hist: {
        title: 'VFS Read Latency Histogram',
        code: 'kprobe:vfs_read { @start[tid] = nsecs; }\nkretprobe:vfs_read /@start[tid]/ { @us = hist((nsecs - @start[tid]) / 1000); delete(@start[tid]); }',
        output: `@us:
[0, 1)               452 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@|
[1, 2)               280 |@@@@@@@@@@@@@@@                         |
[2, 4)                95 |@@@@@                                   |
[4, 8)                24 |@@                                      |
[8, 16)                6 |@                                       |`
      },
      openat_syscalls: {
        title: 'Syscall Openat Tracepoint',
        code: 'tracepoint:syscalls:sys_enter_openat { printf("%-6d %-16s %s\\n", pid, comm, str(args->filename)); }',
        output: `PID    COMM             FILENAME
1402   systemd-journal  /proc/sys/kernel/random/boot_id
2819   dockerd          /var/lib/docker/containers
3410   postgres         /var/lib/postgresql/data/global/1262
5102   node             /app/server.js`
      },
      bash_readline: {
        title: 'User-space Readline Uprobe',
        code: 'uprobe:/bin/bash:readline { printf("User %d executed command: %s\\n", uid, str(retval)); }',
        output: `User 1000 executed command: git status
User 1000 executed command: systemctl restart nginx
User 0    executed command: cat /etc/shadow`
      }
    };
  }

  runScript(scriptKey = 'vfs_read_hist') {
    const selected = this.scripts[scriptKey] || this.scripts.vfs_read_hist;
    return {
      scriptKey,
      title: selected.title,
      code: selected.code,
      output: selected.output,
      probeCount: scriptKey === 'vfs_read_hist' ? 2 : 1,
      attachedEvents: 1450
    };
  }
}
