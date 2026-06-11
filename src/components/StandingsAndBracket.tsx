import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getFlagUrl } from "../lib/flags";
import { Trophy, Calendar, ShieldCheck, HelpCircle, Layers, GitCommit, Award } from "lucide-react";

export const StandingsAndBracket: React.FC = () => {
  const { standings, bracket } = useAuth();
  const [activeTab, setActiveTab] = useState<"standings" | "bracket">("standings");
  const [selectedBracketRound, setSelectedBracketRound] = useState<string>("Round of 32");

  // Round display names mapping
  const roundDisplayNames: Record<string, string> = {
    "Round of 32": "32 Besar",
    "Round of 16": "16 Besar",
    "Quarter-finals": "Perempat Final",
    "Semi-finals": "Semifinal",
    "Third place play-off": "Perebutan Juara 3",
    "Final": "Final"
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header inside Standings component */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/20 p-2.5 rounded-2xl shadow-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("standings")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-xl transition cursor-pointer ${
              activeTab === "standings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Layers className="h-4 w-4" />
            Klasemen Grup
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-xl transition cursor-pointer ${
              activeTab === "bracket"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <GitCommit className="h-4 w-4" />
            Bagan Gugur (Bracket)
          </button>
        </div>

        <span className="text-[10px] text-slate-550 text-slate-500 uppercase font-mono tracking-widest hidden sm:block pr-3">
          FASE AKTIF WORLD CUP 2026
        </span>
      </div>

      {/* 1. STANDINGS TAB VIEW */}
      {activeTab === "standings" && (
        <div>
          {!standings || !standings.groups || standings.groups.length === 0 ? (
            <div className="card-glass rounded-3xl p-8 text-center relative overflow-hidden border border-dashed border-slate-800/80">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-600 mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white">Klasemen Grup Belum Tersedia</h3>
              <p className="mx-auto mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
                Klasemen babak grup belum disinkronisasikan dari API-Football. Silakan minta Admin Yusuf untuk melakukan sinkronisasi klasemen terbaru.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {standings.groups.map((group, gIdx) => (
                <div key={gIdx} className="card-glass rounded-3xl p-4 border border-slate-800/80 shadow-2xl hover:border-slate-800 transition duration-300">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-850 border-slate-800/50">
                    <h4 className="font-sans text-xs font-black uppercase tracking-wider text-indigo-400">
                      {group.name}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono">Top 2 lolos otomatis</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/30 uppercase font-bold">
                          <th className="py-2 w-8 text-center">No</th>
                          <th className="py-2">Negara</th>
                          <th className="py-2 text-center w-8">M</th>
                          <th className="py-2 text-center w-8">M</th>
                          <th className="py-2 text-center w-8">S</th>
                          <th className="py-2 text-center w-8">K</th>
                          <th className="py-2 text-center w-10">SG</th>
                          <th className="py-2 text-center w-10 text-indigo-400">Poin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/25">
                        {group.teams.map((team, tIdx) => {
                          const isQualified = team.rank <= 2;
                          const isBestThird = team.rank === 3;
                          
                          let rankBg = "text-slate-400";
                          if (isQualified) rankBg = "text-emerald-400 font-bold bg-emerald-500/5 rounded-md";
                          else if (isBestThird) rankBg = "text-amber-400 bg-amber-500/5 rounded-md";

                          return (
                            <tr key={tIdx} className={`hover:bg-slate-900/10 transition ${isQualified ? "bg-emerald-500/[0.01]" : ""}`}>
                              <td className="py-2.5 text-center">
                                <span className={`inline-block w-5 h-5 leading-5 text-center text-[10px] ${rankBg}`}>
                                  {team.rank}
                                </span>
                              </td>
                              <td className="py-2.5 font-medium">
                                <div className="flex items-center gap-2 truncate">
                                  <img 
                                    src={getFlagUrl(team.name)} 
                                    alt="" 
                                    className="w-4.5 h-3 rounded-sm object-cover border border-slate-900/20 shrink-0" 
                                    onError={(e) => {
                                      // Fallback logo if flags fail or match is a generic API name
                                      if (team.logo) (e.target as HTMLImageElement).src = team.logo;
                                    }}
                                  />
                                  <span className="truncate text-slate-100 text-xs font-semibold">{team.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center font-mono text-slate-300">{team.played}</td>
                              <td className="py-2.5 text-center font-mono text-slate-400">{team.win}</td>
                              <td className="py-2.5 text-center font-mono text-slate-400">{team.draw}</td>
                              <td className="py-2.5 text-center font-mono text-slate-400">{team.lose}</td>
                              <td className={`py-2.5 text-center font-mono font-semibold ${team.goalsDiff > 0 ? "text-emerald-500" : team.goalsDiff < 0 ? "text-rose-500" : "text-slate-400"}`}>
                                {team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold text-white text-xs">{team.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. KNOCKOUT BRACKET TAB VIEW */}
      {activeTab === "bracket" && (
        <div className="space-y-6">
          {!bracket || !bracket.rounds || Object.keys(bracket.rounds).length === 0 ? (
            <div className="card-glass rounded-3xl p-8 text-center relative overflow-hidden border border-dashed border-slate-800/80">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-600 mb-4">
                <GitCommit className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white">Bagan Gugur Belum Tersedia</h3>
              <p className="mx-auto mt-2 text-xs text-slate-400 max-w-sm leading-relaxed">
                Bagan babak gugur belum disinkronisasikan dari API-Football. Silakan minta Admin Yusuf untuk melakukan sinkronisasi data bracket terbaru.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Round Selector Subtab bar */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-850 border-slate-800/40 w-max max-w-full overflow-x-auto">
                {Object.keys(bracket.rounds).map((roundKey) => {
                  const hasMatches = bracket.rounds[roundKey]?.length > 0;
                  return (
                    <button
                      key={roundKey}
                      onClick={() => setSelectedBracketRound(roundKey)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition uppercase tracking-wider shrink-0 cursor-pointer ${
                        selectedBracketRound === roundKey
                          ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/30"
                          : "text-slate-400 hover:text-white border border-transparent"
                      }`}
                    >
                      {roundDisplayNames[roundKey] || roundKey}
                      {hasMatches && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[8px] bg-slate-950 text-indigo-400 rounded-full font-mono">
                          {bracket.rounds[roundKey].length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Match Cards List */}
              {!bracket.rounds[selectedBracketRound] || bracket.rounds[selectedBracketRound].length === 0 ? (
                <div className="card-glass rounded-2xl p-6 text-center border-slate-800/60">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Belum ada pertandingan dijadwalkan atau dimulai di babak **{roundDisplayNames[selectedBracketRound] || selectedBracketRound}** ini.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bracket.rounds[selectedBracketRound].map((match, mIdx) => {
                    const finished = ["FT", "AET", "PEN"].includes(match.status);
                    
                    const winnerHome = match.winner === "home";
                    const winnerAway = match.winner === "away";

                    const timeFormatted = new Date(match.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div 
                        key={match.id || mIdx}
                        className="rounded-2xl border border-slate-800/80 bg-slate-900/20 p-4 space-y-3 shadow-xl hover:border-slate-800 transition duration-300 relative overflow-hidden"
                      >
                        {/* Date and Status Bar */}
                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/40 pb-2">
                          <span className="flex items-center gap-1.5 font-sans font-medium">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {timeFormatted}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wide ${
                            finished 
                              ? "bg-slate-950 text-slate-400 border border-slate-800"
                              : match.status === "NS"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"
                          }`}>
                            {finished ? (match.homePen !== null ? "FT (PEN)" : match.homeScore !== null ? "FT" : match.status) : match.status}
                          </span>
                        </div>

                        {/* Match Competitors details */}
                        <div className="space-y-2.5">
                          {/* Home Team */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 truncate">
                              <img 
                                src={getFlagUrl(match.homeTeam)} 
                                alt="" 
                                className="w-4.5 h-3 rounded-sm object-cover border border-slate-950/20 shrink-0" 
                                onError={(e) => {
                                  if (match.homeLogo) (e.target as HTMLImageElement).src = match.homeLogo;
                                }}
                              />
                              <span className={`text-xs truncate ${winnerHome ? "text-white font-extrabold" : finished ? "text-slate-550 text-slate-500" : "text-slate-200"}`}>
                                {match.homeTeam}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 font-mono text-sm">
                              {/* Regular score */}
                              <span className={`font-bold ${winnerHome ? "text-yellow-500 text-base" : finished ? "text-slate-500" : "text-slate-300"}`}>
                                {match.homeScore !== null ? match.homeScore : "-"}
                              </span>
                              {/* Penalties if any */}
                              {match.homePen !== null && (
                                <span className="text-[10px] text-slate-550 text-slate-500 bg-slate-950 px-1 py-0.5 rounded">
                                  ({match.homePen})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Away Team */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 truncate">
                              <img 
                                src={getFlagUrl(match.awayTeam)} 
                                alt="" 
                                className="w-4.5 h-3 rounded-sm object-cover border border-slate-950/20 shrink-0" 
                                onError={(e) => {
                                  if (match.awayLogo) (e.target as HTMLImageElement).src = match.awayLogo;
                                }}
                              />
                              <span className={`text-xs truncate ${winnerAway ? "text-white font-extrabold" : finished ? "text-slate-550 text-slate-500" : "text-slate-200"}`}>
                                {match.awayTeam}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 font-mono text-sm">
                              {/* Regular score */}
                              <span className={`font-bold ${winnerAway ? "text-yellow-500 text-base" : finished ? "text-slate-500" : "text-slate-300"}`}>
                                {match.awayScore !== null ? match.awayScore : "-"}
                              </span>
                              {/* Penalties if any */}
                              {match.awayPen !== null && (
                                <span className="text-[10px] text-slate-550 text-slate-500 bg-slate-950 px-1 py-0.5 rounded">
                                  ({match.awayPen})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
