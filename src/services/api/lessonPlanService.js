import mockData from '@/services/mockData/lessonPlans.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const lessonPlanService = {
  async getAll() {
    await delay(300);
    return [...mockData];
  },

  async getById(id) {
    await delay(200);
    const plan = mockData.find(p => p.Id === id);
    if (!plan) {
      throw new Error('Lesson plan not found');
    }
    return { ...plan };
  },

  async create(planData) {
    await delay(400);
    const newPlan = {
      ...planData,
      Id: Math.max(...mockData.map(p => p.Id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockData.push(newPlan);
    return { ...newPlan };
  },

  async update(id, planData) {
    await delay(300);
    const index = mockData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error('Lesson plan not found');
    }
    mockData[index] = {
      ...mockData[index],
      ...planData,
      updatedAt: new Date().toISOString(),
    };
    return { ...mockData[index] };
  },

  async delete(id) {
    await delay(200);
    const index = mockData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error('Lesson plan not found');
    }
    mockData.splice(index, 1);
    return true;
},

  async updateContent(id, contentData) {
    await delay(300);
    const index = mockData.findIndex(p => p.Id === id);
    if (index === -1) {
      throw new Error('Lesson plan not found');
    }
    
    // Update the lesson plan with new content
    mockData[index] = {
      ...mockData[index],
      ...contentData,
      updatedAt: new Date().toISOString(),
    };
    
    return { ...mockData[index] };
  },
};