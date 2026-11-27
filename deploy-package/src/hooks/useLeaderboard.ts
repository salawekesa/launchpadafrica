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

export interface LeaderboardEntry {
  id: number;
  startup_id: number;
  rank: number;
  growth_rate: string;
  startup: Startup;
}

const API_BASE_URL = 'http://localhost:3001/api';

const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await fetch(`${API_BASE_URL}/leaderboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
};

export const useLeaderboard = () => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
