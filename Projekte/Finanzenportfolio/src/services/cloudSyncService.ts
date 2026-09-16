import { encryptData, decryptData } from './cryptoStorage';
import type { Portfolio } from '../types';

export interface WebDavConfig {
  serverUrl: string; // e.g. https://mycloud.example.com/remote.php/dav/files/user/
  username: string;
  password?: string;
  remoteFileName?: string;
  autoSync: boolean;
}

export const DEFAULT_WEBDAV_CONFIG: WebDavConfig = {
  serverUrl: '',
  username: '',
  password: '',
  remoteFileName: 'finanzenportfolio_encrypted_backup.json',
  autoSync: false
};

/**
 * Uploads encrypted portfolio payload to WebDAV/Nextcloud server
 */
export async function uploadToWebDav(
  portfolios: Portfolio[],
  pin: string,
  config: WebDavConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.serverUrl || !config.username || !config.password) {
    return { success: false, message: 'WebDAV Konfiguration unvollständig.' };
  }

  try {
    const rawJson = JSON.stringify(portfolios);
    const encryptedPayload = await encryptData(rawJson, pin);

    let url = config.serverUrl.trim();
    if (!url.endsWith('/')) url += '/';
    url += config.remoteFileName || 'finanzenportfolio_encrypted_backup.json';

    const authHeader = 'Basic ' + btoa(`${config.username}:${config.password}`);

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(encryptedPayload)
    });

    if (res.ok || res.status === 201 || res.status === 204) {
      return { success: true, message: 'Backup erfolgreich verschlüsselt auf Nextcloud/WebDAV synchronisiert!' };
    } else {
      return { success: false, message: `WebDAV Server antwortete mit Status ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, message: `Sync-Fehler: ${err.message || 'Server nicht erreichbar'}` };
  }
}

/**
 * Downloads and decrypts portfolio payload from WebDAV/Nextcloud server
 */
export async function downloadFromWebDav(
  pin: string,
  config: WebDavConfig
): Promise<{ success: boolean; data?: Portfolio[]; message: string }> {
  if (!config.serverUrl || !config.username || !config.password) {
    return { success: false, message: 'WebDAV Konfiguration unvollständig.' };
  }

  try {
    let url = config.serverUrl.trim();
    if (!url.endsWith('/')) url += '/';
    url += config.remoteFileName || 'finanzenportfolio_encrypted_backup.json';

    const authHeader = 'Basic ' + btoa(`${config.username}:${config.password}`);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    });

    if (!res.ok) {
      return { success: false, message: `Datei konnte nicht geladen werden (${res.status})` };
    }

    const encryptedPayload = await res.json();
    const decryptedJson = await decryptData(encryptedPayload, pin);
    const parsed = JSON.parse(decryptedJson);

    if (Array.isArray(parsed)) {
      return { success: true, data: parsed, message: 'Synchronisation erfolgreich geladen!' };
    } else {
      return { success: false, message: 'Ungültiges Datenformat im Backup.' };
    }
  } catch (err: any) {
    return { success: false, message: `Entschlüsselung fehlgeschlagen: Falsche PIN oder Verbindungsfehler.` };
  }
}
