import 'fake-indexeddb/auto';
import { describe, it, expect, beforeAll } from 'vitest';
import {
  saveDatasheet,
  getAllDatasheets,
  deleteDatasheet,
  findMatchingDatasheet,
  saveOfflineTicket,
  getOfflineTickets,
  deleteOfflineTicket,
} from './indexed-db';

describe('indexed-db: Datenblätter', () => {
  beforeAll(async () => {
    await saveDatasheet({ name: 'Dell_E2222H.pdf', modelMatch: 'Dell E2222H', fileData: 'data:application/pdf;base64,123' });
    await saveDatasheet({ name: 'Bosch_GBH_2-28.pdf', modelMatch: 'GBH 2-28', fileData: 'data:application/pdf;base64,456' });
    await saveDatasheet({ name: 'Siemens_S7-1200.pdf', modelMatch: 'Siemens S7', fileData: 'data:application/pdf;base64,789' });
  });

  it('findet ein Datenblatt über den Modellnamen', async () => {
    expect((await findMatchingDatasheet('Bosch GBH 2-28 Bohrhammer'))?.name).toBe('Bosch_GBH_2-28.pdf');
  });

  it('ignoriert Groß-/Kleinschreibung', async () => {
    expect((await findMatchingDatasheet('dell e2222h monitor'))?.name).toBe('Dell_E2222H.pdf');
  });

  it('findet Teiltreffer', async () => {
    expect((await findMatchingDatasheet('Siemens S7 PLC'))?.name).toBe('Siemens_S7-1200.pdf');
  });

  it('liefert null bei unbekanntem Modell oder leerer Eingabe', async () => {
    expect(await findMatchingDatasheet('Unbekanntes Gerät XYZ 999')).toBeNull();
    expect(await findMatchingDatasheet('')).toBeNull();
  });

  it('löscht ein Datenblatt', async () => {
    const all = await getAllDatasheets();
    const dell = all.find(d => d.name === 'Dell_E2222H.pdf');
    expect(dell?.id).toBeDefined();
    await deleteDatasheet(dell!.id!);
    expect((await getAllDatasheets()).some(d => d.name === 'Dell_E2222H.pdf')).toBe(false);
  });
});

describe('indexed-db: Offline-Ticket-Queue', () => {
  it('speichert, liest und löscht Tickets', async () => {
    const id = await saveOfflineTicket({ deviceName: 'Offline-Gerät' });
    expect((await getOfflineTickets()).some(t => t.id === id && t.deviceName === 'Offline-Gerät')).toBe(true);
    await deleteOfflineTicket(id);
    expect((await getOfflineTickets()).some(t => t.id === id)).toBe(false);
  });
});
