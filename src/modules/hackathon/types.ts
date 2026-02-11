/**
 * Hackathon module types – hosting, participants, judges, awards, scoring.
 * Extends core Hackathon from @/lib/types where needed.
 */

import type { Hackathon as CoreHackathon, Sponsor, HackathonWinner } from '@/lib/types';

/** Re-export core hackathon for compatibility */
export type { Hackathon as CoreHackathon, Sponsor, HackathonWinner } from '@/lib/types';

/** Status of a hackathon in the management lifecycle */
export type HackathonStatus = 'draft' | 'upcoming' | 'active' | 'judging' | 'completed';

/** Role of an invited person */
export type HackathonInviteRole = 'participant' | 'judge';

/** Status of an invitation */
export type InvitationStatus = 'pending' | 'accepted' | 'declined';

/** Status of a participant in the hackathon */
export type ParticipantStatus = 'invited' | 'registered' | 'submitted';

/** Judging criterion with weight for scoring */
export interface JudgingCriterion {
  id: string;
  hackathonId: string;
  name: string;
  description?: string;
  weight: number; // 0-100, total should sum to 100
  order: number;
}

/** Invitation to participate or judge */
export interface HackathonInvitation {
  id: string;
  hackathonId: string;
  email: string;
  userId?: string;
  role: HackathonInviteRole;
  status: InvitationStatus;
  invitedAt: string;
  respondedAt?: string;
  invitedBy: string;
}

/** Participant in a hackathon (team/project) */
export interface HackathonParticipant {
  id: string;
  hackathonId: string;
  userId: string; // team lead
  projectId?: string; // linked project after submission
  projectName?: string;
  teamName?: string;
  status: ParticipantStatus;
  invitedVia?: string; // invitation id
  registeredAt?: string;
  submittedAt?: string;
}

/** Judge assigned to a hackathon */
export interface HackathonJudge {
  id: string;
  hackathonId: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  invitedAt: string;
  acceptedAt?: string;
}

/** Award/prize definition for a hackathon */
export interface HackathonAward {
  id: string;
  hackathonId: string;
  name: string;
  description?: string;
  rank: number; // 1 = first place
  prize: string; // e.g. "₳10,000 + Incubation"
  projectId?: string; // filled when winner is selected
  projectName?: string;
}

/** Score given by a judge to a project (per criterion or overall) */
export interface HackathonScore {
  id: string;
  hackathonId: string;
  projectId: string;
  judgeId: string;
  criterionId?: string; // if null, might be overall score
  score: number; // typically 0-100 or 1-10
  feedback?: string;
  submittedAt: string;
}

/** Aggregated score for a project (for leaderboard) */
export interface ProjectScoreSummary {
  projectId: string;
  projectName: string;
  totalScore: number;
  averageScore: number;
  scoreCount: number;
  rank?: number;
  criterionScores?: { criterionId: string; criterionName: string; average: number }[];
}

/** Full hackathon with management fields */
export interface HackathonWithManagement extends CoreHackathon {
  hostId: string;
  judges: HackathonJudge[];
  /** List of participant records; core `participants` remains the count for display */
  participantList: HackathonParticipant[];
  awards: HackathonAward[];
  criteria: JudgingCriterion[];
  invitations: HackathonInvitation[];
  status: HackathonStatus;
  /** Filled when loading full hackathon (e.g. from API) */
  scoreboard?: ProjectScoreSummary[];
}

/** Input to create a hackathon */
export interface CreateHackathonInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  hostId: string;
  sponsors?: Sponsor[];
  awards?: Omit<HackathonAward, 'id' | 'hackathonId' | 'projectId' | 'projectName'>[];
  criteria?: Omit<JudgingCriterion, 'id' | 'hackathonId'>[];
}

/** Input to invite users (by email or userId) */
export interface InviteToHackathonInput {
  hackathonId: string;
  email?: string;
  userId?: string;
  role: HackathonInviteRole;
  invitedBy: string;
}

/** Input to submit a score */
export interface SubmitScoreInput {
  hackathonId: string;
  projectId: string;
  judgeId: string;
  criterionId?: string;
  score: number;
  feedback?: string;
}
