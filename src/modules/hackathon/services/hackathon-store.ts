/**
 * Hackathon module Zustand store – uses API (database) when available,
 * falls back to in-memory when API is not reachable.
 */

import { create } from 'zustand';
import type {
  HackathonWithManagement,
  CreateHackathonInput,
  InviteToHackathonInput,
  SubmitScoreInput,
  HackathonParticipant,
  HackathonJudge,
  HackathonInvitation,
  ProjectScoreSummary,
  HackathonAward,
  JudgingCriterion,
} from '../types';
import {
  apiGetHackathons,
  apiGetHackathonById,
  apiCreateHackathon,
  apiUpdateHackathon,
  apiInvite,
  apiGetMyParticipation,
  apiRegisterParticipant,
  apiUpdateParticipant,
  apiAddJudge,
  apiAssignAwardWinner,
  apiSubmitScore,
  apiGetScoreboard,
  apiFinalizeWinners,
  type HackathonApiShape,
} from './hackathon-api';
import {
  seedHackathonModule,
  getHackathons as memGetHackathons,
  getHackathonById as memGetHackathonById,
  getHackathonsByHost as memGetHackathonsByHost,
  createHackathon as memCreateHackathon,
  updateHackathon as memUpdateHackathon,
  getInvitationsByHackathon as memGetInvitations,
  inviteToHackathon as memInvite,
  getParticipantsByHackathon as memGetParticipants,
  registerParticipant as memRegisterParticipant,
  getJudgesByHackathon as memGetJudges,
  addJudge as memAddJudge,
  getAwardsByHackathon as memGetAwards,
  assignAwardWinner as memAssignAwardWinner,
  getCriteriaByHackathon as memGetCriteria,
  getScoresByHackathon as memGetScoresByHackathon,
  getScoreboard as memGetScoreboard,
  submitScore as memSubmitScore,
} from './hackathon-service';
import { mockHackathons } from '@/lib/mock-data';

function apiToManaged(h: HackathonApiShape): HackathonWithManagement {
  return {
    id: h.id,
    name: h.name,
    description: h.description,
    startDate: h.startDate,
    endDate: h.endDate,
    location: h.location,
    hostId: h.hostId,
    sponsors: h.sponsors,
    winners: h.winners,
    participants: h.participants,
    status: h.status as HackathonWithManagement['status'],
    image: h.image,
    totalPrize: h.totalPrize,
    techStack: h.techStack,
    level: h.level,
    eventType: h.eventType,
    recommended: h.recommended,
    judges: h.judges,
    participantList: h.participantList,
    awards: h.awards,
    criteria: h.criteria,
    invitations: h.invitations,
    scoreboard: h.scoreboard,
  };
}

let memSeeded = false;
function ensureMemSeeded() {
  if (memSeeded) return;
  memSeeded = true;
  const managed = mockHackathons.map((h) => ({
    ...h,
    hostId: 'user-1',
    judges: [],
    participantList: [],
    awards: (h.winners ?? []).map((w, i) => ({
      id: `award-${h.id}-${i}`,
      hackathonId: h.id,
      name: `Place ${w.rank}`,
      prize: w.prize ?? 'TBD',
      rank: w.rank,
      projectId: w.projectId,
      projectName: w.projectName,
    })),
    criteria: [],
    invitations: [],
    status: h.status as HackathonWithManagement['status'],
  }));
  seedHackathonModule({
    hackathons: managed as HackathonWithManagement[],
    invitations: [],
    participants: [],
    judges: [],
    awards: managed.flatMap((x) => (x as { awards: HackathonAward[] }).awards),
    criteria: [],
    scores: [],
  });
}

interface HackathonState {
  hackathons: HackathonWithManagement[];
  currentHackathon: HackathonWithManagement | null;
  isLoading: boolean;
  error: string | null;
  useDb: boolean;

  loadHackathons: () => Promise<void>;
  loadHackathonById: (id: string) => Promise<void>;
  clearCurrentHackathon: () => void;
  setUseDb: (use: boolean) => void;

