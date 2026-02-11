/**
 * Hackathon module – database layer (PostgreSQL).
 * Used by the API server; maps DB rows to module types.
 */

import pool from './database';

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Hackathons ----------

export interface DbHackathon {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  host_id: string;
  sponsors: unknown;
  status: string;
  participants_count: number;
  image: string | null;
  total_prize: string | null;
  tech_stack: unknown;
  level: string | null;
  event_type: string | null;
  recommended: boolean | null;
  created_at: string;
  updated_at: string;
}

const hackathonSelect =
  'id, name, description, start_date, end_date, location, host_id, sponsors, status, participants_count, image, total_prize, tech_stack, level, event_type, recommended, created_at, updated_at';

export async function dbGetHackathons(): Promise<DbHackathon[]> {
  const res = await pool.query(
    `SELECT ${hackathonSelect} FROM hackathons ORDER BY start_date DESC`
  );
  return res.rows;
}

export async function dbGetHackathonById(id: string): Promise<DbHackathon | null> {
  const res = await pool.query(
    `SELECT ${hackathonSelect} FROM hackathons WHERE id = $1`,
    [id]
  );
  return res.rows[0] ?? null;
}

export async function dbGetHackathonsByHost(hostId: string): Promise<DbHackathon[]> {
  const res = await pool.query(
    `SELECT ${hackathonSelect} FROM hackathons WHERE host_id = $1 ORDER BY start_date DESC`,
    [hostId]
  );
  return res.rows;
}

export async function dbCreateHackathon(input: {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  host_id: string;
  sponsors?: unknown;
  status?: string;
  image?: string;
  total_prize?: string;
  tech_stack?: unknown;
  level?: string;
  event_type?: string;
  recommended?: boolean;
}): Promise<DbHackathon> {
  const id = input.id ?? genId('hack');
  await pool.query(
    `INSERT INTO hackathons (id, name, description, start_date, end_date, location, host_id, sponsors, status, image, total_prize, tech_stack, level, event_type, recommended)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      id,
      input.name,
      input.description,
      input.start_date,
      input.end_date,
      input.location,
      input.host_id,
      JSON.stringify(input.sponsors ?? []),
      input.status ?? 'draft',
      input.image ?? null,
      input.total_prize ?? null,
      JSON.stringify(input.tech_stack ?? []),
      input.level ?? null,
      input.event_type ?? null,
      input.recommended ?? false,
    ]
  );
  const row = await dbGetHackathonById(id);
  if (!row) throw new Error('Failed to fetch created hackathon');
  return row;
}

export async function dbUpdateHackathon(
  id: string,
  patch: Partial<Pick<DbHackathon, 'name' | 'description' | 'start_date' | 'end_date' | 'location' | 'sponsors' | 'status' | 'image' | 'total_prize' | 'tech_stack' | 'level' | 'event_type' | 'recommended'>>
): Promise<DbHackathon | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(patch.name);
  }
  if (patch.description !== undefined) {
    updates.push(`description = $${i++}`);
    values.push(patch.description);
  }
  if (patch.start_date !== undefined) {
    updates.push(`start_date = $${i++}`);
    values.push(patch.start_date);
  }
  if (patch.end_date !== undefined) {
    updates.push(`end_date = $${i++}`);
    values.push(patch.end_date);
  }
  if (patch.location !== undefined) {
    updates.push(`location = $${i++}`);
    values.push(patch.location);
  }
  if (patch.sponsors !== undefined) {
    updates.push(`sponsors = $${i++}`);
    values.push(JSON.stringify(patch.sponsors));
  }
  if (patch.status !== undefined) {
    updates.push(`status = $${i++}`);
    values.push(patch.status);
  }
  if (patch.image !== undefined) {
    updates.push(`image = $${i++}`);
    values.push(patch.image);
  }
  if (patch.total_prize !== undefined) {
    updates.push(`total_prize = $${i++}`);
    values.push(patch.total_prize);
  }
  if (patch.tech_stack !== undefined) {
    updates.push(`tech_stack = $${i++}`);
    values.push(JSON.stringify(patch.tech_stack));
  }
  if (patch.level !== undefined) {
    updates.push(`level = $${i++}`);
    values.push(patch.level);
  }
  if (patch.event_type !== undefined) {
    updates.push(`event_type = $${i++}`);
    values.push(patch.event_type);
  }
  if (patch.recommended !== undefined) {
    updates.push(`recommended = $${i++}`);
    values.push(patch.recommended);
  }
  if (updates.length === 0) return dbGetHackathonById(id);
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  await pool.query(
    `UPDATE hackathons SET ${updates.join(', ')} WHERE id = $${i}`,
    values
  );
  return dbGetHackathonById(id);
}

// ---------- Winners (for core Hackathon.winners) ----------

export async function dbGetHackathonWinners(hackathonId: string): Promise<
  { id: string; project_id: string | null; project_name: string | null; prize: string | null; rank: number; advanced_to_launch_pad: boolean }[]
> {
  const res = await pool.query(
    'SELECT id, project_id, project_name, prize, rank, advanced_to_launch_pad FROM hackathon_winners WHERE hackathon_id = $1 ORDER BY rank',
    [hackathonId]
  );
  return res.rows;
}

// ---------- Invitations ----------

export async function dbGetInvitationsByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; email: string; user_id: string | null; role: string; status: string; invited_at: string; responded_at: string | null; invited_by: string }[]
> {
  const res = await pool.query(
    'SELECT id, hackathon_id, email, user_id, role, status, invited_at, responded_at, invited_by FROM hackathon_invitations WHERE hackathon_id = $1 ORDER BY invited_at DESC',
    [hackathonId]
  );
  return res.rows;
}

export async function dbCreateInvitation(input: {
  hackathon_id: string;
  email: string;
  user_id?: string;
  role: string;
  invited_by: string;
}): Promise<{ id: string; hackathon_id: string; email: string; user_id: string | null; role: string; status: string; invited_at: string; responded_at: string | null; invited_by: string }> {
  const id = genId('inv');
  await pool.query(
    `INSERT INTO hackathon_invitations (id, hackathon_id, email, user_id, role, status, invited_by)
     VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
    [id, input.hackathon_id, input.email, input.user_id ?? null, input.role, input.invited_by]
  );
  const res = await pool.query(
    'SELECT id, hackathon_id, email, user_id, role, status, invited_at, responded_at, invited_by FROM hackathon_invitations WHERE id = $1',
    [id]
  );
  return res.rows[0];
}

