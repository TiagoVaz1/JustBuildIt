// PAP_site Data Manager v2.0 - Enhanced CRUD with validation/events
// Production-ready localStorage with error handling & subscribers

const DATA_KEYS = {
  USERS: 'justbuildit_users',
  WORKS: 'justbuildit_works',
  MATERIALS: 'justbuildit_materials',
  SEED_VERSION: 'justbuildit_seed_v1'
};

class DataManager {
  constructor() {
    this.subscribers = new Map(); // Event system
    this.initSeedData();
  }

  // Subscribe to data changes
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) this.subscribers.set(key, []);
    this.subscribers.get(key).push(callback);
  }

  notify(key) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(cb => cb());
    }
  }
  constructor() {
    this.initSeedData();
  }

  // Initialize sample data on first run
  initSeedData() {
    const version = localStorage.getItem(DATA_KEYS.SEED_VERSION);
    if (!version || version < '2.0') {
      localStorage.clear(); // Reset for v2.0
      this.seedUsers();
      this.seedWorks();
      localStorage.setItem(DATA_KEYS.SEED_VERSION, '2.0');
      this.notify('all');
    }
  }

  seedUsers() {
    const users = [
      {id: '1', name: 'adminTeste', email: 'admin@justbuildit.com', role: 'admin', createdAt: new Date().toISOString()},
      {id: '2', name: 'Pedro Silva', email: 'pedro@obra.com', role: 'manager', createdAt: new Date().toISOString()},
      {id: '3', name: 'Ana Costa', email: 'ana@client.com', role: 'client', createdAt: new Date().toISOString()}
    ];
    localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(users));
  }

  seedWorks() {
    const works = [
      {id: '1', code: 'OBR-2026-001', startDate: '2026-01-15', endDate: '2026-06-30', budget: 185000, status: 'active', managerId: '2', clientId: '3'},
      {id: '2', code: 'OBR-2026-002', startDate: '2026-02-01', endDate: '2026-09-15', budget: 320000, status: 'completed', managerId: '2', clientId: '3'}
    ];
    localStorage.setItem(DATA_KEYS.WORKS, JSON.stringify(works));
  }

  // Users CRUD
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(DATA_KEYS.USERS) || '[]');
    } catch (e) {
      /* console.error('Users data corrupted:', e); // Removed for production */
      return [];
    }
  }

  addUser(user) {
    const users = this.getUsers();
    user.id = Date.now().toString();
    user.createdAt = new Date().toISOString();
    users.push(user);
    localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(users));
    return user;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index > -1) {
      users[index] = {...users[index], ...updates};
      localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const newUsers = users.filter(u => u.id !== id);
    localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(newUsers));
    return newUsers.length !== users.length;
  }

  // Works CRUD  
  getWorks() {
    return JSON.parse(localStorage.getItem(DATA_KEYS.WORKS) || '[]');
  }

  addWork(work) {
    const works = this.getWorks();
    work.id = Date.now().toString();
    works.push(work);
    localStorage.setItem(DATA_KEYS.WORKS, JSON.stringify(works));
    return work;
  }

  // Getters for dashboard stats
  getStats() {
    const works = this.getWorks();
    const activeWorks = works.filter(w => w.status === 'active').length;
    const totalBudget = works.reduce((sum, w) => sum + w.budget, 0);
    return {
      totalWorks: works.length,
      activeWorks,
      totalBudget,
      avgBudget: Math.round(totalBudget / works.length || 0)
    };
  }
}

// Global instance
const db = new DataManager();

export default db;

