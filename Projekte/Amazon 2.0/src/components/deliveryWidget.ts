// ============================================================
// Amazon 2.0 – Delivery Widget Component with Zipcode & Countdown
// ============================================================
import { calculateDeliveryEstimate } from '../utils/deliveryCalculator';
import { readStorage, writeStorage } from '../utils/persist';

let savedZip = readStorage<string>('amz_user_zip', '10115');

export function renderDeliveryWidget(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  const estimate = calculateDeliveryEstimate(savedZip);

  container.innerHTML = `
    <div class="delivery-estimator-box">
      <div class="delivery-estimator-header">
        <span class="delivery-icon">🚚</span>
        <div class="delivery-location">
          <span class="delivery-label">Lieferung nach:</span>
          <button class="delivery-zip-btn" id="changeZipBtn" title="Postleitzahl ändern">
            <strong>${estimate.zipCode} ${estimate.city ? `(${estimate.city})` : ''}</strong> ✏️
          </button>
        </div>
      </div>

      <div class="delivery-timeline">
        ${estimate.sameDayDate ? `
          <div class="delivery-option same-day-option">
            <span class="badge-sameday">⚡ Same-Day Prime</span>
            <span class="delivery-highlight">${estimate.sameDayDate}</span>
          </div>
        ` : ''}
        <div class="delivery-option express-option">
          <span class="delivery-badge-prime">Prime</span>
          <span class="delivery-date-main"><strong>${estimate.expressDate}</strong> bis ${estimate.expressTime}</span>
        </div>
        <div class="delivery-countdown-alert">
          ⏱️ Bestelle innerhalb von <span class="countdown-clock" id="deliveryCountdownClock">${estimate.countdownFormatted}</span>
        </div>
        <div class="delivery-sub-info">
          Standardversand: ${estimate.standardDate} (Kostenlos für Prime-Mitglieder)
        </div>
      </div>
    </div>
  `;

  // Attach zip changer
  const zipBtn = container.querySelector('#changeZipBtn');
  if (zipBtn) {
    zipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newZip = prompt('Bitte gib deine 5-stellige Postleitzahl ein:', savedZip);
      if (newZip && newZip.trim().length >= 4) {
        savedZip = newZip.trim();
        writeStorage('amz_user_zip', savedZip);
        renderDeliveryWidget(containerId);
      }
    });
  }
}
