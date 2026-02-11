// Direct database operations for frontend
export interface StartupData {
  name: string;
  description: string;
  category: 'Web2' | 'Web3';
  stage: string;
  users?: string;
  growth?: string;
  tagline?: string;
  founded_date?: string;
  founder_name?: string;
  founder_email?: string;
  founder_bio?: string;
  team_size?: string;
  problem?: string;
  solution?: string;
  target_market?: string;
  business_model?: string;
  revenue?: string;
  funding?: string;
  website?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  milestones?: string;
  challenges?: string;
  vision?: string;
  teamMembers?: Array<{
    name: string;
    role?: string;
    bio?: string;
  }>;
}

// Simulate database operations using localStorage for now
// In a real app, you'd use a database connection here
export const databaseClient = {
  async createStartup(data: StartupData) {
    // Simulate database insert
    const startup = {
      id: Date.now(),
      ...data,
      status: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage (in real app, this would be a database insert)
    const existingStartups = this.getAllStartups();
    existingStartups.push(startup);
    localStorage.setItem('startups', JSON.stringify(existingStartups));
    
    return startup;
  },
  
  async getAllStartups() {
    return this.getAllStartups();
  },

  async getAllStartups() {
    const startups = localStorage.getItem('startups');
    return startups ? JSON.parse(startups) : [];
  },

  async getStartupById(id: number) {
    const startups = this.getAllStartups();
    return startups.find((startup: any) => startup.id === id);
  },
  
  async updateStartup(id: number, data: Partial<StartupData>) {
    const startups = this.getAllStartups();
    const index = startups.findIndex((startup: any) => startup.id === id);
    
    if (index !== -1) {
      startups[index] = { ...startups[index], ...data, updated_at: new Date().toISOString() };
      localStorage.setItem('startups', JSON.stringify(startups));
      return startups[index];
    }
    
    throw new Error('Startup not found');
  },
  
  async deleteStartup(id: number) {
    const startups = this.getAllStartups();
    const filteredStartups = startups.filter((startup: any) => startup.id !== id);
    localStorage.setItem('startups', JSON.stringify(filteredStartups));
    return true;
  }
};
