import { GdprConsentState } from '../types/navigation';

const DEFAULT_GDPR_CONSENT: GdprConsentState = {
  hasAnswered: false,
  locationServices: true, // Requested with explicit permission dialog
  trafficAnalytics: true,
  mediaNewsFeed: true,
  localStorageOnly: true, // Privacy by default
};

export class GdprService {
  private static consent: GdprConsentState = { ...DEFAULT_GDPR_CONSENT };

  public static getConsent(): GdprConsentState {
    return this.consent;
  }

  public static saveConsent(newConsent: Partial<GdprConsentState>): GdprConsentState {
    this.consent = {
      ...this.consent,
      ...newConsent,
      hasAnswered: true,
    };
    return this.consent;
  }

  public static resetConsent(): GdprConsentState {
    this.consent = { ...DEFAULT_GDPR_CONSENT };
    return this.consent;
  }

  public static isPrivacyCompliant(): boolean {
    return this.consent.localStorageOnly;
  }
}
