/**
 * OS Process Scheduling & Banker's Algorithm Engine
 */

export function simulateScheduler(processes, algorithm = 'FCFS', quantum = 2) {
  if (!processes || processes.length === 0) {
    return { timeline: [], avgTurnaround: 0, avgWaiting: 0, cpuUtilization: 0, processStats: [] };
  }

  // Clone processes to avoid mutation
  const procs = processes.map(p => ({
    id: p.id,
    name: p.name || `P${p.id}`,
    arrival: Number(p.arrival || 0),
    burst: Number(p.burst || 1),
    priority: Number(p.priority || 1),
    remaining: Number(p.burst || 1),
    color: p.color || '#6366f1',
    startTime: null,
    finishTime: null,
    waitingTime: 0,
    turnaroundTime: 0
  }));

  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procs.length;

  if (algorithm === 'FCFS') {
    // Sort primarily by arrival
    procs.sort((a, b) => a.arrival - b.arrival);
    
    while (completed < n) {
      const ready = procs.filter(p => p.arrival <= currentTime && p.remaining > 0);
      if (ready.length === 0) {
        // CPU Idle
        const nextArrival = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrival));
        for (let t = currentTime; t < nextArrival; t++) {
          timeline.push({ time: t, processId: 'IDLE', color: 'var(--bg-tertiary)' });
        }
        currentTime = nextArrival;
        continue;
      }

      const current = ready[0];
      if (current.startTime === null) current.startTime = currentTime;
      
      for (let t = 0; t < current.burst; t++) {
        timeline.push({ time: currentTime + t, processId: current.id, name: current.name, color: current.color });
      }
      currentTime += current.burst;
      current.remaining = 0;
      current.finishTime = currentTime;
      current.turnaroundTime = current.finishTime - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;
      completed++;
    }
  } else if (algorithm === 'SJF') {
    // Shortest Job First (Non-preemptive)
    while (completed < n) {
      const ready = procs.filter(p => p.arrival <= currentTime && p.remaining > 0);
      if (ready.length === 0) {
        const nextArrival = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrival));
        for (let t = currentTime; t < nextArrival; t++) {
          timeline.push({ time: t, processId: 'IDLE', color: 'var(--bg-tertiary)' });
        }
        currentTime = nextArrival;
        continue;
      }

      // Choose shortest burst
      ready.sort((a, b) => a.burst - b.burst || a.arrival - b.arrival);
      const current = ready[0];
      if (current.startTime === null) current.startTime = currentTime;

      for (let t = 0; t < current.burst; t++) {
        timeline.push({ time: currentTime + t, processId: current.id, name: current.name, color: current.color });
      }
      currentTime += current.burst;
      current.remaining = 0;
      current.finishTime = currentTime;
      current.turnaroundTime = current.finishTime - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;
      completed++;
    }
  } else if (algorithm === 'RR') {
    // Round Robin with Quantum
    const queue = [];
    const inQueue = new Set();
    procs.sort((a, b) => a.arrival - b.arrival);

    const checkArrivals = (time, executingProcId = null) => {
      procs.forEach(p => {
        if (p.arrival <= time && p.remaining > 0 && p.id !== executingProcId && !inQueue.has(p.id)) {
          queue.push(p);
          inQueue.add(p.id);
        }
      });
    };

    checkArrivals(currentTime);

    while (completed < n) {
      if (queue.length === 0) {
        const remainingProcs = procs.filter(p => p.remaining > 0);
        if (remainingProcs.length === 0) break;
        const nextArrival = Math.min(...remainingProcs.map(p => p.arrival));
        for (let t = currentTime; t < nextArrival; t++) {
          timeline.push({ time: t, processId: 'IDLE', color: 'var(--bg-tertiary)' });
        }
        currentTime = nextArrival;
        checkArrivals(currentTime);
        continue;
      }

      const current = queue.shift();
      inQueue.delete(current.id);

      if (current.startTime === null) current.startTime = currentTime;
      const executeTime = Math.min(current.remaining, quantum);

      for (let t = 0; t < executeTime; t++) {
        timeline.push({ time: currentTime + t, processId: current.id, name: current.name, color: current.color });
      }

      currentTime += executeTime;
      current.remaining -= executeTime;

      // Check for new arrivals during execution (excluding current)
      checkArrivals(currentTime, current.id);

      if (current.remaining > 0) {
        queue.push(current);
        inQueue.add(current.id);
      } else {
        current.finishTime = currentTime;
        current.turnaroundTime = current.finishTime - current.arrival;
        current.waitingTime = current.turnaroundTime - current.burst;
        completed++;
      }
    }
  } else if (algorithm === 'Priority') {
    // Priority (Lower number = Higher priority)
    while (completed < n) {
      const ready = procs.filter(p => p.arrival <= currentTime && p.remaining > 0);
      if (ready.length === 0) {
        const nextArrival = Math.min(...procs.filter(p => p.remaining > 0).map(p => p.arrival));
        for (let t = currentTime; t < nextArrival; t++) {
          timeline.push({ time: t, processId: 'IDLE', color: 'var(--bg-tertiary)' });
        }
        currentTime = nextArrival;
        continue;
      }

      ready.sort((a, b) => a.priority - b.priority || a.arrival - b.arrival);
      const current = ready[0];
      if (current.startTime === null) current.startTime = currentTime;

      for (let t = 0; t < current.burst; t++) {
        timeline.push({ time: currentTime + t, processId: current.id, name: current.name, color: current.color });
      }
      currentTime += current.burst;
      current.remaining = 0;
      current.finishTime = currentTime;
      current.turnaroundTime = current.finishTime - current.arrival;
      current.waitingTime = current.turnaroundTime - current.burst;
      completed++;
    }
  }

  const totalTurnaround = procs.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
  const totalWaiting = procs.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
  const busyTicks = timeline.filter(t => t.processId !== 'IDLE').length;
  const cpuUtilization = timeline.length > 0 ? (busyTicks / timeline.length) * 100 : 100;

  return {
    timeline,
    avgTurnaround: Number((totalTurnaround / n).toFixed(2)),
    avgWaiting: Number((totalWaiting / n).toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    processStats: procs
  };
}

