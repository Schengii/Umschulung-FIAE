// Helper for Google API operations

// Initializes GIS Token Client for browser-based OAuth2
export function createTokenClient(clientId, scopes, onTokenReceived) {
  if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
    console.error('Google Identity Services SDK not loaded yet.');
    return null;
  }

  return window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    callback: (response) => {
      if (response.error) {
        console.error('OAuth Error:', response.error);
        return;
      }
      onTokenReceived(response.access_token);
    },
  });
}

// Fetch photos from Google Photos Library API
export async function fetchGooglePhotos(accessToken, nextPageToken = '') {
  const url = `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=20${
    nextPageToken ? `&pageToken=${nextPageToken}` : ''
  }`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to fetch Google Photos');
  }

  return res.json();
}

// Download a photo from Google Photos using its baseUrl
export async function downloadGooglePhoto(baseUrl) {
  // baseUrl + "=d" downloads the photo in original format/resolution
  const res = await fetch(`${baseUrl}=d`);
  if (!res.ok) throw new Error('Failed to download image from Google Photos');
  return res.blob();
}

// List backup files in Google Drive
export async function listDriveBackups(accessToken) {
  const url = `https://www.googleapis.com/drive/v3/files?q=name='urlaubsfotos_backup.json' and trashed=false&fields=files(id, name, createdTime)`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Failed to search Google Drive backups');
  const data = await res.json();
  return data.files || [];
}

// Upload/Save a backup JSON to Google Drive
export async function uploadBackupToDrive(accessToken, dbData, existingFileId = null) {
  const metadata = {
    name: 'urlaubsfotos_backup.json',
    mimeType: 'application/json',
  };

  const fileContent = JSON.stringify(dbData);
  const boundary = 'foo_bar_baz_boundary';
  
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFileId) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
    method = 'PATCH';
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload backup to Google Drive');
  }

  return res.json();
}

// Download/Restore a backup from Google Drive
export async function downloadBackupFromDrive(accessToken, fileId) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error('Failed to download backup from Google Drive');
  return res.json();
}
