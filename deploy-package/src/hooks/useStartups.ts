import { useQuery } from '@tanstack/react-query';

export interface Startup {
  id: number;
  name: string;
  description: string;
  category: 'Web2' | 'Web3';
  stage: string;
  users: string;
  growth: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const fetchStartups = async (category?: string): Promise<Startup[]> => {
  const url = category ? `${API_BASE_URL}/startups/category/${category}` : `${API_BASE_URL}/startups`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch startups');
  }
  return response.json();
};

export const useStartups = (category?: string) => {
  return useQuery<Startup[]>({
    queryKey: ['startups', category],
    queryFn: () => fetchStartups(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStartupCategories = () => {
  return useQuery<string[]>({
    queryKey: ['startup-categories'],
    queryFn: async () => {
      const startups = await fetchStartups();
      const categories = [...new Set(startups.map(startup => startup.category))];
      return categories;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
