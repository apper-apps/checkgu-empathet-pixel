import mockData from '@/services/mockData/timetable.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const timetableService = {
  async getAll() {
    await delay(300);
    return [...mockData];
  },

  async getById(id) {
    await delay(200);
    const slot = mockData.find(t => t.Id === id);
    if (!slot) {
      throw new Error('Timetable slot not found');
    }
    return { ...slot };
  },

  async create(slotData) {
    await delay(400);
    const newSlot = {
      ...slotData,
      Id: Math.max(...mockData.map(t => t.Id)) + 1,
    };
    mockData.push(newSlot);
    return { ...newSlot };
  },

  async update(id, slotData) {
    await delay(300);
    const index = mockData.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error('Timetable slot not found');
    }
    mockData[index] = {
      ...mockData[index],
      ...slotData,
    };
    return { ...mockData[index] };
  },

  async delete(id) {
    await delay(200);
    const index = mockData.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error('Timetable slot not found');
    }
    mockData.splice(index, 1);
    return true;
  },
};