  getHackathons: () => HackathonWithManagement[];
  getHackathonById: (id: string) => HackathonWithManagement | undefined;
  getHackathonsByHost: (hostId: string) => HackathonWithManagement[];
  createHackathon: (input: CreateHackathonInput) => Promise<HackathonWithManagement>;
  updateHackathon: (id: string, patch: Partial<Pick<HackathonWithManagement, 'name' | 'description' | 'startDate' | 'endDate' | 'location' | 'sponsors' | 'status'>>) => Promise<HackathonWithManagement | undefined>;

  getInvitations: (hackathonId: string) => HackathonInvitation[];
  invite: (input: InviteToHackathonInput) => Promise<HackathonInvitation>;

  getParticipants: (hackathonId: string) => HackathonParticipant[];
  getMyParticipation: (hackathonId: string, userId: string) => Promise<(HackathonParticipant & { pitchText?: string; repoUrl?: string; demoUrl?: string }) | null>;
  registerParticipant: (
    hackathonId: string,
    userId: string,
    projectId: string | undefined,
    projectName: string | undefined,
    teamName?: string,
    invitationId?: string,
    pitchText?: string,
    repoUrl?: string,
    demoUrl?: string
  ) => Promise<HackathonParticipant>;
  submitProject: (input: {
    hackathonId: string;
    userId: string;
    projectId?: string;
    projectName?: string;
    teamName?: string;
    pitchText?: string;
    repoUrl?: string;
    demoUrl?: string;
    attachmentUrl?: string;
  }) => Promise<HackathonParticipant>;
  finalizeWinners: (hackathonId: string) => Promise<{ assigned: number }>;

  getJudges: (hackathonId: string) => HackathonJudge[];
  addJudge: (hackathonId: string, userId: string, name: string, email: string, avatar?: string) => Promise<HackathonJudge>;

  getAwards: (hackathonId: string) => HackathonAward[];
  assignAwardWinner: (awardId: string, projectId: string, projectName: string) => Promise<HackathonAward | undefined>;

  getCriteria: (hackathonId: string) => JudgingCriterion[];
  getScoreboard: (hackathonId: string) => ProjectScoreSummary[];
  getScoresByHackathon: (hackathonId: string) => ReturnType<typeof memGetScoresByHackathon>;
  submitScore: (input: SubmitScoreInput) => Promise<ReturnType<typeof memSubmitScore>>;
}

