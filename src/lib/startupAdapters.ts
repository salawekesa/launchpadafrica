/**
 * Maps DB startup (from /api/startups) to frontend Project shape
 * so LaunchPad and other pages can display DB data with the same UI.
 */
import type { Project, ProjectStage, Sector } from './types';

export interface DbStartup {
  id: number;
  name: string;
  tagline?: string | null;
  description: string;
  category?: 'Web2' | 'Web3' | string;
  stage?: string | null;
  users?: string | null;
  growth?: string | null;
  problem?: string | null;
  solution?: string | null;
  vision?: string | null;
  funding?: string | null;
  revenue?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

const STAGE_MAP: Record<string, ProjectStage> = {
  seed: 'early_users',
  'series a': 'fundraising',
  'series b': 'scaling',
  'series c': 'scaling',
  mvp: 'mvp_development',
  'pre-seed': 'validated_prototype',
  growth: 'scaling',
  early_users: 'early_users',
  fundraising: 'fundraising',
  scaling: 'scaling',
  validated_prototype: 'validated_prototype',
  mvp_development: 'mvp_development',
  archived: 'archived',
  funded: 'funded',
};

const CATEGORY_TO_SECTOR: Record<string, Sector> = {
  Web2: 'fintech',
  Web3: 'other',
};

function mapStage(dbStage: string | null | undefined): ProjectStage {
  if (!dbStage) return 'early_users';
  const key = String(dbStage).toLowerCase().replace(/\s+/g, '_');
  return STAGE_MAP[key] ?? 'early_users';
}

function mapSector(category: string | null | undefined): Sector {
  if (!category) return 'other';
  return CATEGORY_TO_SECTOR[category] ?? 'other';
}

function parseNumber(val: string | number | null | undefined): number {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/** Convert a DB startup row to the frontend Project type for LaunchPad/ProjectDetail UI */
export function startupToProject(s: DbStartup): Project {
  const fundingAsk = parseNumber(s.funding) || 50000;
  const fundingRaised = 0; // DB doesn't track pledges yet
  const usersNum = parseNumber(s.users);

  return {
    id: String(s.id),
    name: s.name ?? '',
    tagline: s.tagline ?? s.description?.slice(0, 120) ?? '',
    vision: s.vision ?? s.description ?? '',
    problem: s.problem ?? '',
    solution: s.solution ?? '',
    stage: mapStage(s.stage),
    sector: mapSector(s.category),
    origin: 'independent',
    fundingAsk,
    fundingRaised,
    team: [],
    leaderId: '',
    metrics: {
      users: usersNum || undefined,
      growth: parseNumber(s.growth) || undefined,
      revenue: parseNumber(s.revenue) || undefined,
    },
    stageHistory: [],
    communityActivity: 50,
    createdAt: s.created_at ?? new Date().toISOString(),
    updatedAt: s.updated_at ?? new Date().toISOString(),
  };
}
