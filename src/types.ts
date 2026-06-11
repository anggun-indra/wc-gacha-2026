export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: any; // Firestore Timestamp
  favoritTeam: string | null;
  darkHorseTeam: string | null;
  menengahAtasTeam: string | null;
  menengahTeam: string | null;
  underdogKompetitifTeam: string | null;
  underdogBeratTeam: string | null;
  hasGacha: boolean;
}

export type TeamTier = 
  | "favorit" 
  | "dark" 
  | "menengah_atas" 
  | "menengah" 
  | "underdog_kompetitif" 
  | "underdog_berat";

export interface Team {
  id: string;
  name: string;
  tier: TeamTier;
  points: number;
  probability: number; // championship probability (0-100)
  ownerId: string | null;
  ownerName: string | null;
}

export interface SystemMetadata {
  userCount: number;
  gachaTriggered: boolean;
  lastUpdated: any; // Firestore Timestamp
  dayCounter: number;
}

export interface MatchLog {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
}

export interface Game {
  id: string;
  name: string;
  createdAt: any; // Firestore Timestamp
  createdBy: string;
  playerCount: number;
  gachaTriggered: boolean;
  dayCounter: number;
  lastUpdated: any; // Firestore Timestamp
  teamsFilled: boolean;
  latestMatches?: MatchLog[];
  playerIds?: string[];
}

export interface GroupTeamStanding {
  rank: number;
  name: string;
  logo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
}

export interface GroupStanding {
  name: string;
  teams: GroupTeamStanding[];
}

export interface BracketMatch {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  homePen: number | null;
  awayPen: number | null;
  status: string;
  round: string;
  winner: string | null;
}

export interface StandingsData {
  groups: GroupStanding[];
  lastUpdated: any;
}

export interface BracketData {
  rounds: Record<string, BracketMatch[]>;
  lastUpdated: any;
}