export const useHackathonStore = create<HackathonState>((set, get) => ({
  hackathons: [],
  currentHackathon: null,
  isLoading: false,
  error: null,
  useDb: true,

  setUseDb: (use) => set({ useDb: use }),

  loadHackathons: async () => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      set({ hackathons: memGetHackathons().map((h) => h as HackathonWithManagement), error: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const list = await apiGetHackathons();
      set({ hackathons: list.map(apiToManaged), error: null });
    } catch (e) {
      ensureMemSeeded();
      set({
        hackathons: memGetHackathons().map((h) => h as HackathonWithManagement),
        error: e instanceof Error ? e.message : 'Failed to load hackathons',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadHackathonById: async (id: string) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      const h = memGetHackathonById(id);
      set({ currentHackathon: h ? (h as HackathonWithManagement) : null, error: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const full = await apiGetHackathonById(id);
      set({ currentHackathon: full ? apiToManaged(full) : null, error: null });
    } catch (e) {
      ensureMemSeeded();
      const h = memGetHackathonById(id);
      set({
        currentHackathon: h ? (h as HackathonWithManagement) : null,
        error: e instanceof Error ? e.message : 'Failed to load hackathon',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCurrentHackathon: () => set({ currentHackathon: null }),

  getHackathons: () => {
    const { hackathons, useDb } = get();
    if (useDb) return hackathons;
    ensureMemSeeded();
    return memGetHackathons().map((h) => h as HackathonWithManagement);
  },

  getHackathonById: (id: string) => {
    const { currentHackathon, hackathons, useDb } = get();
    if (currentHackathon?.id === id) return currentHackathon;
    const fromList = hackathons.find((h) => h.id === id);
    if (fromList) return fromList;
    if (!useDb) {
      ensureMemSeeded();
      return memGetHackathonById(id) as HackathonWithManagement | undefined;
    }
    return undefined;
  },

  getHackathonsByHost: (hostId: string) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memGetHackathonsByHost(hostId).map((h) => h as HackathonWithManagement);
    }
    return get().hackathons.filter((h) => h.hostId === hostId);
  },

  createHackathon: async (input: CreateHackathonInput) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memCreateHackathon(input) as HackathonWithManagement;
    }
    set({ isLoading: true, error: null });
    try {
      const full = await apiCreateHackathon({
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        location: input.location,
        hostId: input.hostId,
        sponsors: input.sponsors,
        awards: input.awards,
        criteria: input.criteria,
      });
      const managed = apiToManaged(full);
      set((s) => ({ hackathons: [managed, ...s.hackathons], error: null, isLoading: false }));
      return managed;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to create hackathon', isLoading: false });
      ensureMemSeeded();
      return memCreateHackathon(input) as HackathonWithManagement;
    }
  },

  updateHackathon: async (id, patch) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memUpdateHackathon(id, patch) as HackathonWithManagement | undefined;
    }
    set({ isLoading: true, error: null });
    try {
      const full = await apiUpdateHackathon(id, {
        name: patch.name,
        description: patch.description,
        startDate: patch.startDate,
        endDate: patch.endDate,
        location: patch.location,
        sponsors: patch.sponsors,
        status: patch.status,
      });
      const managed = apiToManaged(full);
      set((s) => ({
        hackathons: s.hackathons.map((h) => (h.id === id ? managed : h)),
        currentHackathon: s.currentHackathon?.id === id ? managed : s.currentHackathon,
        error: null,
        isLoading: false,
      }));
      return managed;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to update hackathon', isLoading: false });
      return memUpdateHackathon(id, patch) as HackathonWithManagement | undefined;
    }
  },

  getInvitations: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h) return h.invitations;
    if (!get().useDb) return memGetInvitations(hackathonId);
    return [];
  },

  invite: async (input: InviteToHackathonInput) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memInvite(input);
    }
    try {
      const inv = await apiInvite({
        hackathonId: input.hackathonId,
        email: input.email ?? '',
        userId: input.userId,
        role: input.role,
        invitedBy: input.invitedBy,
      });
      await get().loadHackathonById(input.hackathonId);
      return inv as HackathonInvitation;
    } catch (e) {
      ensureMemSeeded();
      return memInvite(input);
    }
  },

  getParticipants: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h) return h.participantList;
    if (!get().useDb) return memGetParticipants(hackathonId);
    return [];
  },

  getMyParticipation: async (hackathonId: string, userId: string) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      const list = memGetParticipants(hackathonId);
      const p = list.find((x) => x.userId === userId) ?? null;
      return p ? ({ ...p, pitchText: undefined, repoUrl: undefined, demoUrl: undefined } as HackathonParticipant & { pitchText?: string; repoUrl?: string; demoUrl?: string }) : null;
    }
    try {
      return await apiGetMyParticipation(hackathonId, userId);
    } catch {
      return null;
    }
  },

  registerParticipant: async (hackathonId, userId, projectId, projectName, teamName?, invitationId?, pitchText?, repoUrl?, demoUrl?) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memRegisterParticipant(hackathonId, userId, projectId, projectName, teamName, invitationId);
    }
    try {
      const p = await apiRegisterParticipant({
        hackathonId,
        userId,
        projectId,
        projectName,
        teamName,
        invitationId,
        pitchText,
        repoUrl,
        demoUrl,
      });
      await get().loadHackathonById(hackathonId);
      return p as HackathonParticipant;
    } catch (e) {
      ensureMemSeeded();
      return memRegisterParticipant(hackathonId, userId, projectId, projectName, teamName, invitationId);
    }
  },

  submitProject: async (input) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memRegisterParticipant(
        input.hackathonId,
        input.userId,
        input.projectId,
        input.projectName,
        input.teamName,
        undefined
      );
    }
    try {
      const existing = await apiGetMyParticipation(input.hackathonId, input.userId);
      let p: HackathonParticipant;
      if (existing?.id) {
        const updated = await apiUpdateParticipant({
          hackathonId: input.hackathonId,
          participantId: existing.id,
          projectId: input.projectId,
          projectName: input.projectName,
          teamName: input.teamName,
          pitchText: input.pitchText,
          repoUrl: input.repoUrl,
          demoUrl: input.demoUrl,
          attachmentUrl: input.attachmentUrl,
        });
        p = updated as HackathonParticipant;
      } else {
        p = (await apiRegisterParticipant({
          hackathonId: input.hackathonId,
          userId: input.userId,
          projectId: input.projectId,
          projectName: input.projectName,
          teamName: input.teamName,
          pitchText: input.pitchText,
          repoUrl: input.repoUrl,
          demoUrl: input.demoUrl,
          attachmentUrl: input.attachmentUrl,
        })) as HackathonParticipant;
      }
      await get().loadHackathonById(input.hackathonId);
      return p;
    } catch (e) {
      ensureMemSeeded();
      return memRegisterParticipant(
        input.hackathonId,
        input.userId,
        input.projectId,
        input.projectName,
        input.teamName,
        undefined
      );
    }
  },

  finalizeWinners: async (hackathonId: string) => {
    const { useDb } = get();
    if (!useDb) return { assigned: 0 };
    try {
      const result = await apiFinalizeWinners(hackathonId);
      if (result.hackathon) {
        set((s) => ({
          hackathons: s.hackathons.map((h) => (h.id === hackathonId ? apiToManaged(result.hackathon!) : h)),
          currentHackathon: s.currentHackathon?.id === hackathonId ? apiToManaged(result.hackathon!) : s.currentHackathon,
        }));
      }
      return { assigned: result.assigned };
    } catch {
      return { assigned: 0 };
    }
  },

  getJudges: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h) return h.judges;
    if (!get().useDb) return memGetJudges(hackathonId);
    return [];
  },

  addJudge: async (hackathonId, userId, name, email, avatar?) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memAddJudge(hackathonId, userId, name, email, avatar);
    }
    try {
      const j = await apiAddJudge({ hackathonId, userId, name, email, avatar });
      await get().loadHackathonById(hackathonId);
      return j as HackathonJudge;
    } catch (e) {
      ensureMemSeeded();
      return memAddJudge(hackathonId, userId, name, email, avatar);
    }
  },

  getAwards: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h) return h.awards;
    if (!get().useDb) return memGetAwards(hackathonId);
    return [];
  },

  assignAwardWinner: async (awardId, projectId, projectName) => {
    const hackathonId = get().currentHackathon?.id ?? get().hackathons.find((h) => h.awards.some((a) => a.id === awardId))?.id;
    if (!hackathonId) return undefined;
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memAssignAwardWinner(awardId, projectId, projectName);
    }
    try {
      await apiAssignAwardWinner(hackathonId, awardId, projectId, projectName);
      await get().loadHackathonById(hackathonId);
      return get().getAwards(hackathonId).find((a) => a.id === awardId);
    } catch (e) {
      return memAssignAwardWinner(awardId, projectId, projectName);
    }
  },

  getCriteria: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h) return h.criteria;
    if (!get().useDb) return memGetCriteria(hackathonId);
    return [];
  },

  getScoreboard: (hackathonId: string) => {
    const h = get().getHackathonById(hackathonId);
    if (h?.scoreboard) return h.scoreboard;
    if (!get().useDb) return memGetScoreboard(hackathonId);
    return [];
  },

  getScoresByHackathon: (hackathonId: string) => {
    if (!get().useDb) return memGetScoresByHackathon(hackathonId);
    return [];
  },

  submitScore: async (input: SubmitScoreInput) => {
    const { useDb } = get();
    if (!useDb) {
      ensureMemSeeded();
      return memSubmitScore(input);
    }
    try {
      await apiSubmitScore({
        hackathonId: input.hackathonId,
        projectId: input.projectId,
        judgeId: input.judgeId,
        criterionId: input.criterionId,
        score: input.score,
        feedback: input.feedback,
      });
      await get().loadHackathonById(input.hackathonId);
      return { id: '', hackathonId: input.hackathonId, projectId: input.projectId, judgeId: input.judgeId, criterionId: input.criterionId, score: input.score, feedback: input.feedback, submittedAt: new Date().toISOString() };
    } catch (e) {
      ensureMemSeeded();
      return memSubmitScore(input);
    }
  },
}));