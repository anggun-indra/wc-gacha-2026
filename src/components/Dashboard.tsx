import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, RefreshCw, Calendar, Flame, Sparkles, TrendingUp, HelpCircle, ShieldCheck } from "lucide-react";
import { getFlagUrl } from "../lib/flags";

export const Dashboard: React.FC = () => {
  const { user, profile, metadata, teams, logOut, simulateMatchDay, fetchAndApplyRealResults, applyManualMatchResult, triggerGachaLottery, actionLoading } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState("2026-06-11");
  const [manualTeamA, setManualTeamA] = React.useState("");
  const [manualTeamB, setManualTeamB] = React.useState("");
  const [manualScoreA, setManualScoreA] = React.useState<number>(0);
  const [manualScoreB, setManualScoreB] = React.useState<number>(0);

  if (!profile) return null;

  // Find user's actual teams in the complete teams list
  const favoritTeam = teams.find((t) => t.name === profile.favoritTeam);
  const darkTeam = teams.find((t) => t.name === profile.darkHorseTeam);
  const menengahAtasTeam = teams.find((t) => t.name === profile.menengahAtasTeam);
  const menengahTeam = teams.find((t) => t.name === profile.menengahTeam);
  const underdogKompetitifTeam = teams.find((t) => t.name === profile.underdogKompetitifTeam);
  const underdogBeratTeam = teams.find((t) => t.name === profile.underdogBeratTeam);

  const totalPoints = 
    (favoritTeam?.points || 0) + 
    (darkTeam?.points || 0) + 
    (menengahAtasTeam?.points || 0) + 
    (menengahTeam?.points || 0) + 
    (underdogKompetitifTeam?.points || 0) + 
    (underdogBeratTeam?.points || 0);

  return (
    <div className="space-y-6">
      {/* 1. Profile Overview Container with Sleek Glass Styling */}
      <div className="card-glass rounded-3xl p-5 shadow-2xl relative overflow-hidden transition duration-300 hover:border-slate-800">
        <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={profile.photoURL} 
                alt={profile.name} 
                className="h-14 w-14 rounded-full border-2 border-indigo-500 bg-slate-950 object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-slate-900 shadow-[0_0_8px_#22c55e]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-lg font-bold tracking-tight text-white">{profile.name}</h2>
                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-bold text-indigo-400 uppercase ring-1 ring-indigo-505/20">
                  Manajer Aktif
                </span>
              </div>
              <p className="font-mono text-xs text-slate-400 mt-0.5">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
               onClick={logOut}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Keluar Sesi
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Phase State */}
      {!metadata?.gachaTriggered ? (
        /* Waiting For Gacha phase */
        <div className="card-glass rounded-3xl border-dashed p-8 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-4 animate-pulse">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h3 className="font-sans text-lg font-bold text-white">Menunggu Proses Pengundian Tim</h3>
          <p className="mx-auto mt-2 text-sm text-slate-400 max-w-sm leading-relaxed">
            Pendaftaran terbuka! Saat ini ada <strong className="text-indigo-400 font-mono text-base">{metadata?.userCount || 0} / 8</strong> pemain terdaftar.
          </p>

          {/* Admin Draw triggers */}
          {user?.email === "yusufma9292@gmail.com" ? (
            <div className="mt-6 mx-auto max-w-md rounded-2xl bg-indigo-950/20 border border-indigo-500/20 p-5 space-y-4">
              <div className="flex items-center gap-2 justify-center text-xs font-bold text-indigo-300 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                Panel Admin Yusuf
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                Sebagai Administrator, Anda memegang kendali penuh untuk mematangkan pengundian acak. Tombol undian di bawah ini akan aktif setelah jumlah pendaftar terkumpul tepat 8 peserta.
              </p>

              <button
                type="button"
                onClick={async () => {
                  if ((metadata?.userCount || 0) < 8) return;
                  await triggerGachaLottery();
                }}
                disabled={actionLoading || (metadata?.userCount || 0) !== 8}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-sans text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer shadow-lg ${
                  (metadata?.userCount || 0) === 8
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/55"
                }`}
              >
                <Sparkles className="h-4 w-4 text-white shrink-0 animate-spin-pulse" />
                {actionLoading 
                  ? "Sedang Mengundi..." 
                  : (metadata?.userCount || 0) === 8 
                    ? "Mulai Pengundian Acak Peserta Sekarang!" 
                    : `Menunggu Pendaftar Lengkap (${metadata?.userCount || 0}/8)`
                }
              </button>
            </div>
          ) : (
            <div className="mt-5 mx-auto max-w-sm rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4">
              <p className="text-xs text-amber-300/90 leading-relaxed font-sans">
                💡 {(metadata?.userCount || 0) === 8 
                  ? "Seluruh 8 peserta telah terdaftar! Menunggu Admin Yusuf memulai pengundian acak secara adil." 
                  : `Menunggu ${8 - (metadata?.userCount || 0)} pemain lagi bergabung sebelum Admin Yusuf melakukan pengundian.`}
              </p>
            </div>
          )}
          
          {/* Detailed instructional preview */}
          <div className="mt-6 mx-auto max-w-sm rounded-2xl bg-slate-900/40 border border-slate-800/60 p-4 text-left">
            <h4 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2.5">
              <Sparkles className="h-3.5 w-3.5" />
              Aturan Pembagian Gacha
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-sans">
              <li>• Setiap pemain akan mendapatkan tepat <strong>6 Tim Nasional</strong> lintas potensi.</li>
              <li>• Komposisi tim: 1 Favorit, 1 Kuda Hitam, 1 Menengah Atas, 1 Menengah, 1 Underdog Kompetitif, 1 Underdog Berat.</li>
              <li>• Distribusi menggunakan <strong>Firestore Transactions</strong> untuk keadilan mutlak tanpa tim ganda.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Active Gacha Tournament Phase */
        <div className="space-y-6">
          {/* User's Assigned Team Cards Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400">
                Skuad Gacha Anda (6 Tim Nasional)
              </h3>
              <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
                Total Poin Anda: {totalPoints} PTS
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Favorit Card */}
              <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-600/10 p-4 group hover:bg-indigo-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-indigo-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  FAV
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-indigo-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-200 border border-indigo-500/30">
                    Pot 1: Favorit
                  </span>
                  <img 
                    src={getFlagUrl(profile.favoritTeam)} 
                    alt={profile.favoritTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.favoritTeam}
                </h4>
                
                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{favoritTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-indigo-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {favoritTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Dark Horse Team Card */}
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-600/10 p-4 group hover:bg-amber-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-amber-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  KUAT
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-amber-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-200 border border-amber-500/30">
                    Pot 2: Kuda Hitam
                  </span>
                  <img 
                    src={getFlagUrl(profile.darkHorseTeam)} 
                    alt={profile.darkHorseTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.darkHorseTeam}
                </h4>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{darkTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-amber-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {darkTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Menengah Atas Card */}
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-600/10 p-4 group hover:bg-emerald-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-emerald-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  MTAS
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-emerald-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-200 border border-emerald-500/30">
                    Pot 3: Menengah Atas
                  </span>
                  <img 
                    src={getFlagUrl(profile.menengahAtasTeam)} 
                    alt={profile.menengahAtasTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.menengahAtasTeam}
                </h4>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{menengahAtasTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-emerald-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {menengahAtasTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Menengah Card */}
              <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-sky-600/10 p-4 group hover:bg-sky-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-sky-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  MID
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-sky-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-sky-200 border border-sky-500/30">
                    Pot 4: Menengah
                  </span>
                  <img 
                    src={getFlagUrl(profile.menengahTeam)} 
                    alt={profile.menengahTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.menengahTeam}
                </h4>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{menengahTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-sky-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {menengahTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Underdog Kompetitif Card */}
              <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-600/10 p-4 group hover:bg-rose-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-rose-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  UNDK
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-rose-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-rose-200 border border-rose-500/30">
                    Pot 5: Underdog Kompetitif
                  </span>
                  <img 
                    src={getFlagUrl(profile.underdogKompetitifTeam)} 
                    alt={profile.underdogKompetitifTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.underdogKompetitifTeam}
                </h4>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{underdogKompetitifTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-rose-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {underdogKompetitifTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Underdog Berat Card */}
              <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-600/10 p-4 group hover:bg-purple-600/15 transition duration-300 shadow-xl">
                <div className="absolute -right-6 -bottom-6 text-purple-400/5 font-black text-5xl select-none group-hover:scale-110 transition duration-300 uppercase italic">
                  UNDB
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-purple-500/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-200 border border-purple-500/30">
                    Pot 6: Underdog Berat
                  </span>
                  <img 
                    src={getFlagUrl(profile.underdogBeratTeam)} 
                    alt={profile.underdogBeratTeam || "Flag"} 
                    className="h-4 w-6.5 rounded shadow object-cover" 
                  />
                </div>
                <h4 className="font-sans text-base font-bold text-white uppercase tracking-tight truncate">
                  {profile.underdogBeratTeam}
                </h4>

                <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Poin</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">{underdogBeratTeam?.points || 0} PTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-medium">Peluang</span>
                    <span className="font-mono text-sm font-bold text-purple-400 block mt-0.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      {underdogBeratTeam?.probability || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Latest Round Matches Log */}
          {metadata.latestMatches && metadata.latestMatches.length > 0 && (
            <div className="card-glass border-slate-800/60 p-5 rounded-3xl">
              <div className="mb-4 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-400">
                  Hasil Pertandingan Terakhir (Hari Ke-{metadata.dayCounter || 1})
                </h4>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {metadata.latestMatches.map((match, idx) => {
                  const winnerA = match.scoreA > match.scoreB;
                  const winnerB = match.scoreB > match.scoreA;

                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-3 text-xs"
                    >
                      {/* Team A */}
                      <span className={`w-[40%] font-semibold text-left truncate flex items-center gap-2 ${winnerA ? "text-white font-bold" : "text-slate-400"}`}>
                        <img 
                          src={getFlagUrl(match.teamA)} 
                          alt="" 
                          className="w-4.5 h-3 rounded-sm object-cover shrink-0" 
                        />
                        <span className="truncate">{match.teamA}</span>
                      </span>
                      
                      {/* Score Board */}
                      <span className="w-[20%] text-center px-2 py-0.5 rounded bg-slate-950 font-mono font-bold text-yellow-500 text-xs border border-slate-800">
                        {match.scoreA} - {match.scoreB}
                      </span>

                      {/* Team B */}
                      <span className={`w-[40%] font-semibold text-right truncate flex items-center justify-end gap-2 ${winnerB ? "text-white font-bold" : "text-slate-400"}`}>
                        <span className="truncate">{match.teamB}</span>
                        <img 
                          src={getFlagUrl(match.teamB)} 
                          alt="" 
                          className="w-4.5 h-3 rounded-sm object-cover shrink-0" 
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Manual / Dynamic Simulation Update Tester */}
          <div className="card-glass rounded-3xl p-6 border-slate-800/60 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-sans text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
                  Sistem Pembaruan Hasil Pertandingan
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Pilih metode pembaruan hasil pertandingan Piala Dunia di bawah ini untuk memperbarui klasemen.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Option A: Simulated (RNG) */}
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/5 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-sans text-[11px] font-bold text-indigo-300 uppercase tracking-wider">A. Simulasi Kejuaraan (RNG)</h5>
                      <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                        Simulasikan hasil pertandingan acak secara instan berdasarkan kekuatan tier masing-masing negara (France, Brazil, Argentina memiliki probabilitas menang lebih besar).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => simulateMatchDay()}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] py-2.5 text-center font-sans text-xs font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-white ${actionLoading ? "animate-spin" : ""}`} />
                    {actionLoading ? "Menyimulasikan..." : "Simulasikan Hari Acak Baru"}
                  </button>
                </div>
              </div>

              {/* Option B: Manual Entry Form */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-950/5 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Flame className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-sans text-[11px] font-bold text-amber-300 uppercase tracking-wider">B. Input Hasil Pertandingan Manual</h5>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                      Masukkan hasil skor pertandingan secara mandiri demi memperbarui klasemen klasifikasi secara instan.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-1">
                  {/* Team A Picker */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-sans block">Tim A:</label>
                    <select
                      value={manualTeamA}
                      onChange={(e) => setManualTeamA(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-indigo-500 font-sans"
                    >
                      <option value="">-- Pilih Tim A --</option>
                      {teams.map((t) => (
                        <option key={`manual-a-${t.id}`} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team B Picker */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-sans block">Tim B:</label>
                    <select
                      value={manualTeamB}
                      onChange={(e) => setManualTeamB(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-indigo-500 font-sans"
                    >
                      <option value="">-- Pilih Tim B --</option>
                      {teams.map((t) => (
                        <option key={`manual-b-${t.id}`} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-1">
                  {/* Score A Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-sans block">Skor Tim A:</label>
                    <input
                      type="number"
                      min="0"
                      value={manualScoreA}
                      onChange={(e) => setManualScoreA(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-indigo-500 font-mono"
                    />
                  </div>

                  {/* Score B Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-sans block">Skor Tim B:</label>
                    <input
                      type="number"
                      min="0"
                      value={manualScoreB}
                      onChange={(e) => setManualScoreB(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!manualTeamA || !manualTeamB) return;
                    await applyManualMatchResult(manualTeamA, manualTeamB, manualScoreA, manualScoreB);
                    setManualScoreA(0);
                    setManualScoreB(0);
                  }}
                  disabled={actionLoading || !manualTeamA || !manualTeamB}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-[0.98] py-2.5 text-center font-sans text-xs font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  <Flame className="h-3.5 w-3.5 text-white" />
                  {actionLoading ? "Memproses Pembaruan..." : "Terapkan Hasil Pertandingan"}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-center text-slate-500 leading-normal font-sans">
              *Tarik Hasil Asli menggunakan Google Search Grounding memerlukan tanggal aktif saat World Cup 2026 berlangsung (dimulai Juni 11, 2026).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
