// Core types for Launch Pad platform

export type UserRole = 'builder' | 'investor' | 'community';

export type VerificationLevel = 'unverified' | 'level1' | 'level2';

export type ProjectStage = 
  | 'hackathon_winner'
  | 'validated_prototype'
  | 'mvp_development'
  | 'early_users'
  | 'revenue'
  | 'fundraising'
  | 'funded'
  | 'scaling'
  | 'archived';

export type ProjectOrigin = 'hackathon' | 'independent';

export type Sector = 
  | 'fintech'
  | 'healthtech'
  | 'edtech'
  | 'agritech'
  | 'cleantech'
  | 'logistics'
  | 'ecommerce'
  | 'govtech'
  | 'research'
  | 'other';

export interface User {
  id: string;
  uid: string; // Web3 UID
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  walletAddress?: string;
  soulboundNFT?: string;
  country: 'Kenya' | 'Nigeria' | 'Other';
  bio?: string;
  hackathonsAttended: string[];
  hackathonsWon: string[];
  collaborations: Collaboration[];
  createdAt: string;
}

export interface Collaboration {
  projectId: string;
  projectName: string;
  teamMembers: TeamMember[];
  result: 'win' | 'loss' | 'ongoing';
  hackathonId?: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  vision: string;
  problem: string;
  solution: string;
  stage: ProjectStage;
  sector: Sector;
  origin: ProjectOrigin;
  hackathonId?: string;
  hackathonName?: string;
  fundingAsk: number; // in ADA
  fundingRaised: number; // in ADA
  team: TeamMember[];
  leaderId: string;
  metrics: ProjectMetrics;
  stageHistory: StageTransition[];
  communityActivity: number; // 0-100 score
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMetrics {
  users?: number;
  revenue?: number;
  growth?: number;
  researchOutput?: string;
}

export interface StageTransition {
  from: ProjectStage;
  to: ProjectStage;
  date: string;
}

export interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  sponsors: Sponsor[];
  winners: HackathonWinner[];
  participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'judging';
  /** Cover image URL (HackQuest-style) */
  image?: string;
  /** Total prize display e.g. "150,000USD", "300USD" */
  totalPrize?: string;
  /** Tech stack tags e.g. ["Solidity", "Python"] */
  techStack?: string[];
  /** Level e.g. "general", "beginner" */
  level?: string;
  /** ONLINE | HYBRID */
  eventType?: 'online' | 'hybrid';
  /** Featured / recommend badge */
  recommended?: boolean;
}

export interface Sponsor {
  name: string;
  logo?: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface HackathonWinner {
  projectId: string;
  projectName: string;
  prize: string;
  rank: number;
  advancedToLaunchPad: boolean;
}

export interface Pledge {
  id: string;
  investorId: string;
  projectId: string;
  amount: number; // in ADA
  status: 'pending' | 'confirmed' | 'withdrawn';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'pledge' | 'project_update' | 'stage_change' | 'team_join' | 'hackathon_win';
  title: string;
  description: string;
  projectId?: string;
  userId?: string;
  timestamp: string;
}

// Stage display configuration
export const STAGE_CONFIG: Record<ProjectStage, { label: string; className: string; order: number }> = {
  hackathon_winner: { label: 'Hackathon Winner', className: 'stage-hackathon', order: 1 },
  validated_prototype: { label: 'Validated Prototype', className: 'stage-validated', order: 2 },
  mvp_development: { label: 'MVP in Development', className: 'stage-mvp', order: 3 },
  early_users: { label: 'Early Users / Pilots', className: 'stage-users', order: 4 },
  revenue: { label: 'Revenue / Research Output', className: 'stage-revenue', order: 5 },
  fundraising: { label: 'Fundraising', className: 'stage-fundraising', order: 6 },
  funded: { label: 'Funded', className: 'stage-funded', order: 7 },
  scaling: { label: 'Scaling / Publication', className: 'stage-scaling', order: 8 },
  archived: { label: 'Archived', className: 'stage-archived', order: 9 },
};

export const SECTOR_LABELS: Record<Sector, string> = {
  fintech: 'FinTech',
  healthtech: 'HealthTech',
  edtech: 'EdTech',
  agritech: 'AgriTech',
  cleantech: 'CleanTech',
  logistics: 'Logistics',
  ecommerce: 'E-Commerce',
  govtech: 'GovTech',
  research: 'Research',
  other: 'Other',
};
