import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.namjin.liferpg',
  appName: 'LifeRPG',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
