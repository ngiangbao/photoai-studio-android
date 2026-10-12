import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ngiangbao.photoaistudio',
  appName: 'PhotoAI Studio',
  webDir: 'dist',
  // This app has no hosted backend to call from a standalone APK, so all
  // Gemini/Nano Banana/Veo requests go straight from the device to Google's
  // API (see src/services/geminiClient.ts). CapacitorHttp routes fetch/XHR
  // through native OS networking instead of the WebView, which is required
  // here: the WebView's CORS rules would otherwise block those direct calls.
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
