import mockData from '@/services/mockData/schoolSettings.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const schoolSettingsService = {
  async getSettings() {
    await delay(300);
    return { ...mockData };
  },

  async updateSettings(settingsData) {
    await delay(400);
    Object.assign(mockData, settingsData);
    return { ...mockData };
  },
};