/**
 * Banker's Algorithm (Bankier-Algorithmus zur Deadlock-Vermeidung)
 */
export function checkBankersSafety(available, maxMatrix, allocMatrix) {
  const numProcesses = allocMatrix.length;
  const numResources = available.length;

  // Calculate Need Matrix: Need[i][j] = Max[i][j] - Alloc[i][j]
  const needMatrix = [];
  for (let i = 0; i < numProcesses; i++) {
    const row = [];
    for (let j = 0; j < numResources; j++) {
      row.push(maxMatrix[i][j] - allocMatrix[i][j]);
    }
    needMatrix.push(row);
  }

  const work = [...available];
  const finish = new Array(numProcesses).fill(false);
  const safeSequence = [];

  let count = 0;
  while (count < numProcesses) {
    let found = false;
    for (let p = 0; p < numProcesses; p++) {
      if (!finish[p]) {
        let canAllocate = true;
        for (let j = 0; j < numResources; j++) {
          if (needMatrix[p][j] > work[j]) {
            canAllocate = false;
            break;
          }
        }

        if (canAllocate) {
          for (let k = 0; k < numResources; k++) {
            work[k] += allocMatrix[p][k];
          }
          safeSequence.push(p);
          finish[p] = true;
          found = true;
          count++;
        }
      }
    }

    if (!found) {
      // Deadlock unsafe state!
      return { isSafe: false, safeSequence: [], needMatrix, work };
    }
  }

  return { isSafe: true, safeSequence, needMatrix, work };
}

export function requestBankersResources(processIdx, request, available, maxMatrix, allocMatrix) {
  const numResources = available.length;
  
  // 1. Check if request <= need
  for (let j = 0; j < numResources; j++) {
    const need = maxMatrix[processIdx][j] - allocMatrix[processIdx][j];
    if (request[j] > need) {
      return { success: false, reason: `Anforderung überschreitet maximalen Bedarf (${request[j]} > ${need})` };
    }
  }

  // 2. Check if request <= available
  for (let j = 0; j < numResources; j++) {
    if (request[j] > available[j]) {
      return { success: false, reason: `Nicht genügend freie Ressourcen vorhanden (${request[j]} > ${available[j]})` };
    }
  }

  // 3. Pretend to allocate
  const newAvailable = [...available];
  const newAlloc = allocMatrix.map(row => [...row]);
  
  for (let j = 0; j < numResources; j++) {
    newAvailable[j] -= request[j];
    newAlloc[processIdx][j] += request[j];
  }

  // 4. Run safety check
  const safety = checkBankersSafety(newAvailable, maxMatrix, newAlloc);
  if (safety.isSafe) {
    return {
      success: true,
      newAvailable,
      newAlloc,
      safeSequence: safety.safeSequence,
      message: `Zustand ist SICHER! Sichere Ausführungsreihenfolge: P${safety.safeSequence.join(' -> P')}`
    };
  } else {
    return {
      success: false,
      reason: 'Anforderung führt zu einem UNSICHEREN Zustand (Deadlock-Gefahr)! System verweigert Zuteilung.'
    };
  }
}
