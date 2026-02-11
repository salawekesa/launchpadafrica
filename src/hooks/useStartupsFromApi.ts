/**
 * Fetches startups from the backend DB (/api/startups) and exposes them
 * as Project-shaped data for LaunchPad, Landing, etc.
 */
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/lib/types';
import { startupToProject, type DbStartup } from '@/lib/startupAdapters';

// Same origin in production; in dev, Vite proxies /api to backend (see vite.config proxy)
const getApiBase = () => (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';

async function fetchStartups(): Promise<DbStartup[]> {
  const base = getApiBase();
  const url = `${base}/api/startups`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(
      `Cannot reach API (${url}). Is the backend running? Start it with: npm run start`
    );
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) detail = body.message;
      else if (body?.error) detail = body.error;
    } catch {
      // ignore
    }
    throw new Error(`Failed to load startups: ${detail}`);
  }
  return res.json();
}

async function fetchStartupsWithFilter(createdBy?: string): Promise<DbStartup[]> {
  const base = getApiBase();
  const url = createdBy
    ? `${base}/api/startups?created_by=${encodeURIComponent(createdBy)}`
    : `${base}/api/startups`;
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(
      `Cannot reach API (${url}). Is the backend running? Start it with: npm run start`
    );
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) detail = body.message;
      else if (body?.error) detail = body.error;
    } catch {
      // ignore
    }
    throw new Error(`Failed to load startups: ${detail}`);
  }
  return res.json();
}

export function useStartupsFromApi() {
  const query = useQuery<DbStartup[]>({
    queryKey: ['startups'],
    queryFn: () => fetchStartupsWithFilter(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const startups = query.data ?? [];
  const projects: Project[] = startups.map(startupToProject);

  return {
    ...query,
    startups,
    projects,
  };
}

/** Fetches startups created by the given user (for "My startups" in Dashboard). */
export function useMyStartups(userId: string | null) {
  const query = useQuery<DbStartup[]>({
    queryKey: ['startups', 'created_by', userId],
    queryFn: () => fetchStartupsWithFilter(userId ?? undefined),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const startups = query.data ?? [];
  const projects: Project[] = startups.map(startupToProject);

  return {
    ...query,
    startups,
    projects,
  };
}

export async function fetchStartupById(id: number | string): Promise<DbStartup | null> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/startups/${id}`);
  if (!res.ok) return null;
  return res.json();
}
