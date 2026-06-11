import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Trophy, TrendingUp, Calendar, ChevronDown, ChevronUp, Award, Zap } from "lucide-react";
import { getFlagUrl } from "../lib/flags";

// Helper to find World Cup champion from bracket data
const getWorldCupChampion = (bracket: any): string | null => {
  if (!bracket || !bracket.rounds) return null;
  const finalMatches = bracket.rounds["Final"];
  if (!finalMatches || finalMatches.length === 0) return null;
  const finalMatch = finalMatches[0];
  const finished = ["FT", "AET", "PEN"].includes(finalMatch.status);
  if (!finished) return null;
  if (finalMatch.winner === "home") return finalMatch.homeTeam;
  if (finalMatch.winner === "away") return finalMatch.awayTeam;
  return null;
};

// Helper to check if user owns the World Cup champion team
const isOwnerOfWorldCupChampion = (profile: any, championName: string | null): boolean => {
  if (!profile || !championName) return false;
  const cName = championName.toLowerCase();
  return (
    profile.favoritTeam?.toLowerCase() === cName ||
    profile.darkHorseTeam?.toLowerCase() === cName ||
    profile.menengahAtasTeam?.toLowerCase() === cName ||
    profile.menengahTeam?.toLowerCase() === cName ||
    profile.underdogKompetitifTeam?.toLowerCase() === cName ||
    profile.underdogBeratTeam?.toLowerCase() === cName
  );
};

