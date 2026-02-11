/**
 * Hackathon module service – CRUD, invites, judging, awards, scores.
 * Uses in-memory store; can be replaced with API calls later.
 */

import type {
  HackathonWithManagement,
  CreateHackathonInput,
  InviteToHackathonInput,
  SubmitScoreInput,
  HackathonParticipant,
  HackathonJudge,
  HackathonAward,
  HackathonInvitation,
  HackathonScore,
  ProjectScoreSummary,
  JudgingCriterion,
} from '../types';

// In-memory store (replace with API)
let hackathonsStore: HackathonWithManagement[] = [];
let invitationsStore: HackathonInvitation[] = [];
let participantsStore: HackathonParticipant[] = [];
let judgesStore: HackathonJudge[] = [];
let awardsStore: HackathonAward[] = [];
let criteriaStore: JudgingCriterion[] = [];
let scoresStore: HackathonScore[] = [];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Seed with initial data (call from store or app init) */
export function seedHackathonModule(initial: {
  hackathons?: HackathonWithManagement[];
  invitations?: HackathonInvitation[];
  participants?: HackathonParticipant[];
  judges?: HackathonJudge[];
  awards?: HackathonAward[];
  criteria?: JudgingCriterion[];
  scores?: HackathonScore[];
}): void {
  if (initial.hackathons?.length) hackathonsStore = [...initial.hackathons];
  if (initial.invitations?.length) invitationsStore = [...initial.invitations];
  if (initial.participants?.length) participantsStore = [...initial.participants];
  if (initial.judges?.length) judgesStore = [...initial.judges];
  if (initial.awards?.length) awardsStore = [...initial.awards];
  if (initial.criteria?.length) criteriaStore = [...initial.criteria];
  if (initial.scores?.length) scoresStore = [...initial.scores];
}

// ---------- Hackathons ----------

export function getHackathons(): HackathonWithManagement[] {
  return [...hackathonsStore];
}

export function getHackathonById(id: string): HackathonWithManagement | undefined {
  return hackathonsStore.find((h) => h.id === id);
}

export function getHackathonsByHost(hostId: string): HackathonWithManagement[] {
  return hackathonsStore.filter((h) => h.hostId === hostId);
}

export function createHackathon(input: CreateHackathonInput): HackathonWithManagement {
  const id = generateId('hack');
  const hackathon: HackathonWithManagement = {
    id,
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    location: input.location,
    hostId: input.hostId,
    sponsors: input.sponsors ?? [],
    winners: [],
    participants: 0,
    status: 'draft',
    judges: [],
    participantList: [],
    awards: (input.awards ?? []).map((a, i) => ({
      id: generateId('award'),
      hackathonId: id,
      name: a.name,
      description: a.description,
      rank: a.rank,
      prize: a.prize,
    })),
    criteria: (input.criteria ?? []).map((c, i) => ({
      id: generateId('crit'),
      hackathonId: id,
      name: c.name,
      description: c.description,
      weight: c.weight,
      order: c.order ?? i,
    })),
    invitations: [],
  };
  hackathonsStore.push(hackathon);
  if (input.awards?.length) {
    awardsStore.push(...hackathon.awards);
  }
  if (input.criteria?.length) {
    criteriaStore.push(...hackathon.criteria);
  }
  return hackathon;
}

export function updateHackathon(
  id: string,
  patch: Partial<Pick<HackathonWithManagement, 'name' | 'description' | 'startDate' | 'endDate' | 'location' | 'sponsors' | 'status'>>
): HackathonWithManagement | undefined {
  const idx = hackathonsStore.findIndex((h) => h.id === id);
  if (idx === -1) return undefined;
  hackathonsStore[idx] = { ...hackathonsStore[idx], ...patch };
  return hackathonsStore[idx];
}

// ---------- Invitations ----------

export function getInvitationsByHackathon(hackathonId: string): HackathonInvitation[] {
  return invitationsStore.filter((i) => i.hackathonId === hackathonId);
}

export function inviteToHackathon(input: InviteToHackathonInput): HackathonInvitation {
  const id = generateId('inv');
  const inv: HackathonInvitation = {
    id,
    hackathonId: input.hackathonId,
    email: input.email ?? '',
    userId: input.userId,
    role: input.role,
    status: 'pending',
    invitedAt: new Date().toISOString(),
    invitedBy: input.invitedBy,
  };
  invitationsStore.push(inv);
  return inv;
}

export function respondToInvitation(
  invitationId: string,
  status: 'accepted' | 'declined',
  userId?: string
): HackathonInvitation | undefined {
  const inv = invitationsStore.find((i) => i.id === invitationId);
  if (!inv) return undefined;
  inv.status = status;
  inv.respondedAt = new Date().toISOString();
  if (userId) inv.userId = userId;
  return inv;
}

