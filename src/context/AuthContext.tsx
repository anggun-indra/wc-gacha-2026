import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  runTransaction, 
  serverTimestamp, 
  onSnapshot,
  query,
  orderBy,
  setDoc
} from "firebase/firestore";
import { db, auth, googleProvider, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, Team, SystemMetadata, Game, MatchLog, StandingsData, BracketData, BracketMatch, GroupStanding } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null; // Profile INSIDE the selected game
  metadata: (SystemMetadata & { latestMatches?: MatchLog[] }) | null; // Selected game metadata
  teams: Team[]; // Teams inside the selected game
  users: UserProfile[]; // Players inside the selected game
  games: Game[]; // All game sessions in the lobby
  currentGameId: string | null;
  currentGame: Game | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  simulateMatchDay: () => Promise<void>;
  clearError: () => void;
  setCurrentGameId: (id: string | null) => void;
  createGame: (name: string) => Promise<void>;
  createAndSeedGame: (name: string) => Promise<void>;
  createFullMockGame: (name: string) => Promise<void>;
  fillTeams: (gameId: string) => Promise<void>;
  joinGame: (gameId: string) => Promise<void>;
  fetchAndApplyRealResults: (dateStr: string) => Promise<void>;
  syncMatchesFromApiFootball: (dateStr: string) => Promise<void>;
  applyManualMatchResult: (teamAId: string, teamBId: string, scoreA: number, scoreB: number) => Promise<void>;
  triggerGachaLottery: () => Promise<void>;
  standings: StandingsData | null;
  bracket: BracketData | null;
  syncStandingsAndBracket: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 48 competing countries divided in 6 tiers