export async function dbUpdateInvitationStatus(
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<{ id: string; hackathon_id: string; email: string; user_id: string | null; role: string; status: string; invited_at: string; responded_at: string | null; invited_by: string } | null> {
  const res = await pool.query(
    `UPDATE hackathon_invitations SET status = $1, responded_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = 'pending'
     RETURNING id, hackathon_id, email, user_id, role, status, invited_at, responded_at, invited_by`,
    [status, invitationId]
  );
  return res.rows[0] ?? null;
}

export async function dbGetInvitationById(invitationId: string): Promise<{ id: string; hackathon_id: string; email: string; user_id: string | null; role: string; status: string; invited_at: string; responded_at: string | null; invited_by: string } | null> {
  const res = await pool.query(
    'SELECT id, hackathon_id, email, user_id, role, status, invited_at, responded_at, invited_by FROM hackathon_invitations WHERE id = $1',
    [invitationId]
  );
  return res.rows[0] ?? null;
}

export async function dbGetPendingInvitationsByEmail(email: string): Promise<
  { id: string; hackathon_id: string; email: string; user_id: string | null; role: string; status: string; invited_at: string; responded_at: string | null; invited_by: string }[]
> {
  const res = await pool.query(
    `SELECT id, hackathon_id, email, user_id, role, status, invited_at, responded_at, invited_by
     FROM hackathon_invitations WHERE LOWER(email) = LOWER($1) AND status = 'pending' ORDER BY invited_at DESC`,
    [email]
  );
  return res.rows;
}

// ---------- Participants ----------

const participantSelect =
  'id, hackathon_id, user_id, project_id, project_name, team_name, status, invited_via, registered_at, submitted_at, pitch_text, repo_url, demo_url, attachment_url';

export async function dbGetParticipantsByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; user_id: string; project_id: string | null; project_name: string | null; team_name: string | null; status: string; invited_via: string | null; registered_at: string; submitted_at: string | null; pitch_text: string | null; repo_url: string | null; demo_url: string | null; attachment_url: string | null }[]
> {
  const res = await pool.query(
    `SELECT ${participantSelect} FROM hackathon_participants WHERE hackathon_id = $1 ORDER BY registered_at DESC`,
    [hackathonId]
  );
  return res.rows;
}

