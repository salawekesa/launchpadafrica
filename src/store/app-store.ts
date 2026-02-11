import { create } from 'zustand';
import type { Project, Hackathon, Pledge, ActivityItem, ProjectStage, Sector } from '@/lib/types';
import { mockProjects, mockHackathons, mockPledges, mockActivities } from '@/lib/mock-data';

interface ProjectFilters {
  stage: ProjectStage | 'all';
  sector: Sector | 'all';
  fundingRange: [number, number];
  showArchived: boolean;
}

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Projects
  projects: Project[];
  projectFilters: ProjectFilters;
  setProjectFilters: (filters: Partial<ProjectFilters>) => void;
  getFilteredProjects: () => Project[];
  getProjectById: (id: string) => Project | undefined;
  
  // Hackathons
  hackathons: Hackathon[];
  getHackathonById: (id: string) => Hackathon | undefined;
  
  // Pledges
  pledges: Pledge[];
  addPledge: (projectId: string, amount: number, investorId: string) => void;
  getPledgesByInvestor: (investorId: string) => Pledge[];
  getPledgesByProject: (projectId: string) => Pledge[];
  
  // Activity
  activities: ActivityItem[];
  
  // Loading states
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  },
  
  // Projects
  projects: mockProjects,
  projectFilters: {
    stage: 'all',
    sector: 'all',
    fundingRange: [0, 500000],
    showArchived: false,
  },
  
  setProjectFilters: (filters) => {
    set((state) => ({
      projectFilters: { ...state.projectFilters, ...filters },
    }));
  },
  
  getFilteredProjects: () => {
    const { projects, projectFilters } = get();
    return projects.filter(project => {
      // Stage filter
      if (projectFilters.stage !== 'all' && project.stage !== projectFilters.stage) {
        return false;
      }
      
      // Sector filter
      if (projectFilters.sector !== 'all' && project.sector !== projectFilters.sector) {
        return false;
      }
      
      // Funding range filter
      if (project.fundingAsk < projectFilters.fundingRange[0] || 
          project.fundingAsk > projectFilters.fundingRange[1]) {
        return false;
      }
      
      // Archived filter
      if (!projectFilters.showArchived && project.stage === 'archived') {
        return false;
      }
      
      return true;
    });
  },
  
  getProjectById: (id) => {
    return get().projects.find(p => p.id === id);
  },
  
  // Hackathons
  hackathons: mockHackathons,
  getHackathonById: (id) => {
    return get().hackathons.find(h => h.id === id);
  },
  
  // Pledges
  pledges: mockPledges,
  
  addPledge: (projectId, amount, investorId) => {
    const newPledge: Pledge = {
      id: `pledge-${Date.now()}`,
      investorId,
      projectId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      pledges: [...state.pledges, newPledge],
      projects: state.projects.map(p => 
        p.id === projectId 
          ? { ...p, fundingRaised: p.fundingRaised + amount }
          : p
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'pledge',
          title: 'New pledge received',
          description: `₳${amount.toLocaleString()} pledge received`,
          projectId,
          timestamp: new Date().toISOString(),
        },
        ...state.activities,
      ],
    }));
  },
  
  getPledgesByInvestor: (investorId) => {
    return get().pledges.filter(p => p.investorId === investorId);
  },
  
  getPledgesByProject: (projectId) => {
    return get().pledges.filter(p => p.projectId === projectId);
  },
  
  // Activity
  activities: mockActivities,
  
  // Loading
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Initialize theme on load
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('dark');
}
