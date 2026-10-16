// ============================================================
// Amazon 2.0 – Cross-Border Customs & Global Tariffs Engine
// ============================================================
import type { Product } from '../types';

export type DestinationCountryCode = 'US' | 'GB' | 'CH' | 'JP' | 'AU' | 'EU';

export interface CustomsDestination {
  code: DestinationCountryCode;
  countryName: string;
  currencyCode: string;
  flagEmoji: string;
  dutyRatePercent: number;
  vatRatePercent: number;
  customsHandlingFeeEur: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
}

export const CUSTOMS_DESTINATIONS: Record<DestinationCountryCode, CustomsDestination> = {
  US: {
    code: 'US',
    countryName: 'Vereinigte Staaten (USA)',
    currencyCode: 'USD',
    flagEmoji: '🇺🇸',
    dutyRatePercent: 0,
    vatRatePercent: 7.5,
    customsHandlingFeeEur: 6.50,
    deliveryDaysMin: 3,
    deliveryDaysMax: 6,
  },
  GB: {
    code: 'GB',
    countryName: 'Großbritannien (UK)',
    currencyCode: 'GBP',
    flagEmoji: '🇬🇧',
    dutyRatePercent: 2.5,
    vatRatePercent: 20.0,
    customsHandlingFeeEur: 8.00,
    deliveryDaysMin: 2,
    deliveryDaysMax: 4,
  },
  CH: {
    code: 'CH',
    countryName: 'Schweiz (CH)',
    currencyCode: 'CHF',
    flagEmoji: '🇨🇭',
    dutyRatePercent: 0,
    vatRatePercent: 8.1,
    customsHandlingFeeEur: 12.00,
    deliveryDaysMin: 1,
    deliveryDaysMax: 3,
  },
  JP: {
    code: 'JP',
    countryName: 'Japan (JP)',
    currencyCode: 'JPY',
    flagEmoji: '🇯🇵',
    dutyRatePercent: 0,
    vatRatePercent: 10.0,
    customsHandlingFeeEur: 7.50,
    deliveryDaysMin: 4,
    deliveryDaysMax: 7,
  },
  AU: {
    code: 'AU',
    countryName: 'Australien (AU)',
    currencyCode: 'AUD',
    flagEmoji: '🇦🇺',
    dutyRatePercent: 5.0,
    vatRatePercent: 10.0,
    customsHandlingFeeEur: 9.00,
    deliveryDaysMin: 5,
    deliveryDaysMax: 9,
  },
  EU: {
    code: 'EU',
    countryName: 'Europäische Union (EU)',
    currencyCode: 'EUR',
    flagEmoji: '🇪🇺',
    dutyRatePercent: 0,
    vatRatePercent: 19.0,
    customsHandlingFeeEur: 0,
    deliveryDaysMin: 1,
    deliveryDaysMax: 2,
  },
};

export interface LandedCostCalculation {
  destination: CustomsDestination;
  productPriceEur: number;
  shippingFeeEur: number;
  hsCode: string;
  dutyAmountEur: number;
  vatAmountEur: number;
  customsFeeEur: number;
  totalLandedCostEur: number;
  isDdpGuaranteed: boolean;
}

export function calculateLandedCost(
  product: Product,
  countryCode: DestinationCountryCode = 'US'
): LandedCostCalculation {
  const destination = CUSTOMS_DESTINATIONS[countryCode] || CUSTOMS_DESTINATIONS.US;
  const productPriceEur = product.price;
  const shippingFeeEur = countryCode === 'EU' ? 0 : countryCode === 'CH' ? 9.90 : 19.90;
  const hsCode = 'HS-8518.30.00 (Kopfhörer/Audio)';

  const dutyAmountEur = +((productPriceEur * (destination.dutyRatePercent / 100))).toFixed(2);
  const taxableBase = productPriceEur + shippingFeeEur + dutyAmountEur;
  const vatAmountEur = +((taxableBase * (destination.vatRatePercent / 100))).toFixed(2);
  const customsFeeEur = destination.customsHandlingFeeEur;

  const totalLandedCostEur = +(productPriceEur + shippingFeeEur + dutyAmountEur + vatAmountEur + customsFeeEur).toFixed(2);

  return {
    destination,
    productPriceEur,
    shippingFeeEur,
    hsCode,
    dutyAmountEur,
    vatAmountEur,
    customsFeeEur,
    totalLandedCostEur,
    isDdpGuaranteed: true,
  };
}