export async function dbGetParticipantByHackathonAndUser(
  hackathonId: string,
  userId: string
): Promise<{ id: string; hackathon_id: string; user_id: string; project_id: string | null; project_name: string | null; team_name: string | null; status: string; invited_via: string | null; registered_at: string; submitted_at: string | null; pitch_text: string | null; repo_url: string | null; demo_url: string | null; attachment_url: string | null } | null> {
  const res = await pool.query(
    `SELECT ${participantSelect} FROM hackathon_participants WHERE hackathon_id = $1 AND user_id = $2 LIMIT 1`,
    [hackathonId, userId]
  );
  return res.rows[0] ?? null;
}

export async function dbCreateParticipant(input: {
  hackathon_id: string;
  user_id: string;
  project_id?: string;
  project_name?: string;
  team_name?: string;
  invited_via?: string;
  pitch_text?: string;
  repo_url?: string;
  demo_url?: string;
  attachment_url?: string;
}): Promise<{ id: string; hackathon_id: string; user_id: string; project_id: string | null; project_name: string | null; team_name: string | null; status: string; invited_via: string | null; registered_at: string; submitted_at: string | null; pitch_text: string | null; repo_url: string | null; demo_url: string | null; attachment_url: string | null }> {
  const existing = await dbGetParticipantByHackathonAndUser(input.hackathon_id, input.user_id);
  if (existing) {
    return dbUpdateParticipant(existing.id, {
      project_id: input.project_id,
      project_name: input.project_name,
      team_name: input.team_name,
      pitch_text: input.pitch_text,
      repo_url: input.repo_url,
      demo_url: input.demo_url,
    });
  }
  const id = genId('part');
  const status = input.project_id ? 'submitted' : 'registered';
  const submittedAt = input.project_id ? new Date().toISOString() : null;
  await pool.query(
    `INSERT INTO hackathon_participants (id, hackathon_id, user_id, project_id, project_name, team_name, status, invited_via, submitted_at, pitch_text, repo_url, demo_url, attachment_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      input.hackathon_id,
      input.user_id,
      input.project_id ?? null,
      input.project_name ?? null,
      input.team_name ?? null,
      status,
      input.invited_via ?? null,
      submittedAt,
      input.pitch_text ?? null,
      input.repo_url ?? null,
      input.demo_url ?? null,
      input.attachment_url ?? null,
    ]
  );
  await pool.query(
    'UPDATE hackathons SET participants_count = participants_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [input.hackathon_id]
  );
  const res = await pool.query(`SELECT ${participantSelect} FROM hackathon_participants WHERE id = $1`, [id]);
  return res.rows[0];
}

export async function dbUpdateParticipant(
  participantId: string,
  patch: {
    project_id?: string;
    project_name?: string;
    team_name?: string;
    pitch_text?: string;
    repo_url?: string;
    demo_url?: string;
    attachment_url?: string;
  }
): Promise<{ id: string; hackathon_id: string; user_id: string; project_id: string | null; project_name: string | null; team_name: string | null; status: string; invited_via: string | null; registered_at: string; submitted_at: string | null; pitch_text: string | null; repo_url: string | null; demo_url: string | null; attachment_url: string | null } | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.project_id !== undefined) {
    updates.push(`project_id = $${i++}`);
    values.push(patch.project_id);
  }
  if (patch.project_name !== undefined) {
    updates.push(`project_name = $${i++}`);
    values.push(patch.project_name);
  }
  if (patch.team_name !== undefined) {
    updates.push(`team_name = $${i++}`);
    values.push(patch.team_name);
  }
  if (patch.pitch_text !== undefined) {
    updates.push(`pitch_text = $${i++}`);
    values.push(patch.pitch_text);
  }
  if (patch.repo_url !== undefined) {
    updates.push(`repo_url = $${i++}`);
    values.push(patch.repo_url);
  }
  if (patch.demo_url !== undefined) {
    updates.push(`demo_url = $${i++}`);
    values.push(patch.demo_url);
  }
  if (patch.attachment_url !== undefined) {
    updates.push(`attachment_url = $${i++}`);
    values.push(patch.attachment_url);
  }
  if (updates.length === 0) {
    const r = await pool.query(`SELECT ${participantSelect} FROM hackathon_participants WHERE id = $1`, [participantId]);
    return r.rows[0] ?? null;
  }
  const hasProject = patch.project_id !== undefined || patch.project_name !== undefined;
  if (hasProject) {
    updates.push(`status = 'submitted'`);
    updates.push(`submitted_at = CURRENT_TIMESTAMP`);
  }
  values.push(participantId);
  await pool.query(
    `UPDATE hackathon_participants SET ${updates.join(', ')} WHERE id = $${i}`,
    values
  );
  const res = await pool.query(`SELECT ${participantSelect} FROM hackathon_participants WHERE id = $1`, [participantId]);
  return res.rows[0] ?? null;
}

// ---------- Judges ----------

export async function dbGetJudgesByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; user_id: string; name: string; email: string; avatar: string | null; invited_at: string; accepted_at: string | null }[]
> {
  const res = await pool.query(
    'SELECT id, hackathon_id, user_id, name, email, avatar, invited_at, accepted_at FROM hackathon_judges WHERE hackathon_id = $1 ORDER BY invited_at',
    [hackathonId]
  );
  return res.rows;
}

export async function dbCreateJudge(input: {
  hackathon_id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
}): Promise<{ id: string; hackathon_id: string; user_id: string; name: string; email: string; avatar: string | null; invited_at: string; accepted_at: string | null }> {
  const id = genId('judge');
  const acceptedAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO hackathon_judges (id, hackathon_id, user_id, name, email, avatar, accepted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, input.hackathon_id, input.user_id, input.name, input.email, input.avatar ?? null, acceptedAt]
  );
  const res = await pool.query(
    'SELECT id, hackathon_id, user_id, name, email, avatar, invited_at, accepted_at FROM hackathon_judges WHERE id = $1',
    [id]
  );
  return res.rows[0];
}

// ---------- Awards ----------

export async function dbGetAwardsByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; name: string; description: string | null; rank: number; prize: string | null; project_id: string | null; project_name: string | null }[]
> {
  const res = await pool.query(
    'SELECT id, hackathon_id, name, description, rank, prize, project_id, project_name FROM hackathon_awards WHERE hackathon_id = $1 ORDER BY rank',
    [hackathonId]
  );
  return res.rows;
}

export async function dbCreateAwards(
  hackathonId: string,
  awards: { name: string; description?: string; rank: number; prize: string }[]
): Promise<void> {
  for (const a of awards) {
    const id = genId('award');
    await pool.query(
      `INSERT INTO hackathon_awards (id, hackathon_id, name, description, rank, prize) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, hackathonId, a.name, a.description ?? null, a.rank, a.prize]
    );
  }
}