const INITIAL_TEAMS = [
  // Favorit (8)
  { id: "france", name: "France", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "spain", name: "Spain", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "argentina", name: "Argentina", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "england", name: "England", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "portugal", name: "Portugal", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "brazil", name: "Brazil", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "netherlands", name: "Netherlands", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },
  { id: "germany", name: "Germany", tier: "favorit" as const, points: 0, probability: 10.0, ownerId: null, ownerName: null },

  // Kuat / dark horse (8)
  { id: "uruguay", name: "Uruguay", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "united_states", name: "United States", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "mexico", name: "Mexico", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "senegal", name: "Senegal", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "colombia", name: "Colombia", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "croatia", name: "Croatia", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "belgium", name: "Belgium", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },
  { id: "morocco", name: "Morocco", tier: "dark" as const, points: 0, probability: 6.0, ownerId: null, ownerName: null },

  // Menengah atas (8)
  { id: "japan", name: "Japan", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "switzerland", name: "Switzerland", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "iran", name: "Iran", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "turkiye", name: "Türkiye", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "ecuador", name: "Ecuador", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "austria", name: "Austria", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "australia", name: "Australia", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },
  { id: "south_korea", name: "South Korea", tier: "menengah_atas" as const, points: 0, probability: 4.0, ownerId: null, ownerName: null },

  // Menengah (8)
  { id: "paraguay", name: "Paraguay", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "sweden", name: "Sweden", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "cote_divoire", name: "Côte d'Ivoire", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "panama", name: "Panama", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "norway", name: "Norway", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "canada", name: "Canada", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "algeria", name: "Algeria", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },
  { id: "egypt", name: "Egypt", tier: "menengah" as const, points: 0, probability: 2.5, ownerId: null, ownerName: null },

  // Underdog kompetitif (8)
  { id: "czechia", name: "Czechia", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "scotland", name: "Scotland", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "tunisia", name: "Tunisia", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "dr_congo", name: "DR Congo", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "uzbekistan", name: "Uzbekistan", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "qatar", name: "Qatar", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "iraq", name: "Iraq", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },
  { id: "south_africa", name: "South Africa", tier: "underdog_kompetitif" as const, points: 0, probability: 1.5, ownerId: null, ownerName: null },

  // Underdog berat (8)
  { id: "new_zealand", name: "New Zealand", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "haiti", name: "Haiti", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "curacao", name: "Curaçao", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "ghana", name: "Ghana", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "cape_verde", name: "Cape Verde", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "bosnia_herzegovina", name: "Bosnia & Herzegovina", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "jordan", name: "Jordan", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null },
  { id: "saudi_arabia", name: "Saudi Arabia", tier: "underdog_berat" as const, points: 0, probability: 0.5, ownerId: null, ownerName: null }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metadata, setMetadata] = useState<(SystemMetadata & { latestMatches?: MatchLog[] }) | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [bracket, setBracket] = useState<BracketData | null>(null);
  
  // Lobby multi-game states
  const [games, setGames] = useState<Game[]>([]);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper inside transaction to shuffle array safely in client
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Google Authentication and Registration Transaction Guard
  const signIn = async () => {
    setError(null);
    setActionLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser.emailVerified) {
        throw new Error("Akun Google ini belum terverifikasi oleh Google.");
      }

      // Fast global profile set (no game creation or team assignment)
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userDocRef, {
        userId: firebaseUser.uid,
        name: firebaseUser.displayName || "Pemain Baru",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
        createdAt: serverTimestamp()
      }, { merge: true });

      console.log("Global profile checked/synced.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Terjadi kesalahan saat masuk menggunakan Google.");
    } finally {
      setActionLoading(false);
    }
  };

  const logOut = async () => {
    setActionLoading(true);
    try {
      await signOut(auth);
      setProfile(null);
      setCurrentGameId(null);
      setCurrentGame(null);
    } catch (err: any) {
      console.error(err);
      setError("Gagal keluar dari sesi.");
    } finally {
      setActionLoading(false);
    }
  };

  // 1. ADMIN GAME CREATION
  const createGame = async (name: string) => {
    if (!user || user.email !== "yusufma9292@gmail.com") {
      setError("Hanya admin yang diperbolehkan membuat game.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const rawId = name.toLowerCase().trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 32);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const gameId = `${rawId}-${randomSuffix}`;

      const gameRef = doc(db, "games", gameId);
      
      const newGame: Game = {
        id: gameId,
        name: name,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        playerCount: 0,
        gachaTriggered: false,
        dayCounter: 0,
        lastUpdated: serverTimestamp(),
        teamsFilled: false,
        latestMatches: [],
        playerIds: []
      };

      await setDoc(gameRef, newGame);
      console.log("Game created successfully inside games subcollection:", gameId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal membuat game.");
    } finally {
      setActionLoading(false);
    }
  };

  // 1.5. ADMIN QUICK GAME CREATION & PRE-SEEDING
  const createAndSeedGame = async (name: string) => {
    if (!user || user.email !== "yusufma9292@gmail.com") {
      setError("Hanya admin yang diperbolehkan membuat dan mengisi game.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const rawId = name.toLowerCase().trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 32);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const gameId = `${rawId}-${randomSuffix}`;

      const gameRef = doc(db, "games", gameId);
      
      const newGame: Game = {
        id: gameId,
        name: name,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        playerCount: 0,
        gachaTriggered: false,
        dayCounter: 0,
        lastUpdated: serverTimestamp(),
        teamsFilled: true, // Auto filled
        latestMatches: [],
        playerIds: []
      };

      // Set the game document
      await setDoc(gameRef, newGame);

      // Populate teams
      await runTransaction(db, async (transaction) => {
        INITIAL_TEAMS.forEach((team) => {
          const teamRef = doc(db, "games", gameId, "teams", team.id);
          transaction.set(teamRef, team);
        });
      });

      console.log("Game created and seeded successfully inside database:", gameId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal membuat dan mengisi game.");
    } finally {
      setActionLoading(false);
    }
  };

  // 1.8. ADMIN INSTANT SEED MOCK PLAYERS WITH COMPLETED GACHA
  const createFullMockGame = async (name: string) => {
    if (!user || user.email?.toLowerCase() !== "yusufma9292@gmail.com") {
      setError("Hanya admin yang diperbolehkan membuat game simulasi lengkap.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const rawId = name.toLowerCase().trim()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 32);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const gameId = `${rawId}-mock-${randomSuffix}`;

      const gameRef = doc(db, "games", gameId);

      // 8 Players (1 real + 7 fake)
      const mockPlayerDetails = [
        { uid: "mock-gerrard8", name: "Steven Gerrard", email: "steven.g8@mock.com" },
        { uid: "mock-messilover", name: "Lionel Messi", email: "messi.goat@mock.com" },
        { uid: "mock-supermario", name: "Mario Balotelli", email: "mario.b45@mock.com" },
        { uid: "mock-ronaldofans", name: "Cristiano Ronaldo", email: "cr7.legend@mock.com" },
        { uid: "mock-debruynehub", name: "Kevin De Bruyne", email: "kdb.assist@mock.com" },
        { uid: "mock-zinedinez", name: "Zinedine Zidane", email: "zizou.headbutt@mock.com" },
        { uid: "mock-neymarmagic", name: "Neymar Jr", email: "neymar.magic@mock.com" }
      ];

      // Total 8 profiles including real user
      const playersList: UserProfile[] = [
        {
          userId: user.uid,
          name: user.displayName || "Admin Yusuf",
          email: user.email || "",
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
          createdAt: new Date(),
          favoritTeam: null,
          darkHorseTeam: null,
          menengahAtasTeam: null,
          menengahTeam: null,
          underdogKompetitifTeam: null,
          underdogBeratTeam: null,
          hasGacha: true
        }
      ];

      mockPlayerDetails.forEach((p) => {
        playersList.push({
          userId: p.uid,
          name: p.name,
          email: p.email,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.uid}`,
          createdAt: new Date(),
          favoritTeam: null,
          darkHorseTeam: null,
          menengahAtasTeam: null,
          menengahTeam: null,
          underdogKompetitifTeam: null,
          underdogBeratTeam: null,
          hasGacha: true
        });
      });

      // Bio-balanced packages
      const packages = [
        { favorit: "France", dark: "Uruguay", menengah_atas: "Japan", menengah: "Paraguay", underdog_kompetitif: "Czechia", underdog_berat: "New Zealand" },
        { favorit: "Spain", dark: "United States", menengah_atas: "Switzerland", menengah: "Sweden", underdog_kompetitif: "Scotland", underdog_berat: "Haiti" },
        { favorit: "Argentina", dark: "Mexico", menengah_atas: "Iran", menengah: "Côte d'Ivoire", underdog_kompetitif: "Tunisia", underdog_berat: "Curaçao" },
        { favorit: "England", dark: "Senegal", menengah_atas: "Türkiye", menengah: "Panama", underdog_kompetitif: "DR Congo", underdog_berat: "Ghana" },
        { favorit: "Portugal", dark: "Colombia", menengah_atas: "Ecuador", menengah: "Norway", underdog_kompetitif: "Uzbekistan", underdog_berat: "Cape Verde" },
        { favorit: "Brazil", dark: "Croatia", menengah_atas: "Austria", menengah: "Canada", underdog_kompetitif: "Qatar", underdog_berat: "Bosnia & Herzegovina" },
        { favorit: "Netherlands", dark: "Belgium", menengah_atas: "Australia", menengah: "Algeria", underdog_kompetitif: "Iraq", underdog_berat: "Jordan" },
        { favorit: "Germany", dark: "Morocco", menengah_atas: "South Korea", menengah: "Egypt", underdog_kompetitif: "South Africa", underdog_berat: "Saudi Arabia" }
      ];

      const shuffledPackages = shuffleArray(packages);

      const getTeamIdOfName = (name: string): string => {
        const cleaned = name.toLowerCase().trim()
          .replace(/ /g, "_")
          .replace(/&/g, "and")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/'/g, "");
        
        if (cleaned === "bosnia_and_herzegovina") {
          return "bosnia_herzegovina";
        }
        return cleaned;
      };

      // Assign packages to players
      const fullyAssignedPlayers = playersList.map((player, idx) => {
        const pkg = shuffledPackages[idx];
        return {
          ...player,
          favoritTeam: pkg.favorit,
          darkHorseTeam: pkg.dark,
          menengahAtasTeam: pkg.menengah_atas,
          menengahTeam: pkg.menengah,
          underdogKompetitifTeam: pkg.underdog_kompetitif,
          underdogBeratTeam: pkg.underdog_berat,
          hasGacha: true
        };
      });

      // Prepare team entities with their assigned owners
      const fullyAssignedTeams = INITIAL_TEAMS.map((team) => {
        // Find which package this team belongs to
        const matchedPlayer = fullyAssignedPlayers.find((p, idx) => {
          const pkg = shuffledPackages[idx];
          return (
            pkg.favorit === team.name ||
            pkg.dark === team.name ||
            pkg.menengah_atas === team.name ||
            pkg.menengah === team.name ||
            pkg.underdog_kompetitif === team.name ||
            pkg.underdog_berat === team.name
          );
        });

        if (matchedPlayer) {
          return {
            ...team,
            ownerId: matchedPlayer.userId,
            ownerName: matchedPlayer.name
          };
        }
        return team;
      });

      // Write everything inside a single transaction
      await runTransaction(db, async (transaction) => {
        // 1. Create the game document
        const newGame: Game = {
          id: gameId,
          name: name,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          playerCount: 8,
          gachaTriggered: true,
          dayCounter: 1,
          lastUpdated: serverTimestamp(),
          teamsFilled: true,
          latestMatches: [],
          playerIds: fullyAssignedPlayers.map(p => p.userId)
        };
        transaction.set(gameRef, newGame);

        // 2. Add players
        fullyAssignedPlayers.forEach((player) => {
          const playerRef = doc(db, "games", gameId, "players", player.userId);
          transaction.set(playerRef, player);
        });

        // 3. Add teams with their owners
        fullyAssignedTeams.forEach((team) => {
          const teamRef = doc(db, "games", gameId, "teams", team.id);
          transaction.set(teamRef, team);
        });
      });

      console.log("Full mock game created successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal membuat game simulasi lengkap.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. ADMIN FILL/POPULATE TEAMS (ISI TIM)
  const fillTeams = async (gameId: string) => {
    if (!user || user.email?.toLowerCase() !== "yusufma9292@gmail.com") {
      setError("Hanya admin yang diperbolehkan mengisi tim.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const gameRef = doc(db, "games", gameId);

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
          throw new Error("Game tidak ditemukan.");
        }

        // Fill standard teams subcollection
        INITIAL_TEAMS.forEach((team) => {
          const teamRef = doc(db, "games", gameId, "teams", team.id);
          transaction.set(teamRef, team);
        });

        transaction.update(gameRef, {
          teamsFilled: true,
          lastUpdated: serverTimestamp()
        });
      });

      console.log("Teams seeded successfully to game:", gameId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal mengisi tim.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. SECURE GAME REGISTRATION / GACHA TRANSACTION
  const joinGame = async (gameId: string) => {
    if (!user) {
      setError("Pemain wajib login terlebih dahulu.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const gameRef = doc(db, "games", gameId);
      const playerDocRef = doc(db, "games", gameId, "players", user.uid);

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
          throw new Error("Sesi game ini tidak ditemukan.");
        }
        
        const gameData = gameSnap.data() as Game;
        if (!gameData.teamsFilled) {
          throw new Error("Game ini belum diisi tim peserta oleh Admin.");
        }

        const playerSnap = await transaction.get(playerDocRef);
        if (playerSnap.exists()) {
          throw new Error("Anda sudah terdaftar di game ini.");
        }

        const currentIds = gameData.playerIds || [];
        if (currentIds.includes(user.uid)) {
          throw new Error("Anda sudah terdaftar di game ini.");
        }

        const currentCount = gameData.playerCount || 0;
        if (currentCount >= 8) {
          throw new Error("Pertandingan penuh! Sesi game ini dibatasi maksimal 8 pemain.");
        }

        const newCount = currentCount + 1;
        const newIds = [...currentIds, user.uid];

        // Player structure setup
        const newPlayerProfile: UserProfile = {
          userId: user.uid,
          name: user.displayName || "Pemain Baru",
          email: user.email || "",
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
          createdAt: serverTimestamp(),
          favoritTeam: null,
          darkHorseTeam: null,
          menengahAtasTeam: null,
          menengahTeam: null,
          underdogKompetitifTeam: null,
          underdogBeratTeam: null,
          hasGacha: false
        };

        // Register user, increment playerCount and update playerIds list
        transaction.set(playerDocRef, newPlayerProfile);
        transaction.update(gameRef, {
          playerCount: newCount,
          playerIds: newIds
        });
      });

      console.log("Successfully joined game:", gameId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal bergabung ke game.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3.5. ADMIN GACHA LOTTERY (MANUAL TRIGGER)
  const triggerGachaLottery = async () => {
    if (!user || user.email?.toLowerCase() !== "yusufma9292@gmail.com") {
      setError("Hanya admin yang diperbolehkan melakukan pengundian.");
      return;
    }
    if (!currentGameId) {
      setError("Tidak ada sesi game aktif.");
      return;
    }
    setError(null);
    setActionLoading(true);
    try {
      const gameRef = doc(db, "games", currentGameId);
      const playersColRef = collection(db, "games", currentGameId, "players");
      const teamsColRef = collection(db, "games", currentGameId, "teams");

      // Fetch players outside transaction (queries cannot be run inside transactions)
      const playersSnapshot = await getDocs(playersColRef);
      const registeredPlayers: UserProfile[] = [];
      playersSnapshot.forEach((docSnap) => {
        registeredPlayers.push(docSnap.data() as UserProfile);
      });

      if (registeredPlayers.length !== 8) {
        throw new Error(`Sesi game ini harus memiliki tepat 8 pemain sebelum dapat diundi. Sekarang baru ada ${registeredPlayers.length} pemain terdaftar.`);
      }

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
          throw new Error("Sesi game ini tidak ditemukan.");
        }
        
        const gameData = gameSnap.data() as Game;
        if (!gameData.teamsFilled) {
          throw new Error("Game ini belum diisi tim peserta oleh Admin.");
        }

        if (gameData.gachaTriggered) {
          throw new Error("Pengundian tim sudah pernah dilakukan untuk game ini.");
        }

        // 8 biome-balanced packages
        const packages = [
          { favorit: "France", dark: "Uruguay", menengah_atas: "Japan", menengah: "Paraguay", underdog_kompetitif: "Czechia", underdog_berat: "New Zealand" },
          { favorit: "Spain", dark: "United States", menengah_atas: "Switzerland", menengah: "Sweden", underdog_kompetitif: "Scotland", underdog_berat: "Haiti" },
          { favorit: "Argentina", dark: "Mexico", menengah_atas: "Iran", menengah: "Côte d'Ivoire", underdog_kompetitif: "Tunisia", underdog_berat: "Curaçao" },
          { favorit: "England", dark: "Senegal", menengah_atas: "Türkiye", menengah: "Panama", underdog_kompetitif: "DR Congo", underdog_berat: "Ghana" },
          { favorit: "Portugal", dark: "Colombia", menengah_atas: "Ecuador", menengah: "Norway", underdog_kompetitif: "Uzbekistan", underdog_berat: "Cape Verde" },
          { favorit: "Brazil", dark: "Croatia", menengah_atas: "Austria", menengah: "Canada", underdog_kompetitif: "Qatar", underdog_berat: "Bosnia & Herzegovina" },
          { favorit: "Netherlands", dark: "Belgium", menengah_atas: "Australia", menengah: "Algeria", underdog_kompetitif: "Iraq", underdog_berat: "Jordan" },
          { favorit: "Germany", dark: "Morocco", menengah_atas: "South Korea", menengah: "Egypt", underdog_kompetitif: "South Africa", underdog_berat: "Saudi Arabia" }
        ];

        const shuffledPackages = shuffleArray(packages);

        const getTeamIdOfName = (name: string): string => {
          const cleaned = name.toLowerCase().trim()
            .replace(/ /g, "_")
            .replace(/&/g, "and")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/'/g, "");
          
          if (cleaned === "bosnia_and_herzegovina") {
            return "bosnia_herzegovina";
          }
          return cleaned;
        };

        // Assign profiles and update teams subcollection
        registeredPlayers.forEach((player, index) => {
          const pkg = shuffledPackages[index];
          const playerUpdate = {
            favoritTeam: pkg.favorit,
            darkHorseTeam: pkg.dark,
            menengahAtasTeam: pkg.menengah_atas,
            menengahTeam: pkg.menengah,
            underdogKompetitifTeam: pkg.underdog_kompetitif,
            underdogBeratTeam: pkg.underdog_berat,
            hasGacha: true
          };

          const targetPlayerRef = doc(db, "games", currentGameId, "players", player.userId);
          transaction.set(targetPlayerRef, playerUpdate, { merge: true });

          // Update subcollection teams
          const teamPayload = {
            ownerId: player.userId,
            ownerName: player.name
          };

          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.favorit)), teamPayload);
          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.dark)), teamPayload);
          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.menengah_atas)), teamPayload);
          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.menengah)), teamPayload);
          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.underdog_kompetitif)), teamPayload);
          transaction.update(doc(db, "games", currentGameId, "teams", getTeamIdOfName(pkg.underdog_berat)), teamPayload);
        });

        // State upgrade
        transaction.update(gameRef, {
          gachaTriggered: true,
          dayCounter: 1,
          lastUpdated: serverTimestamp(),
          latestMatches: []
        });
      });

      console.log("Successfully ran admin gacha lottery for game:", currentGameId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal melakukan pengundian.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. DAY COMPETITION MATCHDAY SIMULATION (Per game)
  const simulateMatchDay = async () => {
    if (!currentGameId) return;
    setError(null);
    setActionLoading(true);
    try {
      const gameRef = doc(db, "games", currentGameId);
      const teamsColRef = collection(db, "games", currentGameId, "teams");

      // Fetch all 48 teams outside transaction
      const teamsSnapshot = await getDocs(teamsColRef);
      const teamDocuments: Team[] = [];
      teamsSnapshot.forEach((docSnap) => {
        teamDocuments.push(docSnap.data() as Team);
      });

      if (teamDocuments.length !== 48) {
        throw new Error("Peserta tidak lengkap (harus 48 tim).");
      }

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data() as Game;
        if (!gameData.gachaTriggered) return;

        const nextDay = (gameData.dayCounter || 0) + 1;

        // Pair up and simulate (24 matches)
        const shuffledList = shuffleArray(teamDocuments);
        const dailyMatches: MatchLog[] = [];

        for (let i = 0; i < 24; i++) {
          const teamA = shuffledList[2 * i];
          const teamB = shuffledList[2 * i + 1];

          let weightA = 1.0;
          if (teamA.tier === "favorit") weightA = 1.6;
          else if (teamA.tier === "dark") weightA = 1.4;
          else if (teamA.tier === "menengah_atas") weightA = 1.2;
          else if (teamA.tier === "menengah") weightA = 1.0;
          else if (teamA.tier === "underdog_kompetitif") weightA = 0.8;
          else if (teamA.tier === "underdog_berat") weightA = 0.6;

          let weightB = 1.0;
          if (teamB.tier === "favorit") weightB = 1.6;
          else if (teamB.tier === "dark") weightB = 1.4;
          else if (teamB.tier === "menengah_atas") weightB = 1.2;
          else if (teamB.tier === "menengah") weightB = 1.0;
          else if (teamB.tier === "underdog_kompetitif") weightB = 0.8;
          else if (teamB.tier === "underdog_berat") weightB = 0.6;

          const goalsA = Math.floor(Math.random() * 4 * weightA);
          const goalsB = Math.floor(Math.random() * 4 * weightB);

          let pointsA = 0;
          let pointsB = 0;

          if (goalsA > goalsB) {
            pointsA = 3;
          } else if (goalsA < goalsB) {
            pointsB = 3;
          } else {
            pointsA = 1;
            pointsB = 1;
          }

          teamA.points += pointsA;
          teamB.points += pointsB;

          dailyMatches.push({
            teamA: teamA.name,
            teamB: teamB.name,
            scoreA: goalsA,
            scoreB: goalsB
          });
        }

        // Recalculate probabilities
        const teamWeights = shuffledList.map((t) => {
          let baseWeight = 1.0;
          if (t.tier === "favorit") baseWeight = 8.0;
          else if (t.tier === "dark") baseWeight = 6.0;
          else if (t.tier === "menengah_atas") baseWeight = 4.0;
          else if (t.tier === "menengah") baseWeight = 2.5;
          else if (t.tier === "underdog_kompetitif") baseWeight = 1.5;
          else if (t.tier === "underdog_berat") baseWeight = 0.5;

          const scoreWeight = t.points * 1.5;
          return { id: t.id, weight: baseWeight + scoreWeight };
        });

        const totalWeight = teamWeights.reduce((sum, item) => sum + item.weight, 0);

        shuffledList.forEach((team) => {
          const weightObj = teamWeights.find(w => w.id === team.id);
          const rawProb = weightObj ? (weightObj.weight / totalWeight) * 100 : 2.083;
          team.probability = Math.round(rawProb * 10) / 10;
        });

        // Write updates
        shuffledList.forEach((team) => {
          const teamRef = doc(db, "games", currentGameId, "teams", team.id);
          transaction.update(teamRef, {
            points: team.points,
            probability: team.probability
          });
        });

        transaction.update(gameRef, {
          dayCounter: nextDay,
          lastUpdated: serverTimestamp(),
          latestMatches: dailyMatches
        });
      });

    } catch (err: any) {
      console.error(err);
      setError("Gagal melakukan simulasi pertandingan harian.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4.5. FETCH AND APPLY ACTUAL MATCHES FROM GEMINI (REAL DATA PULL)
  const fetchAndApplyRealResults = async (dateStr: string) => {
    if (!currentGameId) return;
    setError(null);
    setActionLoading(true);
    try {
      const resp = await fetch(`/api/matches/real-results?date=${dateStr}`);
      if (!resp.ok) {
        throw new Error("Gagal mengambil data dari server API.");
      }
      const matches = await resp.json() as any[];
      if (!Array.isArray(matches) || matches.length === 0) {
        throw new Error(`Tidak ditemukan pertandingan Piala Dunia asli pada tanggal ${dateStr}. Periksa kembali tanggal/jadwal.`);
      }

      // Filter only finished/completed matches
      const completedMatches = matches.filter(m => m.status === "completed" || (m.scoreA !== null && m.scoreB !== null));
      if (completedMatches.length === 0) {
        throw new Error(`Ditemukan ${matches.length} pertandingan tapi belum ada yang selesai (status belum completed atau skor masih kosong).`);
      }

      const gameRef = doc(db, "games", currentGameId);
      const teamsColRef = collection(db, "games", currentGameId, "teams");

      // Fetch all 48 teams outside transaction
      const teamsSnapshot = await getDocs(teamsColRef);
      const teamDocuments: Team[] = [];
      teamsSnapshot.forEach((docSnap) => {
        teamDocuments.push(docSnap.data() as Team);
      });

      if (teamDocuments.length !== 48) {
        throw new Error("Negara peserta tidak lengkap (harus 48 negara di game ini).");
      }

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data() as Game;
        if (!gameData.gachaTriggered) {
          throw new Error("Gacha harus di-trigger terlebih dahulu sebelum memperbarui pertandingan!");
        }

        const nextDay = (gameData.dayCounter || 0) + 1;

        const dailyMatches: MatchLog[] = [];

        // Apply completed matches
        completedMatches.forEach((actualMatch) => {
          const teamA = teamDocuments.find(t => t.name.toLowerCase() === actualMatch.teamA.toLowerCase());
          const teamB = teamDocuments.find(t => t.name.toLowerCase() === actualMatch.teamB.toLowerCase());

          if (teamA && teamB) {
            const goalsA = Number(actualMatch.scoreA);
            const goalsB = Number(actualMatch.scoreB);

            let pointsA = 0;
            let pointsB = 0;

            if (goalsA > goalsB) {
              pointsA = 3;
            } else if (goalsA < goalsB) {
              pointsB = 3;
            } else {
              pointsA = 1;
              pointsB = 1;
            }

            teamA.points += pointsA;
            teamB.points += pointsB;

            dailyMatches.push({
              teamA: teamA.name,
              teamB: teamB.name,
              scoreA: goalsA,
              scoreB: goalsB
            });
          }
        });

        if (dailyMatches.length === 0) {
          throw new Error("Nama-nama negara di Google Search tidak cocok dengan database 48 negara Anda. Tidak ada hasil yang diperbarui.");
        }

        // Recalculate probabilities of all 48 teams
        const teamWeights = teamDocuments.map((t) => {
          let baseWeight = 1.0;
          if (t.tier === "favorit") baseWeight = 8.0;
          else if (t.tier === "dark") baseWeight = 6.0;
          else if (t.tier === "menengah_atas") baseWeight = 4.0;
          else if (t.tier === "menengah") baseWeight = 2.5;
          else if (t.tier === "underdog_kompetitif") baseWeight = 1.5;
          else if (t.tier === "underdog_berat") baseWeight = 0.5;

          const scoreWeight = t.points * 1.5;
          return { id: t.id, weight: baseWeight + scoreWeight };
        });

        const totalWeight = teamWeights.reduce((sum, item) => sum + item.weight, 0);

        teamDocuments.forEach((team) => {
          const weightObj = teamWeights.find(w => w.id === team.id);
          const rawProb = weightObj ? (weightObj.weight / totalWeight) * 100 : 2.083;
          team.probability = Math.round(rawProb * 10) / 10;
        });

        // Write updates
        teamDocuments.forEach((team) => {
          const teamRef = doc(db, "games", currentGameId, "teams", team.id);
          transaction.update(teamRef, {
            points: team.points,
            probability: team.probability
          });
        });

        // Update game state
        transaction.update(gameRef, {
          dayCounter: nextDay,
          lastUpdated: serverTimestamp(),
          latestMatches: dailyMatches
        });
      });

      console.log(`Successfully fetched and applied ${completedMatches.length} real matches for date ${dateStr}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menarik data pertandingan real.");
    } finally {
      setActionLoading(false);
    }
  };

  const syncMatchesFromApiFootball = async (dateStr: string) => {
    if (!currentGameId) return;
    setError(null);
    setActionLoading(true);
    try {
      // Retrieve secure credentials from Firestore config/api_football
      const configRef = doc(db, "config", "api_football");
      const configSnap = await getDoc(configRef);
      
      let apiKey = "7803ef1e55184a6e4b4a6a6d16f29951";
      let baseUrl = "https://v3.football.api-sports.io";
      let leagueId = "1";
      let season = "2026";

      if (configSnap.exists()) {
        const configData = configSnap.data();
        apiKey = configData.apiKey || apiKey;
        baseUrl = configData.baseUrl || baseUrl;
        leagueId = configData.leagueId || leagueId;
        season = configData.season || season;
      } else if (user?.email?.toLowerCase() === "yusufma9292@gmail.com") {
        // Automatically seed the configuration if it is not present in Firestore
        await setDoc(configRef, {
          apiKey,
          baseUrl,
          leagueId,
          season,
          updatedAt: serverTimestamp()
        });
      }
      
      const url = `${baseUrl}/fixtures?league=${leagueId}&season=${season}&date=${dateStr}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Gagal menghubungi API-Football (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      if (data.errors && Object.keys(data.errors).length > 0) {
        const errDesc = JSON.stringify(data.errors);
        throw new Error(`API-Football error: ${errDesc}`);
      }
      
      const fixtures = data.response;
      if (!Array.isArray(fixtures) || fixtures.length === 0) {
        throw new Error(`Tidak ditemukan pertandingan Piala Dunia pada tanggal ${dateStr} di API-Football.`);
      }

      const completedFixtures = fixtures.filter(f => 
        f.goals?.home !== undefined && 
        f.goals?.away !== undefined &&
        f.goals?.home !== null && 
        f.goals?.away !== null &&
        f.fixture?.status?.short !== undefined &&
        ["FT", "AET", "PEN"].includes(f.fixture.status.short)
      );

      if (completedFixtures.length === 0) {
        const matchDetails = fixtures.map(f => {
          const home = f.teams?.home?.name || "Home";
          const away = f.teams?.away?.name || "Away";
          const status = f.fixture?.status?.long || "NS";
          const time = f.fixture?.date ? new Date(f.fixture.date).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "00:00";
          return `${home} vs ${away} (${status}, Jam ${time})`;
        }).join(", ");
        throw new Error(`Ditemukan ${fixtures.length} pertandingan tapi belum ada yang selesai. Detail: ${matchDetails}`);
      }

      const allowedTeams = [
        "France", "Spain", "Argentina", "England", "Portugal", "Brazil", "Netherlands", "Germany",
        "Uruguay", "United States", "Mexico", "Senegal", "Colombia", "Croatia", "Belgium", "Morocco",
        "Japan", "Switzerland", "Iran", "Türkiye", "Ecuador", "Austria", "Australia", "South Korea",
        "Paraguay", "Sweden", "Côte d'Ivoire", "Panama", "Norway", "Canada", "Algeria", "Egypt",
        "Czechia", "Scotland", "Tunisia", "DR Congo", "Uzbekistan", "Qatar", "Iraq", "South Africa",
        "New Zealand", "Haiti", "Curaçao", "Ghana", "Cape Verde", "Bosnia & Herzegovina", "Jordan", "Saudi Arabia"
      ];

      const mapApiFootballTeamName = (name: string | null | undefined): string => {
        if (!name) return "";
        const mapping: Record<string, string> = {
          "usa": "United States",
          "united states": "United States",
          "korea republic": "South Korea",
          "south korea": "South Korea",
          "ivory coast": "Côte d'Ivoire",
          "cote d'ivoire": "Côte d'Ivoire",
          "czech republic": "Czechia",
          "czechia": "Czechia",
          "bosnia and herzegovina": "Bosnia & Herzegovina",
          "bosnia-herzegovina": "Bosnia & Herzegovina",
          "bosnia & herzegovina": "Bosnia & Herzegovina",
          "dr congo": "DR Congo",
          "congo dr": "DR Congo",
          "turkey": "Türkiye",
          "türkiye": "Türkiye",
          "curacao": "Curaçao",
          "curaçao": "Curaçao"
        };
        const key = name.toLowerCase().trim();
        if (mapping[key]) return mapping[key];
        
        const found = allowedTeams.find(c => c.toLowerCase() === key);
        return found || name;
      };

      const gameRef = doc(db, "games", currentGameId);
      const teamsColRef = collection(db, "games", currentGameId, "teams");

      const teamsSnapshot = await getDocs(teamsColRef);
      const teamDocuments: Team[] = [];
      teamsSnapshot.forEach((docSnap) => {
        teamDocuments.push(docSnap.data() as Team);
      });

      if (teamDocuments.length !== 48) {
        throw new Error("Negara peserta tidak lengkap (harus 48 negara di game ini).");
      }

      const dailyMatches: MatchLog[] = [];

      completedFixtures.forEach((fixtureItem) => {
        const homeMapped = mapApiFootballTeamName(fixtureItem.teams?.home?.name);
        const awayMapped = mapApiFootballTeamName(fixtureItem.teams?.away?.name);

        const teamA = teamDocuments.find(t => t.name.toLowerCase() === homeMapped.toLowerCase());
        const teamB = teamDocuments.find(t => t.name.toLowerCase() === awayMapped.toLowerCase());

        if (teamA && teamB) {
          const goalsA = Number(fixtureItem.goals?.home);
          const goalsB = Number(fixtureItem.goals?.away);

          let pointsA = 0;
          let pointsB = 0;

          if (goalsA > goalsB) {
            pointsA = 3;
          } else if (goalsA < goalsB) {
            pointsB = 3;
          } else {
            pointsA = 1;
            pointsB = 1;
          }

          teamA.points += pointsA;
          teamB.points += pointsB;

          dailyMatches.push({
            teamA: teamA.name,
            teamB: teamB.name,
            scoreA: goalsA,
            scoreB: goalsB
          });
        }
      });

      if (dailyMatches.length === 0) {
        throw new Error("Nama-nama negara dari API-Football tidak cocok dengan database 48 negara Anda. Tidak ada hasil yang diperbarui.");
      }

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data() as Game;
        if (!gameData.gachaTriggered) {
          throw new Error("Gacha harus di-trigger terlebih dahulu sebelum memperbarui pertandingan!");
        }

        const nextDay = (gameData.dayCounter || 0) + 1;

        const teamWeights = teamDocuments.map((t) => {
          let baseWeight = 1.0;
          if (t.tier === "favorit") baseWeight = 8.0;
          else if (t.tier === "dark") baseWeight = 6.0;
          else if (t.tier === "menengah_atas") baseWeight = 4.0;
          else if (t.tier === "menengah") baseWeight = 2.5;
          else if (t.tier === "underdog_kompetitif") baseWeight = 1.5;
          else if (t.tier === "underdog_berat") baseWeight = 0.5;

          const scoreWeight = t.points * 1.5;
          return { id: t.id, weight: baseWeight + scoreWeight };
        });

        const totalWeight = teamWeights.reduce((sum, item) => sum + item.weight, 0);

        teamDocuments.forEach((team) => {
          const weightObj = teamWeights.find(w => w.id === team.id);
          const rawProb = weightObj ? (weightObj.weight / totalWeight) * 100 : 2.083;
          team.probability = Math.round(rawProb * 10) / 10;
        });

        teamDocuments.forEach((team) => {
          const teamRef = doc(db, "games", currentGameId, "teams", team.id);
          transaction.update(teamRef, {
            points: team.points,
            probability: team.probability
          });
        });

        transaction.update(gameRef, {
          dayCounter: nextDay,
          lastUpdated: serverTimestamp(),
          latestMatches: dailyMatches
        });
      });

      console.log(`Successfully fetched and applied ${completedFixtures.length} matches from API-Football for date ${dateStr}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menarik data dari API-Football.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4.6. APPLY MANUAL MATCH RESULT FOR ANY TWO TEAMS (FALLBACK UPDATE)
  const applyManualMatchResult = async (teamAId: string, teamBId: string, scoreA: number, scoreB: number) => {
    if (!currentGameId) return;
    setError(null);
    setActionLoading(true);
    try {
      if (!teamAId || !teamBId) {
        throw new Error("Kedua tim harus dipilih!");
      }
      if (teamAId === teamBId) {
        throw new Error("Tim A dan Tim B tidak boleh sama!");
      }
      if (scoreA < 0 || scoreB < 0) {
        throw new Error("Skor tidak boleh kurang dari nol!");
      }

      const gameRef = doc(db, "games", currentGameId);
      const teamsColRef = collection(db, "games", currentGameId, "teams");

      // Fetch all 48 teams outside transaction
      const teamsSnapshot = await getDocs(teamsColRef);
      const teamDocuments: Team[] = [];
      teamsSnapshot.forEach((docSnap) => {
        teamDocuments.push(docSnap.data() as Team);
      });

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) return;

        const gameData = gameSnap.data() as Game;
        if (!gameData.gachaTriggered) {
          throw new Error("Gacha harus di-trigger terlebih dahulu sebelum memperbarui pertandingan!");
        }

        const nextDay = (gameData.dayCounter || 0) + 1;

        const teamA = teamDocuments.find(t => t.id === teamAId);
        const teamB = teamDocuments.find(t => t.id === teamBId);

        if (!teamA || !teamB) {
          throw new Error("Tim yang dipilih tidak valid di database.");
        }

        let pointsA = 0;
        let pointsB = 0;

        if (scoreA > scoreB) {
          pointsA = 3;
        } else if (scoreA < scoreB) {
          pointsB = 3;
        } else {
          pointsA = 1;
          pointsB = 1;
        }

        teamA.points += pointsA;
        teamB.points += pointsB;

        const dailyMatches: MatchLog[] = [{
          teamA: teamA.name,
          teamB: teamB.name,
          scoreA,
          scoreB
        }];

        // Recalculate probabilities of all 48 teams
        const teamWeights = teamDocuments.map((t) => {
          let baseWeight = 1.0;
          if (t.tier === "favorit") baseWeight = 8.0;
          else if (t.tier === "dark") baseWeight = 6.0;
          else if (t.tier === "menengah_atas") baseWeight = 4.0;
          else if (t.tier === "menengah") baseWeight = 2.5;
          else if (t.tier === "underdog_kompetitif") baseWeight = 1.5;
          else if (t.tier === "underdog_berat") baseWeight = 0.5;

          const scoreWeight = t.points * 1.5;
          return { id: t.id, weight: baseWeight + scoreWeight };
        });

        const totalWeight = teamWeights.reduce((sum, item) => sum + item.weight, 0);

        teamDocuments.forEach((team) => {
          const weightObj = teamWeights.find(w => w.id === team.id);
          const rawProb = weightObj ? (weightObj.weight / totalWeight) * 100 : 2.083;
          team.probability = Math.round(rawProb * 10) / 10;
        });

        // Write updates
        teamDocuments.forEach((team) => {
          const teamRef = doc(db, "games", currentGameId, "teams", team.id);
          transaction.update(teamRef, {
            points: team.points,
            probability: team.probability
          });
        });

        // Update game state
        transaction.update(gameRef, {
          dayCounter: nextDay,
          lastUpdated: serverTimestamp(),
          latestMatches: dailyMatches
        });
      });

      console.log(`Successfully applied manual match: ${teamAId} (${scoreA}) vs ${teamBId} (${scoreB})`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal memperbarui pertandingan secara manual.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4.7. FETCH STANDINGS AND KNOCKOUT BRACKET FROM API-FOOTBALL
  const syncStandingsAndBracket = async () => {
    if (!currentGameId) return;
    setError(null);
    setActionLoading(true);
    try {
      // 1. Retrieve secure credentials from Firestore config/api_football
      const configRef = doc(db, "config", "api_football");
      const configSnap = await getDoc(configRef);
      
      let apiKey = "7803ef1e55184a6e4b4a6a6d16f29951";
      let baseUrl = "https://v3.football.api-sports.io";
      let leagueId = "1";
      let season = "2026";

      if (configSnap.exists()) {
        const configData = configSnap.data();
        apiKey = configData.apiKey || apiKey;
        baseUrl = configData.baseUrl || baseUrl;
        leagueId = configData.leagueId || leagueId;
        season = configData.season || season;
      } else if (user?.email?.toLowerCase() === "yusufma9292@gmail.com") {
        await setDoc(configRef, {
          apiKey,
          baseUrl,
          leagueId,
          season,
          updatedAt: serverTimestamp()
        });
      }

      // Helper function for name normalization
      const allowedTeams = [
        "France", "Spain", "Argentina", "England", "Portugal", "Brazil", "Netherlands", "Germany",
        "Uruguay", "United States", "Mexico", "Senegal", "Colombia", "Croatia", "Belgium", "Morocco",
        "Japan", "Switzerland", "Iran", "Türkiye", "Ecuador", "Austria", "Australia", "South Korea",
        "Paraguay", "Sweden", "Côte d'Ivoire", "Panama", "Norway", "Canada", "Algeria", "Egypt",
        "Czechia", "Scotland", "Tunisia", "DR Congo", "Uzbekistan", "Qatar", "Iraq", "South Africa",
        "New Zealand", "Haiti", "Curaçao", "Ghana", "Cape Verde", "Bosnia & Herzegovina", "Jordan", "Saudi Arabia"
      ];

      const mapApiFootballTeamName = (name: string | null | undefined): string => {
        if (!name) return "";
        const mapping: Record<string, string> = {
          "usa": "United States",
          "united states": "United States",
          "korea republic": "South Korea",
          "south korea": "South Korea",
          "ivory coast": "Côte d'Ivoire",
          "cote d'ivoire": "Côte d'Ivoire",
          "czech republic": "Czechia",
          "czechia": "Czechia",
          "bosnia and herzegovina": "Bosnia & Herzegovina",
          "bosnia-herzegovina": "Bosnia & Herzegovina",
          "bosnia & herzegovina": "Bosnia & Herzegovina",
          "dr congo": "DR Congo",
          "congo dr": "DR Congo",
          "turkey": "Türkiye",
          "türkiye": "Türkiye",
          "curacao": "Curaçao",
          "curaçao": "Curaçao"
        };
        const key = name.toLowerCase().trim();
        if (mapping[key]) return mapping[key];
        
        const found = allowedTeams.find(c => c.toLowerCase() === key);
        return found || name;
      };

      // 2. Fetch Standings from API-Football
      const standingsUrl = `${baseUrl}/standings?league=${leagueId}&season=${season}`;
      const standingsResponse = await fetch(standingsUrl, {
        method: "GET",
        headers: { "x-apisports-key": apiKey }
      });

      if (!standingsResponse.ok) {
        throw new Error(`Gagal mengambil data klasemen (HTTP ${standingsResponse.status})`);
      }

      const standingsData = await standingsResponse.json();
      if (standingsData.errors && Object.keys(standingsData.errors).length > 0) {
        throw new Error(`API-Football standings error: ${JSON.stringify(standingsData.errors)}`);
      }

      const rawStandings = standingsData.response?.[0]?.league?.standings;
      const parsedGroups: GroupStanding[] = [];

      if (Array.isArray(rawStandings)) {
        rawStandings.forEach((groupData: any) => {
          if (Array.isArray(groupData) && groupData.length > 0) {
            const groupName = groupData[0]?.group || "Grup";
            const teamsStanding = groupData.map((item: any) => ({
              rank: item.rank || 0,
              name: mapApiFootballTeamName(item.team?.name),
              logo: item.team?.logo || "",
              points: item.points || 0,
              played: item.all?.played || 0,
              win: item.all?.win || 0,
              draw: item.all?.draw || 0,
              lose: item.all?.lose || 0,
              goalsFor: item.all?.goals?.for || 0,
              goalsAgainst: item.all?.goals?.against || 0,
              goalsDiff: item.goalsDiff || 0
            }));

            parsedGroups.push({
              name: groupName,
              teams: teamsStanding
            });
          }
        });
      }

      // 3. Fetch Fixtures (Bracket) from API-Football
      const fixturesUrl = `${baseUrl}/fixtures?league=${leagueId}&season=${season}`;
      const fixturesResponse = await fetch(fixturesUrl, {
        method: "GET",
        headers: { "x-apisports-key": apiKey }
      });

      if (!fixturesResponse.ok) {
        throw new Error(`Gagal mengambil data bracket (HTTP ${fixturesResponse.status})`);
      }

      const fixturesData = await fixturesResponse.json();
      if (fixturesData.errors && Object.keys(fixturesData.errors).length > 0) {
        throw new Error(`API-Football fixtures error: ${JSON.stringify(fixturesData.errors)}`);
      }

      const rawFixtures = fixturesData.response;
      const bracketRounds: Record<string, BracketMatch[]> = {
        "Round of 32": [],
        "Round of 16": [],
        "Quarter-finals": [],
        "Semi-finals": [],
        "Final": [],
        "Third place play-off": []
      };

      if (Array.isArray(rawFixtures)) {
        rawFixtures.forEach((f: any) => {
          const roundName = f.fixture?.round || "";
          
          // Check if this round matches our targeted bracket rounds
          const matchedRoundKey = Object.keys(bracketRounds).find(key => 
            roundName.toLowerCase().includes(key.toLowerCase())
          );

          if (matchedRoundKey) {
            bracketRounds[matchedRoundKey].push({
              id: f.fixture?.id || 0,
              date: f.fixture?.date || "",
              homeTeam: mapApiFootballTeamName(f.teams?.home?.name),
              awayTeam: mapApiFootballTeamName(f.teams?.away?.name),
              homeLogo: f.teams?.home?.logo || "",
              awayLogo: f.teams?.away?.logo || "",
              homeScore: f.goals?.home !== undefined ? f.goals.home : null,
              awayScore: f.goals?.away !== undefined ? f.goals.away : null,
              homePen: f.score?.penalty?.home !== undefined ? f.score.penalty.home : null,
              awayPen: f.score?.penalty?.away !== undefined ? f.score.penalty.away : null,
              status: f.fixture?.status?.short || "",
              round: matchedRoundKey,
              winner: f.teams?.home?.winner ? "home" : (f.teams?.away?.winner ? "away" : null)
            });
          }
        });
      }

      // Sort matches inside each round by date/time
      Object.keys(bracketRounds).forEach(roundKey => {
        bracketRounds[roundKey].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      // 4. Save Standings and Bracket to Firestore under separate docs
      const standingsDocRef = doc(db, "games", currentGameId, "standings", "data");
      const bracketDocRef = doc(db, "games", currentGameId, "bracket", "data");

      await setDoc(standingsDocRef, {
        groups: parsedGroups,
        lastUpdated: serverTimestamp()
      });

      await setDoc(bracketDocRef, {
        rounds: bracketRounds,
        lastUpdated: serverTimestamp()
      });

      console.log("Successfully synced standings and brackets.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gagal menyinkronkan klasemen & bracket.");
    } finally {
      setActionLoading(false);
    }
  };

  // Google Authentication state setup
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Multi-Game Lobby Listener (Fetch all games in lobby)
  useEffect(() => {
    if (!user) {
      setGames([]);
      return;
    }

    const gamesColRef = collection(db, "games");
    const qGames = query(gamesColRef, orderBy("createdAt", "desc"));
    
    const unsubscribeGames = onSnapshot(qGames, (snap) => {
      const allGames: Game[] = [];
      snap.forEach((d) => {
        allGames.push(d.data() as Game);
      });
      setGames(allGames);
      setLoading(false);
    }, (err) => {
      console.error(err);
      handleFirestoreError(err, OperationType.LIST, "games");
      setLoading(false);
    });

    return () => unsubscribeGames();
  }, [user]);

  // Active Game Observers (Listeners setup when user enters a specific game id)
  useEffect(() => {
    if (!user || !currentGameId) {
      setProfile(null);
      setTeams([]);
      setUsers([]);
      setMetadata(null);
      setCurrentGame(null);
      setStandings(null);
      setBracket(null);
      return;
    }

    // 1. Observe parent game settings/metadata
    const gameRef = doc(db, "games", currentGameId);
    const unsubscribeGameMeta = onSnapshot(gameRef, (snap) => {
      if (snap.exists()) {
        const gameObj = snap.data() as Game;
        setCurrentGame(gameObj);
        // Map to metadata for zero-regression dashboard support
        setMetadata({
          userCount: gameObj.playerCount,
          gachaTriggered: gameObj.gachaTriggered,
          lastUpdated: gameObj.lastUpdated,
          dayCounter: gameObj.dayCounter,
          latestMatches: gameObj.latestMatches
        });
      } else {
        setCurrentGame(null);
        setMetadata(null);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `games/${currentGameId}`);
    });

    // 2. Observe user's profile documents inside this selected game players subcollection
    const playerRef = doc(db, "games", currentGameId, "players", user.uid);
    const unsubscribePlayerProfile = onSnapshot(playerRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `games/${currentGameId}/players/${user.uid}`);
    });

    // 3. Observe teams subcollection inside this selected game
    const teamsRef = collection(db, "games", currentGameId, "teams");
    const unsubscribeGameTeams = onSnapshot(teamsRef, (snap) => {
      const list: Team[] = [];
      snap.forEach((d) => {
        list.push(d.data() as Team);
      });
      setTeams(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `games/${currentGameId}/teams`);
    });

    // 4. Observe game players list inside this selected game
    const playersRef = collection(db, "games", currentGameId, "players");
    const unsubscribeGamePlayers = onSnapshot(playersRef, (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      setUsers(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `games/${currentGameId}/players`);
    });

    // 5. Observe standings document
    const standingsRef = doc(db, "games", currentGameId, "standings", "data");
    const unsubscribeStandings = onSnapshot(standingsRef, (snap) => {
      if (snap.exists()) {
        setStandings(snap.data() as StandingsData);
      } else {
        setStandings(null);
      }
    }, (err) => {
      console.error("Error observing standings:", err);
    });

    // 6. Observe bracket document
    const bracketRef = doc(db, "games", currentGameId, "bracket", "data");
    const unsubscribeBracket = onSnapshot(bracketRef, (snap) => {
      if (snap.exists()) {
        setBracket(snap.data() as BracketData);
      } else {
        setBracket(null);
      }
    }, (err) => {
      console.error("Error observing bracket:", err);
    });

    return () => {
      unsubscribeGameMeta();
      unsubscribePlayerProfile();
      unsubscribeGameTeams();
      unsubscribeGamePlayers();
      unsubscribeStandings();
      unsubscribeBracket();
    };
  }, [user, currentGameId]);

  // Client-side Lazy Updates check on current game metadata changes
  useEffect(() => {
    if (!metadata || !metadata.gachaTriggered || !metadata.lastUpdated || !currentGameId) return;

    try {
      let lastUpdatedDate: Date;
      if (metadata.lastUpdated.toDate) {
        lastUpdatedDate = metadata.lastUpdated.toDate();
      } else if (metadata.lastUpdated instanceof Date) {
        lastUpdatedDate = metadata.lastUpdated;
      } else {
        lastUpdatedDate = new Date(metadata.lastUpdated);
      }

      const today = new Date();
      if (lastUpdatedDate.toDateString() !== today.toDateString()) {
        console.log("New day detected inside active game space! Running lazy simulation...");
        simulateMatchDay();
      }
    } catch (e) {
      console.error("Error reading lastUpdated date:", e);
    }
  }, [metadata, currentGameId]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      metadata,
      teams,
      users,
      games,
      currentGameId,
      currentGame,
      loading,
      actionLoading,
      error,
      signIn,
      logOut,
      simulateMatchDay,
      clearError,
      setCurrentGameId,
      createGame,
      createAndSeedGame,
      createFullMockGame,
      fillTeams,
      joinGame,
      fetchAndApplyRealResults,
      syncMatchesFromApiFootball,
      applyManualMatchResult,
      triggerGachaLottery,
      standings,
      bracket,
      syncStandingsAndBracket
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
