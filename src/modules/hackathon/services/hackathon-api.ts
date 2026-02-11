/**
 * Hackathon module – client API (fetch). Calls backend /api/hackathons.
 */

const API_BASE = '';

export interface HackathonApiShape {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  hostId: string;
  sponsors: { name: string; tier: string }[];
  winners: { projectId: string; projectName: string; prize: string; rank: number; advancedToLaunchPad: boolean }[];
  participants: number;
  status: string;
  judges: { id: string; hackathonId: string; userId: string; name: string; email: string; avatar?: string; invitedAt: string; acceptedAt?: string }[];
  participantList: { id: string; hackathonId: string; userId: string; projectId?: string; projectName?: string; teamName?: string; status: string; invitedVia?: string; registeredAt?: string; submittedAt?: string }[];
  awards: { id: string; hackathonId: string; name: string; description?: string; rank: number; prize: string; projectId?: string; projectName?: string }[];
  criteria: { id: string; hackathonId: string; name: string; description?: string; weight: number; order: number }[];
  invitations: { id: string; hackathonId: string; email: string; userId?: string; role: string; status: string; invitedAt: string; respondedAt?: string; invitedBy: string }[];
  scoreboard?: { projectId: string; projectName: string; totalScore: number; averageScore: number; scoreCount: number; rank?: number }[];
}

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { message?: string }).message || res.statusText || 'Request failed');
  }
  return data as T;
}

export async function apiGetHackathons(): Promise<HackathonApiShape[]> {
  const res = await fetch(`${API_BASE}/api/hackathons`);
  return handleRes<HackathonApiShape[]>(res);
}

export async function apiGetHackathonById(id: string): Promise<HackathonApiShape | null> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return handleRes<HackathonApiShape>(res);
}

export async function apiCreateHackathon(body: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  hostId: string;
  sponsors?: unknown[];
  awards?: { name: string; description?: string; rank: number; prize: string }[];
  criteria?: { name: string; description?: string; weight: number; order?: number }[];
}): Promise<HackathonApiShape> {
  const res = await fetch(`${API_BASE}/api/hackathons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleRes<HackathonApiShape>(res);
}

export async function apiUpdateHackathon(
  id: string,
  patch: Partial<{ name: string; description: string; startDate: string; endDate: string; location: string; sponsors: unknown[]; status: string }>
): Promise<HackathonApiShape> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleRes<HackathonApiShape>(res);
}

export async function apiInvite(body: { hackathonId: string; email: string; userId?: string; role: string; invitedBy: string }): Promise<HackathonApiShape['invitations'][0]> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(body.hackathonId)}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: body.email,
      userId: body.userId,
      role: body.role,
      invitedBy: body.invitedBy,
    }),
  });
  return handleRes(res);
}

export async function apiGetMyParticipation(
  hackathonId: string,
  userId: string
): Promise<HackathonApiShape['participantList'][0] & { pitchText?: string; repoUrl?: string; demoUrl?: string } | null> {
  const res = await fetch(
    `${API_BASE}/api/hackathons/${encodeURIComponent(hackathonId)}/participants/me?userId=${encodeURIComponent(userId)}`
  );
  if (res.status === 404) return null;
  return handleRes(res);
}

export async function apiRegisterParticipant(body: {
  hackathonId: string;
  userId: string;
  projectId?: string;
  projectName?: string;
  teamName?: string;
  invitationId?: string;
  pitchText?: string;
  repoUrl?: string;
  demoUrl?: string;
  attachmentUrl?: string;
}): Promise<HackathonApiShape['participantList'][0] & { pitchText?: string; repoUrl?: string; demoUrl?: string; attachmentUrl?: string }> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(body.hackathonId)}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: body.userId,
      projectId: body.projectId,
      projectName: body.projectName,
      teamName: body.teamName,
      invitationId: body.invitationId,
      pitchText: body.pitchText,
      repoUrl: body.repoUrl,
      demoUrl: body.demoUrl,
      attachmentUrl: body.attachmentUrl,
    }),
  });
  return handleRes(res);
}

export async function apiUpdateParticipant(body: {
  hackathonId: string;
  participantId: string;
  projectId?: string;
  projectName?: string;
  teamName?: string;
  pitchText?: string;
  repoUrl?: string;
  demoUrl?: string;
  attachmentUrl?: string;
}): Promise<HackathonApiShape['participantList'][0] & { pitchText?: string; repoUrl?: string; demoUrl?: string; attachmentUrl?: string }> {
  const res = await fetch(
    `${API_BASE}/api/hackathons/${encodeURIComponent(body.hackathonId)}/participants/${encodeURIComponent(body.participantId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: body.projectId,
        projectName: body.projectName,
        teamName: body.teamName,
        pitchText: body.pitchText,
        repoUrl: body.repoUrl,
        demoUrl: body.demoUrl,
        attachmentUrl: body.attachmentUrl,
      }),
    }
  );
  return handleRes(res);
}

export async function apiAddJudge(body: {
  hackathonId: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
}): Promise<HackathonApiShape['judges'][0]> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(body.hackathonId)}/judges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: body.userId,
      name: body.name,
      email: body.email,
      avatar: body.avatar,
    }),
  });
  return handleRes(res);
}

export async function apiAssignAwardWinner(
  hackathonId: string,
  awardId: string,
  projectId: string,
  projectName: string
): Promise<HackathonApiShape> {
  const res = await fetch(
    `${API_BASE}/api/hackathons/${encodeURIComponent(hackathonId)}/awards/${encodeURIComponent(awardId)}/winner`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, projectName }),
    }
  );
  return handleRes<HackathonApiShape>(res);
}

export async function apiSubmitScore(body: {
  hackathonId: string;
  projectId: string;
  judgeId: string;
  criterionId?: string;
  score: number;
  feedback?: string;
}): Promise<{ id: string; submittedAt: string }> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(body.hackathonId)}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: body.projectId,
      judgeId: body.judgeId,
      criterionId: body.criterionId,
      score: body.score,
      feedback: body.feedback,
    }),
  });
  return handleRes(res);
}

export async function apiGetScoreboard(hackathonId: string): Promise<HackathonApiShape['scoreboard']> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(hackathonId)}/scoreboard`);
  return handleRes(res);
}

export async function apiFinalizeWinners(hackathonId: string): Promise<{ assigned: number; hackathon: HackathonApiShape }> {
  const res = await fetch(`${API_BASE}/api/hackathons/${encodeURIComponent(hackathonId)}/finalize-winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleRes(res);
}