export async function dbAssignAwardWinner(awardId: string, projectId: string, projectName: string): Promise<boolean> {
  const res = await pool.query(
    'UPDATE hackathon_awards SET project_id = $1, project_name = $2 WHERE id = $3',
    [projectId, projectName, awardId]
  );
  if ((res.rowCount ?? 0) === 0) return false;
  const awardRow = await pool.query(
    'SELECT hackathon_id, rank, prize FROM hackathon_awards WHERE id = $1',
    [awardId]
  );
  const a = awardRow.rows[0];
  if (a) await dbSyncWinnersFromAwards(a.hackathon_id);
  return true;
}

/** Auto-assign winners from scoreboard rank and set hackathon to completed */
export async function dbFinalizeWinners(hackathonId: string): Promise<{ assigned: number }> {
  const [scoreboard, awards] = await Promise.all([
    dbGetScoreboard(hackathonId),
    dbGetAwardsByHackathon(hackathonId),
  ]);
  let assigned = 0;
  const awardsByRank = awards.slice().sort((a, b) => a.rank - b.rank);
  for (let i = 0; i < Math.min(awardsByRank.length, scoreboard.length); i++) {
    const award = awardsByRank[i];
    const project = scoreboard[i];
    if (!award || !project?.projectId || !project?.projectName) continue;
    const ok = await dbAssignAwardWinner(award.id, project.projectId, project.projectName);
    if (ok) assigned += 1;
  }
  await dbUpdateHackathon(hackathonId, { status: 'completed' });
  return { assigned };
}