export const Leaderboard: React.FC = () => {
  const { users, teams, metadata, bracket } = useAuth();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const championTeam = getWorldCupChampion(bracket);

  // Helper to map and calculate scores for leaderboard profiles
  const leaderboardData = users.map((u) => {
    const favoritTeam = teams.find((t) => t.name === u.favoritTeam);
    const darkTeam = teams.find((t) => t.name === u.darkHorseTeam);
    const menengahAtasTeam = teams.find((t) => t.name === u.menengahAtasTeam);
    const menengahTeam = teams.find((t) => t.name === u.menengahTeam);
    const underdogKompetitifTeam = teams.find((t) => t.name === u.underdogKompetitifTeam);
    const underdogBeratTeam = teams.find((t) => t.name === u.underdogBeratTeam);

    const fPoints = favoritTeam?.points || 0;
    const dPoints = darkTeam?.points || 0;
    const maPoints = menengahAtasTeam?.points || 0;
    const mPoints = menengahTeam?.points || 0;
    const ukPoints = underdogKompetitifTeam?.points || 0;
    const ubPoints = underdogBeratTeam?.points || 0;

    const basePoints = fPoints + dPoints + maPoints + mPoints + ukPoints + ubPoints;

    const topProb = favoritTeam?.probability || 0;
    const darkProb = darkTeam?.probability || 0;
    const maProb = menengahAtasTeam?.probability || 0;
    const mProb = menengahTeam?.probability || 0;
    const ukProb = underdogKompetitifTeam?.probability || 0;
    const ubProb = underdogBeratTeam?.probability || 0;
    const highestProbability = Math.max(topProb, darkProb, maProb, mProb, ukProb, ubProb);

    return {
      profile: u,
      favoritTeam,
      darkTeam,
      menengahAtasTeam,
      menengahTeam,
      underdogKompetitifTeam,
      underdogBeratTeam,
      basePoints,
      fPoints,
      dPoints,
      maPoints,
      mPoints,
      ukPoints,
      ubPoints,
      highestProbability
    };
  });

  // Find highest basePoints of players who do NOT own the World Cup champion
  let maxOthersPoints = 0;
  leaderboardData.forEach((item) => {
    const isOwner = isOwnerOfWorldCupChampion(item.profile, championTeam);
    if (!isOwner) {
      if (item.basePoints > maxOthersPoints) {
        maxOthersPoints = item.basePoints;
      }
    }
  });

  // Calculate final totalPoints with bonus
  const finalLeaderboardData = leaderboardData.map((item) => {
    const isOwner = isOwnerOfWorldCupChampion(item.profile, championTeam);
    let bonusPoints = 0;
    if (isOwner && championTeam) {
      // Calculate bonus so they jump to the first place by at least 10 points (minimum 100 points bonus)
      bonusPoints = Math.max(100, (maxOthersPoints - item.basePoints) + 10);
    }
    const totalPoints = item.basePoints + bonusPoints;
    return {
      ...item,
      totalPoints,
      bonusPoints,
      isWorldCupChampionOwner: isOwner && !!championTeam
    };
  });

  // Sort Leaderboard strictly:
  // 1. Combined Points Descending
  // 2. Highest Single Team Championship Probability Descending (Tie breaker)
  const sortedLeaderboard = [...finalLeaderboardData].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.highestProbability - a.highestProbability;
  });

  const toggleExpand = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (!metadata?.gachaTriggered) {
    return (
      <div className="card-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
          <Trophy className="mb-4 h-12 w-12 text-slate-700 animate-pulse" />
          <h2 className="font-sans text-base font-bold text-white">Klasemen Belum Dimulai</h2>
          <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed">
            Klasemen dan poin kompetisi akan otomatis muncul di sini setelah 8 pemain terdaftar dan tim telah diundi (Gacha).
          </p>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-4 py-1 text-[11px] font-bold text-indigo-300 ring-1 ring-indigo-500/20">
            Pemain Terdaftar: {metadata?.userCount || 0} / 8
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass rounded-3xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header section matching mockup style */}
      <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Papan Peringkat Global
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Penjumlahan poin dari tim milik tiap pemain</p>
        </div>
        <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded-full border border-indigo-500/20 tracking-wider">
          LIVE UPDATES
        </span>
      </div>

      <div className="p-3 border-b border-indigo-950/20 bg-indigo-950/10 text-[11px] text-slate-400 flex items-start gap-2">
        <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-normal">
          <strong>Aturan Tie-breaker:</strong> Jika total poin sama, peringkat ditentukan oleh <strong>Peluang Juara Tertinggi</strong> salah satu tim.
        </p>
      </div>

      {/* Ranks Table-like list layout */}
      <div className="divide-y divide-slate-800/80 overflow-hidden">
        {sortedLeaderboard.map((item, index) => {
          const isExpanded = expandedUser === item.profile.userId;
          const rank = index + 1;
          
          let rankBadgeClass = "bg-slate-800 text-slate-400";
          if (rank === 1) rankBadgeClass = "bg-amber-500 text-slate-950 font-black";
          if (rank === 2) rankBadgeClass = "bg-slate-300 text-slate-900 font-extrabold";
          if (rank === 3) rankBadgeClass = "bg-indigo-600 text-indigo-50 font-extrabold";

          return (
            <div 
              key={item.profile.userId}
              className={`transition-all duration-200 ${
                isExpanded ? "bg-slate-900/70" : "bg-transparent hover:bg-slate-900/30"
              }`}
            >
              {/* Row content */}
              <div 
                onClick={() => toggleExpand(item.profile.userId)}
                className="flex items-center justify-between p-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Position Badge */}
                  <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[11px] font-bold ${rankBadgeClass}`}>
                    {rank}
                  </span>

                  {/* Manager info with profile photo */}
                  <img 
                    src={item.profile.photoURL} 
                    alt="" 
                    className="w-8 h-8 rounded-full border border-slate-800 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-100 flex items-center gap-1">
                      {item.profile.name}
                      {item.isWorldCupChampionOwner && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-extrabold text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          🏆 JUARA WORLD CUP
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 bg-slate-950/20 px-1.5 py-0.5 rounded-md w-max border border-slate-800/40">
                      <img src={getFlagUrl(item.profile.favoritTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.favoritTeam || ""} />
                      <img src={getFlagUrl(item.profile.darkHorseTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.darkHorseTeam || ""} />
                      <img src={getFlagUrl(item.profile.menengahAtasTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.menengahAtasTeam || ""} />
                      <img src={getFlagUrl(item.profile.menengahTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.menengahTeam || ""} />
                      <img src={getFlagUrl(item.profile.underdogKompetitifTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.underdogKompetitifTeam || ""} />
                      <img src={getFlagUrl(item.profile.underdogBeratTeam)} alt="" className="w-3.5 h-2.5 rounded shadow-sm shrink-0" title={item.profile.underdogBeratTeam || ""} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-black text-white block">
                      {item.totalPoints}
                    </span>
                    {item.bonusPoints > 0 ? (
                      <span className="text-[8px] text-emerald-400 font-bold block animate-pulse">
                        (+{item.bonusPoints} PTS BONUS)
                      </span>
                    ) : (
                      <span className="text-[9px] text-indigo-400 font-medium block">
                        Peluang: {item.highestProbability}%
                      </span>
                    )}
                  </div>
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expansion Detail panel */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-950/40 border-t border-slate-900/50 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                    {/* Favorit */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-indigo-300 font-bold uppercase truncate">{item.profile.favoritTeam}</span>
                        <img src={getFlagUrl(item.profile.favoritTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-500 font-medium">Favorit</span>
                        <span className="font-mono font-bold text-white">{item.fPoints} PTS</span>
                      </div>
                    </div>

                    {/* Dark Horse */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-amber-300 font-bold uppercase truncate">{item.profile.darkHorseTeam}</span>
                        <img src={getFlagUrl(item.profile.darkHorseTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-505 text-slate-500 font-medium">Kuda Hitam</span>
                        <span className="font-mono font-bold text-white">{item.dPoints} PTS</span>
                      </div>
                    </div>

                    {/* Menengah Atas */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-emerald-300 font-bold uppercase truncate">{item.profile.menengahAtasTeam}</span>
                        <img src={getFlagUrl(item.profile.menengahAtasTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-550 text-slate-500 font-medium">M. Atas</span>
                        <span className="font-mono font-bold text-white">{item.maPoints} PTS</span>
                      </div>
                    </div>

                    {/* Menengah */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-sky-300 font-bold uppercase truncate">{item.profile.menengahTeam}</span>
                        <img src={getFlagUrl(item.profile.menengahTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-550 text-slate-500 font-medium">Menengah</span>
                        <span className="font-mono font-bold text-white">{item.mPoints} PTS</span>
                      </div>
                    </div>

                    {/* Underdog Kompetitif */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-rose-300 font-bold uppercase truncate">{item.profile.underdogKompetitifTeam}</span>
                        <img src={getFlagUrl(item.profile.underdogKompetitifTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-550 text-slate-500 font-medium font-sans">U. Kompetitif</span>
                        <span className="font-mono font-bold text-white">{item.ukPoints} PTS</span>
                      </div>
                    </div>

                    {/* Underdog Berat */}
                    <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] text-purple-300 font-bold uppercase truncate">{item.profile.underdogBeratTeam}</span>
                        <img src={getFlagUrl(item.profile.underdogBeratTeam)} alt="" className="w-3.5 h-2.5 rounded-sm shrink-0" />
                      </div>
                      <div className="flex justify-between items-end mt-1 text-[10px]">
                        <span className="text-slate-550 text-slate-500 font-medium font-sans">U. Berat</span>
                        <span className="font-mono font-bold text-white">{item.ubPoints} PTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
