import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.electrocheck.app',
  appName: 'ElectroCheck AI',
  webDir: 'dist',
  server: isProduction
    ? { url: 'https://elektro-check-ai-three.vercel.app', cleartext: false }
    : { androidScheme: 'https' },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: !isProduction
  },
  plugins: {
    Geolocation: {
      androidPermissionRequired: true
    }
  }
};

export default config;