/** Sync hackathon_winners from hackathon_awards (project_id assigned) */
export async function dbSyncWinnersFromAwards(hackathonId: string): Promise<void> {
  const awards = await dbGetAwardsByHackathon(hackathonId);
  const withWinner = awards.filter((x) => x.project_id && x.project_name);
  await pool.query('DELETE FROM hackathon_winners WHERE hackathon_id = $1', [hackathonId]);
  for (const w of withWinner) {
    const id = genId('win');
    await pool.query(
      `INSERT INTO hackathon_winners (id, hackathon_id, project_id, project_name, prize, rank, advanced_to_launch_pad)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [id, hackathonId, w.project_id, w.project_name, w.prize ?? '', w.rank]
    );
  }
}

// ---------- Criteria ----------

export async function dbGetCriteriaByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; name: string; description: string | null; weight: number; order: number }[]
> {
  const res = await pool.query(
    'SELECT id, hackathon_id, name, description, weight, "order" FROM hackathon_criteria WHERE hackathon_id = $1 ORDER BY "order"',
    [hackathonId]
  );
  return res.rows;
}

export async function dbCreateCriteria(
  hackathonId: string,
  criteria: { name: string; description?: string; weight: number; order: number }[]
): Promise<void> {
  for (const c of criteria) {
    const id = genId('crit');
    await pool.query(
      `INSERT INTO hackathon_criteria (id, hackathon_id, name, description, weight, "order") VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, hackathonId, c.name, c.description ?? null, c.weight, c.order]
    );
  }
}

// ---------- Scores ----------

export async function dbGetScoresByHackathon(hackathonId: string): Promise<
  { id: string; hackathon_id: string; project_id: string; judge_id: string; criterion_id: string | null; score: number; feedback: string | null; submitted_at: string }[]
> {
  const res = await pool.query(
    'SELECT id, hackathon_id, project_id, judge_id, criterion_id, score::float, feedback, submitted_at FROM hackathon_scores WHERE hackathon_id = $1',
    [hackathonId]
  );
  return res.rows;
}

