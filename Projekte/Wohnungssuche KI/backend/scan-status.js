export const scanStatus = {
  active: false,
  portal: '',
  city: '',
  progress: 0,
  total: 0,
  message: ''
};

export function updateScanStatus(updates) {
  Object.assign(scanStatus, updates);
  console.log(`[Scan Status Update] active=${scanStatus.active}, portal=${scanStatus.portal}, city=${scanStatus.city}, progress=${scanStatus.progress}/${scanStatus.total}, msg=${scanStatus.message}`);
}