// ---------- Participants ----------

export function getParticipantsByHackathon(hackathonId: string): HackathonParticipant[] {
  return participantsStore.filter((p) => p.hackathonId === hackathonId);
}

export function registerParticipant(
  hackathonId: string,
  userId: string,
  projectId: string | undefined,
  projectName: string | undefined,
  teamName?: string,
  invitationId?: string
): HackathonParticipant {
  const id = generateId('part');
  const participant: HackathonParticipant = {
    id,
    hackathonId,
    userId,
    projectId,
    projectName,
    teamName,
    status: projectId ? 'submitted' : 'registered',
    invitedVia: invitationId,
    registeredAt: new Date().toISOString(),
    submittedAt: projectId ? new Date().toISOString() : undefined,
  };
  participantsStore.push(participant);
  const h = hackathonsStore.find((x) => x.id === hackathonId);
  if (h) {
    const m = h as HackathonWithManagement;
    m.participants = (m.participants ?? 0) + 1;
    m.participantList = getParticipantsByHackathon(hackathonId);
  }
  return participant;
}

// ---------- Judges ----------

export function getJudgesByHackathon(hackathonId: string): HackathonJudge[] {
  return judgesStore.filter((j) => j.hackathonId === hackathonId);
}

export function addJudge(
  hackathonId: string,
  userId: string,
  name: string,
  email: string,
  avatar?: string
): HackathonJudge {
  const id = generateId('judge');
  const judge: HackathonJudge = {
    id,
    hackathonId,
    userId,
    name,
    email,
    avatar,
    invitedAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
  };
  judgesStore.push(judge);
  const h = hackathonsStore.find((x) => x.id === hackathonId);
  if (h) (h as HackathonWithManagement).judges = getJudgesByHackathon(hackathonId);
  return judge;
}

// ---------- Awards ----------

export function getAwardsByHackathon(hackathonId: string): HackathonAward[] {
  return awardsStore.filter((a) => a.hackathonId === hackathonId);
}

export function assignAwardWinner(
  awardId: string,
  projectId: string,
  projectName: string
): HackathonAward | undefined {
  const award = awardsStore.find((a) => a.id === awardId);
  if (!award) return undefined;
  award.projectId = projectId;
  award.projectName = projectName;
  return award;
}

// ---------- Criteria ----------

export function getCriteriaByHackathon(hackathonId: string): JudgingCriterion[] {
  return criteriaStore.filter((c) => c.hackathonId === hackathonId).sort((a, b) => a.order - b.order);
}

// ---------- Scores ----------

export function getScoresByHackathon(hackathonId: string): HackathonScore[] {
  return scoresStore.filter((s) => s.hackathonId === hackathonId);
}

export function submitScore(input: SubmitScoreInput): HackathonScore {
  const existing = scoresStore.find(
    (s) =>
      s.hackathonId === input.hackathonId &&
      s.projectId === input.projectId &&
      s.judgeId === input.judgeId &&
      (s.criterionId ?? '') === (input.criterionId ?? '')
  );
  const id = existing?.id ?? generateId('score');
  const score: HackathonScore = {
    id,
    hackathonId: input.hackathonId,
    projectId: input.projectId,
    judgeId: input.judgeId,
    criterionId: input.criterionId,
    score: input.score,
    feedback: input.feedback,
    submittedAt: new Date().toISOString(),
  };
  if (existing) {
    const idx = scoresStore.findIndex((s) => s.id === existing.id);
    if (idx !== -1) scoresStore[idx] = score;
  } else {
    scoresStore.push(score);
  }
  return score;
}

export function getScoreboard(hackathonId: string): ProjectScoreSummary[] {
  const scores = scoresStore.filter((s) => s.hackathonId === hackathonId);
  const criteria = getCriteriaByHackathon(hackathonId);
  const participants = getParticipantsByHackathon(hackathonId).filter((p) => p.projectId);

  const byProject = new Map<string, { total: number; count: number; name: string }>();
  for (const p of participants) {
    if (p.projectId && p.projectName) {
      byProject.set(p.projectId, { total: 0, count: 0, name: p.projectName });
    }
  }
  for (const s of scores) {
    const rec = byProject.get(s.projectId);
    if (rec) {
      rec.total += s.score;
      rec.count += 1;
    }
  }

  const summaries: ProjectScoreSummary[] = [];
  byProject.forEach((v, projectId) => {
    summaries.push({
      projectId,
      projectName: v.name,
      totalScore: v.total,
      averageScore: v.count > 0 ? Math.round((v.total / v.count) * 10) / 10 : 0,
      scoreCount: v.count,
    });
  });
  summaries.sort((a, b) => b.averageScore - a.averageScore);
  summaries.forEach((s, i) => {
    s.rank = i + 1;
  });
  return summaries;
}