export async function dbUpsertScore(input: {
  hackathon_id: string;
  project_id: string;
  judge_id: string;
  criterion_id?: string;
  score: number;
  feedback?: string;
}): Promise<{ id: string; hackathon_id: string; project_id: string; judge_id: string; criterion_id: string | null; score: number; feedback: string | null; submitted_at: string }> {
  const existing = await pool.query(
    'SELECT id FROM hackathon_scores WHERE hackathon_id = $1 AND project_id = $2 AND judge_id = $3 AND COALESCE(criterion_id, \'\') = COALESCE($4, \'\')',
    [input.hackathon_id, input.project_id, input.judge_id, input.criterion_id ?? null]
  );
  const id = existing.rows[0]?.id ?? genId('score');
  if (existing.rows[0]) {
    await pool.query(
      'UPDATE hackathon_scores SET score = $1, feedback = $2, submitted_at = CURRENT_TIMESTAMP WHERE id = $3',
      [input.score, input.feedback ?? null, id]
    );
  } else {
    await pool.query(
      `INSERT INTO hackathon_scores (id, hackathon_id, project_id, judge_id, criterion_id, score, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, input.hackathon_id, input.project_id, input.judge_id, input.criterion_id ?? null, input.score, input.feedback ?? null]
    );
  }
  const res = await pool.query(
    'SELECT id, hackathon_id, project_id, judge_id, criterion_id, score::float, feedback, submitted_at FROM hackathon_scores WHERE id = $1',
    [id]
  );
  return res.rows[0];
}

// ---------- Full hackathon (for API response) ----------

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
  image?: string;
  totalPrize?: string;
  techStack?: string[];
  level?: string;
  eventType?: string;
  recommended?: boolean;
  judges: { id: string; hackathonId: string; userId: string; name: string; email: string; avatar?: string; invitedAt: string; acceptedAt?: string }[];
  participantList: { id: string; hackathonId: string; userId: string; projectId?: string; projectName?: string; teamName?: string; status: string; invitedVia?: string; registeredAt?: string; submittedAt?: string; pitchText?: string; repoUrl?: string; demoUrl?: string }[];
  awards: { id: string; hackathonId: string; name: string; description?: string; rank: number; prize: string; projectId?: string; projectName?: string }[];
  criteria: { id: string; hackathonId: string; name: string; description?: string; weight: number; order: number }[];
  invitations: { id: string; hackathonId: string; email: string; userId?: string; role: string; status: string; invitedAt: string; respondedAt?: string; invitedBy: string }[];
  scoreboard?: ScoreboardApiShape[];
}

export interface ScoreboardApiShape {
  projectId: string;
  projectName: string;
  totalScore: number;
  averageScore: number;
  scoreCount: number;
  rank?: number;
}

export async function dbGetHackathonFull(id: string): Promise<HackathonApiShape | null> {
  const h = await dbGetHackathonById(id);
  if (!h) return null;

  const [winners, invitations, participants, judges, awards, criteria, scores] = await Promise.all([
    dbGetHackathonWinners(id),
    dbGetInvitationsByHackathon(id),
    dbGetParticipantsByHackathon(id),
    dbGetJudgesByHackathon(id),
    dbGetAwardsByHackathon(id),
    dbGetCriteriaByHackathon(id),
    dbGetScoresByHackathon(id),
  ]);

  const sponsors = (Array.isArray(h.sponsors) ? h.sponsors : []) as { name: string; tier: string }[];

  const participantList = participants.map((p) => ({
    id: p.id,
    hackathonId: p.hackathon_id,
    userId: p.user_id,
    projectId: p.project_id ?? undefined,
    projectName: p.project_name ?? undefined,
    teamName: p.team_name ?? undefined,
    status: p.status,
    invitedVia: p.invited_via ?? undefined,
    registeredAt: p.registered_at,
    submittedAt: p.submitted_at ?? undefined,
    pitchText: (p as { pitch_text?: string }).pitch_text ?? undefined,
    repoUrl: (p as { repo_url?: string }).repo_url ?? undefined,
    demoUrl: (p as { demo_url?: string }).demo_url ?? undefined,
    attachmentUrl: (p as { attachment_url?: string }).attachment_url ?? undefined,
  }));

  const scoreboardRows = await dbGetScoreboard(id);

  return {
    id: h.id,
    name: h.name,
    description: h.description ?? '',
    startDate: h.start_date,
    endDate: h.end_date,
    location: h.location ?? '',
    hostId: h.host_id,
    sponsors,
    image: h.image ?? undefined,
    totalPrize: h.total_prize ?? undefined,
    techStack: Array.isArray(h.tech_stack) ? (h.tech_stack as string[]) : undefined,
    level: h.level ?? undefined,
    eventType: h.event_type ?? undefined,
    recommended: h.recommended ?? undefined,
    winners: winners.map((w) => ({
      projectId: w.project_id ?? '',
      projectName: w.project_name ?? '',
      prize: w.prize ?? '',
      rank: w.rank,
      advancedToLaunchPad: w.advanced_to_launch_pad,
    })),
    participants: h.participants_count,
    status: h.status,
    judges: judges.map((j) => ({
      id: j.id,
      hackathonId: j.hackathon_id,
      userId: j.user_id,
      name: j.name,
      email: j.email,
      avatar: j.avatar ?? undefined,
      invitedAt: j.invited_at,
      acceptedAt: j.accepted_at ?? undefined,
    })),
    participantList,
    awards: awards.map((a) => ({
      id: a.id,
      hackathonId: a.hackathon_id,
      name: a.name,
      description: a.description ?? undefined,
      rank: a.rank,
      prize: a.prize ?? '',
      projectId: a.project_id ?? undefined,
      projectName: a.project_name ?? undefined,
    })),
    criteria: criteria.map((c) => ({
      id: c.id,
      hackathonId: c.hackathon_id,
      name: c.name,
      description: c.description ?? undefined,
      weight: c.weight,
      order: c.order,
    })),
    invitations: invitations.map((i) => ({
      id: i.id,
      hackathonId: i.hackathon_id,
      email: i.email,
      userId: i.user_id ?? undefined,
      role: i.role,
      status: i.status,
      invitedAt: i.invited_at,
      respondedAt: i.responded_at ?? undefined,
      invitedBy: i.invited_by,
    })),
    scoreboard: scoreboardRows,
  };
}

export async function dbGetHackathonsList(): Promise<HackathonApiShape[]> {
  const rows = await dbGetHackathons();
  return rows.map((h) => {
    const sponsors = (Array.isArray(h.sponsors) ? h.sponsors : []) as { name: string; tier: string }[];
    return {
      id: h.id,
      name: h.name,
      description: h.description ?? '',
      startDate: h.start_date,
      endDate: h.end_date,
      location: h.location ?? '',
      hostId: h.host_id,
      sponsors,
      winners: [],
      participants: h.participants_count,
      status: h.status,
      image: h.image ?? undefined,
      totalPrize: h.total_prize ?? undefined,
      techStack: Array.isArray(h.tech_stack) ? (h.tech_stack as string[]) : undefined,
      level: h.level ?? undefined,
      eventType: h.event_type ?? undefined,
      recommended: h.recommended ?? undefined,
      judges: [],
      participantList: [],
      awards: [],
      criteria: [],
      invitations: [],
    };
  });
}

/** Weighted scoreboard: uses criteria weights; falls back to simple average if no criteria */
export async function dbGetScoreboard(hackathonId: string): Promise<ScoreboardApiShape[]> {
  const [participants, scores, criteria] = await Promise.all([
    dbGetParticipantsByHackathon(hackathonId),
    dbGetScoresByHackathon(hackathonId),
    dbGetCriteriaByHackathon(hackathonId),
  ]);
  const byProject = new Map<string, { total: number; count: number; name: string; weightedTotal: number; weightSum: number }>();
  for (const p of participants) {
    if (p.project_id && p.project_name)
      byProject.set(p.project_id, { total: 0, count: 0, name: p.project_name, weightedTotal: 0, weightSum: 0 });
  }
  const weightByCriterion = new Map<string, number>();
  let totalWeight = 0;
  for (const c of criteria) {
    weightByCriterion.set(c.id, c.weight);
    totalWeight += c.weight;
  }
  if (criteria.length > 0 && totalWeight > 0) {
    const byProjectCriterion = new Map<string, Map<string, { sum: number; count: number }>>();
    for (const s of scores) {
      let projMap = byProjectCriterion.get(s.project_id);
      if (!projMap) {
        projMap = new Map();
        byProjectCriterion.set(s.project_id, projMap);
      }
      const cid = s.criterion_id ?? 'overall';
      const rec = projMap.get(cid) ?? { sum: 0, count: 0 };
      rec.sum += Number(s.score);
      rec.count += 1;
      projMap.set(cid, rec);
    }
    byProjectCriterion.forEach((critMap, projectId) => {
      const rec = byProject.get(projectId);
      if (!rec) return;
      let weighted = 0;
      let usedWeight = 0;
      critMap.forEach((v, cid) => {
        const w = cid === 'overall' ? 100 : (weightByCriterion.get(cid) ?? 0);
        if (v.count > 0 && w > 0) {
          weighted += (v.sum / v.count) * (w / 100);
          usedWeight += w / 100;
        }
      });
      rec.weightedTotal = weighted;
      rec.weightSum = usedWeight;
      rec.total = weighted * (criteria.length || 1);
      rec.count = 1;
    });
  } else {
    for (const s of scores) {
      const rec = byProject.get(s.project_id);
      if (rec) {
        rec.total += Number(s.score);
        rec.count += 1;
      }
    }
  }
  const out: ScoreboardApiShape[] = [];
  byProject.forEach((v, projectId) => {
    const avg = v.weightSum > 0 ? v.weightedTotal / v.weightSum : (v.count > 0 ? v.total / v.count : 0);
    out.push({
      projectId,
      projectName: v.name,
      totalScore: Math.round(v.total * 10) / 10,
      averageScore: Math.round(avg * 10) / 10,
      scoreCount: v.count,
    });
  });
  out.sort((a, b) => b.averageScore - a.averageScore);
  out.forEach((s, i) => {
    s.rank = i + 1;
  });
  return out;
}
