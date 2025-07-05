import mockData from '@/services/mockData/subjects.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const subjectService = {
  async getAll() {
    await delay(300);
    return [...mockData];
  },

  async getById(id) {
    await delay(200);
    const subject = mockData.find(s => s.Id === id);
    if (!subject) {
      throw new Error('Subject not found');
    }
    return { ...subject };
  },

  async create(subjectData) {
    await delay(400);
    const newSubject = {
      ...subjectData,
      Id: Math.max(...mockData.map(s => s.Id)) + 1,
    };
    mockData.push(newSubject);
    return { ...newSubject };
  },

  async update(id, subjectData) {
    await delay(300);
    const index = mockData.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error('Subject not found');
    }
    mockData[index] = {
      ...mockData[index],
      ...subjectData,
    };
    return { ...mockData[index] };
  },

  async delete(id) {
    await delay(200);
    const index = mockData.findIndex(s => s.Id === id);
    if (index === -1) {
      throw new Error('Subject not found');
    }
    mockData.splice(index, 1);
    return true;
  },
};