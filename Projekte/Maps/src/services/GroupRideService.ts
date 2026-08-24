import { GroupRideSession, GroupRideMember, LocationPoint } from '../types/navigation';

export class GroupRideService {
  private static currentSession: GroupRideSession | null = null;
  private static listeners: Set<(session: GroupRideSession | null) => void> = new Set();
  private static pingInterval: any = null;

  /**
   * Erstellt eine neue Gruppenfahrt mit einem 6-stelligen Join-Code
   */
  public static createSession(title: string, userLocation: LocationPoint, userName: string = 'Du (Tour-Leiter)'): GroupRideSession {
    const code = `RIDE-${Math.floor(1000 + Math.random() * 9000)}`;

    const leader: GroupRideMember = {
      id: 'member-leader-1',
      name: userName,
      role: 'leader',
      coordinate: userLocation,
      speedKmh: 24,
      batteryPercent: 92,
      distanceFromLeaderMeters: 0,
      status: 'active',
      lastPingTime: Date.now(),
    };

    // Simulierte Gruppenmitglieder (z. B. Freunde auf der Rennrad- oder Wandertour)
    const member2: GroupRideMember = {
      id: 'member-2',
      name: 'Felix (Rennrad)',
      role: 'member',
      coordinate: {
        latitude: userLocation.latitude - 0.002,
        longitude: userLocation.longitude - 0.001,
      },
      speedKmh: 22,
      batteryPercent: 78,
      distanceFromLeaderMeters: 230,
      status: 'active',
      lastPingTime: Date.now(),
    };

    const member3: GroupRideMember = {
      id: 'member-3',
      name: 'Laura (Gravel)',
      role: 'member',
      coordinate: {
        latitude: userLocation.latitude - 0.005,
        longitude: userLocation.longitude - 0.003,
      },
      speedKmh: 20,
      batteryPercent: 65,
      distanceFromLeaderMeters: 560,
      status: 'active',
      lastPingTime: Date.now(),
    };

    this.currentSession = {
      joinCode: code,
      title: title || 'Sonntags-Ausfahrt Isartal',
      leaderId: leader.id,
      members: [leader, member2, member3],
      isActive: true,
    };

    this.startLiveSimulation();
    this.notify();
    return this.currentSession;
  }

  /**
   * Tritt einer bestehenden Gruppenfahrt über Code bei
   */
  public static joinSession(joinCode: string, userLocation: LocationPoint, userName: string = 'Du'): GroupRideSession {
    const leader: GroupRideMember = {
      id: 'member-leader-other',
      name: 'Markus (Guide)',
      role: 'leader',
      coordinate: {
        latitude: userLocation.latitude + 0.003,
        longitude: userLocation.longitude + 0.002,
      },
      speedKmh: 23,
      batteryPercent: 88,
      distanceFromLeaderMeters: 380,
      status: 'active',
      lastPingTime: Date.now(),
    };

    const me: GroupRideMember = {
      id: 'member-me',
      name: userName,
      role: 'member',
      coordinate: userLocation,
      speedKmh: 23,
      batteryPercent: 95,
      distanceFromLeaderMeters: 380,
      status: 'active',
      lastPingTime: Date.now(),
    };

    this.currentSession = {
      joinCode: joinCode.toUpperCase(),
      title: `Gruppe ${joinCode.toUpperCase()}`,
      leaderId: leader.id,
      members: [leader, me],
      isActive: true,
    };

    this.startLiveSimulation();
    this.notify();
    return this.currentSession;
  }

  public static leaveSession() {
    this.currentSession = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.notify();
  }

  public static triggerSOS(memberId: string) {
    if (!this.currentSession) return;
    this.currentSession.members = this.currentSession.members.map(m =>
      m.id === memberId ? { ...m, status: 'breakdown' } : m
    );
    this.notify();
  }

  public static getSession(): GroupRideSession | null {
    return this.currentSession;
  }

  public static subscribe(callback: (session: GroupRideSession | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentSession);
    return () => this.listeners.delete(callback);
  }

  private static startLiveSimulation() {
    if (this.pingInterval) return;
    this.pingInterval = setInterval(() => {
      if (!this.currentSession) return;

      this.currentSession.members = this.currentSession.members.map(m => {
        if (m.role === 'leader') return m;
        // Leichte Positionsbewegungen simulieren
        return {
          ...m,
          coordinate: {
            latitude: m.coordinate.latitude + (Math.random() * 0.0002 - 0.0001),
            longitude: m.coordinate.longitude + (Math.random() * 0.0002 - 0.0001),
          },
          speedKmh: Math.max(10, Math.min(35, m.speedKmh + Math.floor(Math.random() * 3) - 1)),
          lastPingTime: Date.now(),
        };
      });

      this.notify();
    }, 2000);
  }

  private static notify() {
    this.listeners.forEach(cb => cb(this.currentSession));
  }
}
