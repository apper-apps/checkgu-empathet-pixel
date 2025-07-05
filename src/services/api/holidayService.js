import mockData from '@/services/mockData/holidays.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const holidayService = {
  async getAll() {
    await delay(300);
    return [...mockData];
  },

  async getById(id) {
    await delay(200);
    const holiday = mockData.find(h => h.Id === id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }
    return { ...holiday };
  },

  async create(holidayData) {
    await delay(400);
    const newHoliday = {
      ...holidayData,
      Id: Math.max(...mockData.map(h => h.Id)) + 1,
    };
    mockData.push(newHoliday);
    return { ...newHoliday };
  },

  async update(id, holidayData) {
    await delay(300);
    const index = mockData.findIndex(h => h.Id === id);
    if (index === -1) {
      throw new Error('Holiday not found');
    }
    mockData[index] = {
      ...mockData[index],
      ...holidayData,
    };
    return { ...mockData[index] };
  },

  async delete(id) {
    await delay(200);
    const index = mockData.findIndex(h => h.Id === id);
    if (index === -1) {
      throw new Error('Holiday not found');
    }
    mockData.splice(index, 1);
    return true;
  },
};