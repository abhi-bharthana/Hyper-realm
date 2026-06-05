// components/os/apps/realm-studio/constants.ts

export const DUMMY_PROJECT = {
  'App.tsx': `import { defineApp } from '@hyper-realm/sdk';

export const WeatherApp = defineApp({
  id: 'com.dev.weather',
  name: 'Weather Now',
  version: '1.0.0',
  permissions: ['notifications', 'storage:drive_write'],

  setup: (api) => {
    console.log('[WeatherApp] Booting up securely!');
  },

  render: (api) => {
    const notify = () => {
      api.notification.show('Weather Alert', 'It might rain today! 🌧️');
    };

    return (
      <div className="p-6 h-full text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-2">24°C 🌤️</h1>
        <p className="text-gray-400 mb-6">Dehradun, India</p>
        
        <button 
          onClick={notify}
          className="px-6 py-3 bg-[#52d9ff]/20 text-[#52d9ff] rounded-full font-bold border border-[#52d9ff]/30 hover:bg-[#52d9ff]/30 transition-all"
        >
          Send Test Alert
        </button>
      </div>
    );
  }
});`,
  'manifest.json': `{
  "id": "com.dev.weather",
  "name": "Weather Now",
  "author": "Hyper Devs",
  "version": "1.0.0",
  "sdk_version": "v2.4",
  "icon": "🌤️"
}`
};