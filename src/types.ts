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
