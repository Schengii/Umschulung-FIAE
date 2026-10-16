// ============================================================
// Amazon 2.0 – Dynamic Delivery Calculator & Express Countdown
// ============================================================

export interface DeliveryEstimate {
  zipCode: string;
  city?: string;
  isSameDayEligible: boolean;
  sameDayDate?: string;
  sameDayCutoffFormatted?: string;
  expressDate: string;
  expressTime: string;
  standardDate: string;
  hoursLeft: number;
  minutesLeft: number;
  countdownFormatted: string;
  shippingCarrier: string;
}

const METRO_ZIPS: Record<string, string> = {
  '10': 'Berlin',
  '11': 'Berlin',
  '12': 'Berlin',
  '13': 'Berlin',
  '20': 'Hamburg',
  '22': 'Hamburg',
  '80': 'München',
  '81': 'München',
  '50': 'Köln',
  '51': 'Köln',
  '60': 'Frankfurt am Main',
  '70': 'Stuttgart',
  '40': 'Düsseldorf',
  '01': 'Dresden',
  '04': 'Leipzig',
};

const WEEKDAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTHS = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sept.', 'Okt.', 'Nov.', 'Dez.'];

function formatDate(d: Date): string {
  const weekday = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  return `${weekday}, ${day}. ${month}`;
}

export function calculateDeliveryEstimate(
  zipCode: string = '10115',
  currentDate: Date = new Date()
): DeliveryEstimate {
  const cleanZip = zipCode.trim().replace(/\D/g, '');
  const prefix = cleanZip.slice(0, 2);
  const city = METRO_ZIPS[prefix] || (cleanZip.length === 5 ? 'Deutschland' : 'Region');
  const isSameDayEligible = Boolean(METRO_ZIPS[prefix]);

  const currentHour = currentDate.getHours();
  const currentMinute = currentDate.getMinutes();

  // Express Cutoff is 18:00 (6 PM)
  const expressCutoffHour = 18;
  let hoursLeft = 0;
  let minutesLeft = 0;

  if (currentHour < expressCutoffHour) {
    hoursLeft = expressCutoffHour - 1 - currentHour;
    minutesLeft = 60 - currentMinute;
    if (minutesLeft === 60) {
      minutesLeft = 0;
      hoursLeft += 1;
    }
  } else {
    // Cutoff passed for today, countdown to tomorrow's 18:00
    hoursLeft = 24 - currentHour + expressCutoffHour - 1;
    minutesLeft = 60 - currentMinute;
  }

  // Calculate Express Date (Tomorrow or day after if cutoff passed or Sunday)
  const expressDateObj = new Date(currentDate);
  if (currentHour < expressCutoffHour) {
    expressDateObj.setDate(expressDateObj.getDate() + 1);
  } else {
    expressDateObj.setDate(expressDateObj.getDate() + 2);
  }
  if (expressDateObj.getDay() === 0) { // Sunday -> Monday
    expressDateObj.setDate(expressDateObj.getDate() + 1);
  }

  // Standard Date (2-3 business days)
  const standardDateObj = new Date(currentDate);
  standardDateObj.setDate(standardDateObj.getDate() + 2);
  if (standardDateObj.getDay() === 0) standardDateObj.setDate(standardDateObj.getDate() + 1);

  // Same Day Date
  let sameDayDate: string | undefined;
  if (isSameDayEligible && currentHour < 13) {
    sameDayDate = `Heute zwischen 18:00 – 21:00 Uhr`;
  }

  return {
    zipCode: cleanZip || '10115',
    city,
    isSameDayEligible: isSameDayEligible && currentHour < 13,
    sameDayDate,
    sameDayCutoffFormatted: '13:00 Uhr',
    expressDate: formatDate(expressDateObj),
    expressTime: '12:00 Uhr',
    standardDate: formatDate(standardDateObj),
    hoursLeft: Math.max(0, hoursLeft),
    minutesLeft: Math.max(0, minutesLeft),
    countdownFormatted: `${hoursLeft} Std. ${minutesLeft} Min.`,
    shippingCarrier: isSameDayEligible ? 'Amazon Prime Kurier (Same-Day)' : 'DHL Express',
  };
}
