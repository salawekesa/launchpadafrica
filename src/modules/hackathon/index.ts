/**
 * Hackathon module – public API.
 * Host hackathons, invite participants & judges, manage awards, judge and display scores.
 */

export * from './types';
export { useHackathonStore } from './services/hackathon-store';
export {
  getHackathons,
  getHackathonById,
  getHackathonsByHost,
  createHackathon,
  updateHackathon,
  getScoreboard,
  submitScore,
  getParticipantsByHackathon,
  getJudgesByHackathon,
  getAwardsByHackathon,
  getInvitationsByHackathon,
  getCriteriaByHackathon,
} from './services/hackathon-service';

export { CreateHackathonForm } from './components/CreateHackathonForm';
export { InviteParticipants } from './components/InviteParticipants';
export { Scoreboard } from './components/Scoreboard';
export { AwardsPanel } from './components/AwardsPanel';
export { JudgeScoreForm } from './components/JudgeScoreForm';

export { HackathonManage } from './views/HackathonManage';
export { CreateHackathon } from './views/CreateHackathon';
export { HackathonScoreboard } from './views/HackathonScoreboard';
