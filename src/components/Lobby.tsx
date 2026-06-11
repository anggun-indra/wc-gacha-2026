import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  Play, 
  Users, 
  Trophy, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  Compass, 
  Sparkles, 
  UserCheck, 
  Database, 
  LogOut, 
  RefreshCw,
  Eye,
  Loader2
} from "lucide-react";

export const Lobby: React.FC = () => {
  const { 
    user, 
    games, 
    actionLoading, 
    error, 
    createGame,
    createAndSeedGame,
    createFullMockGame, 
    fillTeams, 
    joinGame, 
    setCurrentGameId, 
    logOut, 
    clearError 
  } = useAuth();

  const [newGameName, setNewGameName] = useState("");
  const isAdmin = user?.email?.toLowerCase() === "yusufma9292@gmail.com";

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;
    await createGame(newGameName.trim());
    setNewGameName("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 px-4">
      {/* Lobby Decorative Ambient Lights */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-505/10 bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl pt-8 space-y-10">
        
        {/* Lobby Top Navbar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/45 p-5 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-650 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                WorldCup <span className="text-indigo-400">Gacha Lobby</span>
              </h1>
              <p className="text-xs text-slate-400">Pilih turnamen, undi gacha, dan ikuti klasemen Anda!</p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            {user && (
              <div className="flex items-center gap-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 px-4 py-2">
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} 
                  alt="" 
                  className="w-7 h-7 rounded-full border border-indigo-500 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={logOut}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/70 py-2.5 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition duration-300 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-300 shadow-xl">
            <div className="flex gap-3">
              <ShieldAlert className="h-5.5 w-5.5 shrink-0 text-rose-500" />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wider text-rose-400">Operasi Gagal</p>
                <p className="mt-1 text-slate-300 font-medium leading-relaxed">{error}</p>
              </div>
            </div>
            <button 
              onClick={clearError}
              className="mt-3 font-sans text-[11px] font-bold text-rose-450 text-rose-450 hover:text-rose-400 underline underline-offset-2 uppercase tracking-widest cursor-pointer"
            >
              Tutup Pesan
            </button>
          </div>
        )}

        {/* Dynamic Welcome Hero */}
        <div className="bg-gradient-to-r from-slate-900/60 to-slate-900/20 rounded-3xl p-6 md:p-8 border border-slate-800/60 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none ring-1 ring-indigo-500/20">
              <Sparkles className="h-3 w-3" />
              MULTIPLE ACTIVE ROOMS
            </span>
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
              SISTEM GAME <span className="text-indigo-400">WORLD CUP GACHA</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
              Selamat datang di dunia prediksi sepak bola modern! Anda bisa ikut mendaftar di turnamen apa pun yang belum penuh (maksimal 8 pemain). Setelah kuota 8 pemain tercapai, sistem akan otomatis melakukan pengundian 6 Tim Nasional secara instan!
            </p>
          </div>
          <div className="flex md:flex-col justify-between items-center gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50 shrink-0 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Game Aktif</span>
              <span className="text-3xl font-black text-white font-mono block mt-1">{games.length} UNITS</span>
            </div>
            <div className="h-10 w-[1px] md:h-[1px] md:w-full bg-slate-800" />
            <div className="text-center md:text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Lisensi Manager</span>
              <span className="text-emerald-400 text-xs font-bold font-mono block mt-1 flex items-center gap-1.5 justify-end">
                <Compass className="w-4 h-4" /> VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Game Selection List & Admin Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Game Room Catalog List (2 columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-400" />
                DAFTAR SESI GAME TERSEDIA
              </h3>
              <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider">REALTIME CATALOG</span>
            </div>

            {games.length === 0 ? (
              <div className="bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/80 p-12 text-center">
                <Compass className="h-12 w-12 text-slate-700 mx-auto animate-pulse mb-3" />
                <h4 className="text-base font-bold text-slate-300">Belum Ada Sesi Turnamen</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Saat ini belum ada turnamen yang dibuat oleh Admin.
                </p>
                 {isAdmin ? (
                  <div className="mt-6 flex flex-col items-center gap-4">
                    <p className="text-[11px] text-indigo-400 max-w-sm font-semibold uppercase tracking-wider leading-relaxed">
                      Sistem mendeteksi Anda sebagai Admin (yusufma9292)
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => createAndSeedGame("World Cup Gacha Season 1")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-650 to-purple-650 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-indigo-650/20 active:scale-[0.98] cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        ⚡ Inisialisasi Turnamen Utama
                      </button>

                      <button
                        onClick={() => createFullMockGame("Testing Gacha Cup 1")}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg active:scale-[0.98] cursor-pointer"
                      >
                        {actionLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Compass className="w-4 h-4 text-white" />
                        )}
                        ⚽ Buat Game Penuh (Gacha Test)
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-550 text-slate-500 font-mono">
                      (Turnamen Utama = game kosong | Gacha Test = langsung berisi 8 pemain & gacha terbagi)
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-2 font-semibold uppercase tracking-wider">
                    Hubungi Admin untuk meluncurkan turnamen baru!
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => {
                  const isFull = game.playerCount >= 8;
                  const isCreatedByAdmin = game.createdBy === user?.uid;
                  const isRegistered = user && game.playerIds?.includes(user?.uid) ? true : false;
                  
                  return (
                    <div 
                      key={game.id}
                      className="group relative rounded-3xl border border-slate-800 bg-slate-900/25 p-5 hover:border-slate-700/80 hover:bg-slate-900/40 transition duration-300 flex flex-col justify-between shadow-lg"
                    >
                      {/* Left accent strip */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-lg ${
                        game.gachaTriggered 
                          ? "bg-gradient-to-b from-indigo-500 to-purple-500" 
                          : "bg-emerald-500"
                      }`} />

                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                            ID: {game.id}
                          </span>
                          
                          {/* Live Status Tag */}
                          {game.gachaTriggered ? (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20 flex items-center gap-1 shadow-sm">
                              <Activity className="w-2.5 h-2.5 animate-pulse" />
                              Aktif - Day {game.dayCounter}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1 shadow-sm">
                              <UserCheck className="w-2.5 h-2.5" />
                              Pendaftaran Terbuka
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-white uppercase group-hover:text-indigo-400 transition truncate pl-2">
                            {game.name}
                          </h4>
                          
                          <div className="mt-3 grid grid-cols-2 gap-3 pl-2 text-xs">
                            <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-800/40">
                              <span className="text-[9px] text-slate-505 text-slate-500 block uppercase font-medium">Joined Players</span>
                              <span className={`font-mono font-bold block mt-1 ${isFull ? "text-rose-500" : "text-slate-200"}`}>
                                <Users className="inline-block w-3.5 h-3.5 mr-1 text-slate-400 relative top-[-1px]" />
                                {game.playerCount || 0} / 8 Pemain
                              </span>
                            </div>

                            <div className="bg-slate-950/30 p-2 rounded-xl border border-slate-800/40">
                              <span className="text-[9px] text-slate-505 text-slate-500 block uppercase font-medium">Team Database</span>
                              <span className={`font-semibold block mt-1 ${game.teamsFilled ? "text-emerald-400" : "text-rose-500"}`}>
                                <Database className="inline-block w-3.5 h-3.5 mr-1 text-slate-400 relative top-[-1px]" />
                                {game.teamsFilled ? "Telah Diisi" : "Belum Diisi"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Buttons footer */}
                      <div className="mt-5 border-t border-slate-800/60 pt-4 flex gap-2 pl-2">
                        {game.gachaTriggered ? (
                          <button
                            onClick={() => setCurrentGameId(game.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-bold uppercase tracking-wide cursor-pointer transition active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Masuk Turnamen
                          </button>
                        ) : (
                          <>
                            {/* Join game button if not full and teams are populated */}
                            {isRegistered ? (
                              <button
                                onClick={() => setCurrentGameId(game.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans text-xs font-bold uppercase tracking-wide cursor-pointer transition active:scale-95 shadow-lg shadow-emerald-600/10"
                              >
                                <Play className="w-3.5 h-3.5" />
                                Masuk Turnamen
                              </button>
                            ) : (
                              <button
                                onClick={() => joinGame(game.id)}
                                disabled={actionLoading || isFull || !game.teamsFilled}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                                  !game.teamsFilled
                                    ? "bg-slate-800 border border-slate-700/60 text-slate-505 text-slate-550 text-slate-500 cursor-not-allowed"
                                    : isFull
                                      ? "bg-slate-800 border border-slate-700/60 text-slate-500 cursor-not-allowed"
                                      : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/10"
                                }`}
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                {!game.teamsFilled ? "Belum Diisikan Tim" : isFull ? "Kuota Penuh" : "Daftar / Ikuti"}
                              </button>
                            )}

                            {/* View Spectator button */}
                            <button
                              onClick={() => setCurrentGameId(game.id)}
                              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white transition duration-300 active:scale-95 text-slate-300"
                              title="Masuk sebagai Spectator"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Admin Panels (Created for verified yusufma9292@gmail.com) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Admin Verification and Controls */}
            {isAdmin ? (
              <div className="relative rounded-3xl border border-indigo-500/20 bg-indigo-950/20 p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="absolute top-[-20px] right-[-20px] w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl" />

                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-200">
                    Menu Utama Admin
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Selamat datang Admin <strong>(yusufma9292)</strong>. Anda memiliki otoritas penuh untuk membuat sesi turnamen game baru dan mengisikan tim database 48 negara. 
                </p>

                {/* Create game form */}
                <form onSubmit={handleCreateGame} className="space-y-4 border-b border-slate-800 pb-6 mb-6">
                  <div>
                    <label className="text-[10px] text-slate-405 text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                      Nama Game Baru
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: World Cup Seri A"
                      required
                      value={newGameName}
                      onChange={(e) => setNewGameName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-505 focus:border-indigo-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !newGameName.trim()}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans text-xs font-bold uppercase tracking-wider transition duration-350 cursor-pointer shadow-lg"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    BUAT SESI GAME
                  </button>
                </form>

                {/* Instant seed option for convenience */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-800">
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-800/80"></div>
                    <span className="flex-shrink mx-3 text-[9px] text-slate-500 font-bold tracking-widest uppercase">ATAU</span>
                    <div className="flex-grow border-t border-slate-800/80"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => createAndSeedGame(`World Cup Gacha Season ${games.length + 1}`)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 hover:border-indigo-400/50 hover:bg-slate-900 text-indigo-300 font-sans text-xs font-bold uppercase tracking-wider transition duration-350 cursor-pointer shadow-sm hover:text-white"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    )}
                    Buat & Isi 48 Tim Instan
                  </button>

                  <button
                    type="button"
                    onClick={() => createFullMockGame(`Testing Gacha Cup ${games.length + 1}`)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-650 to-teal-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans text-xs font-bold uppercase tracking-wider transition duration-350 cursor-pointer shadow-md"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Compass className="w-4 h-4 text-white" />
                    )}
                    Buat Game Penuh (Gacha Test)
                  </button>
                  <p className="text-[10px] text-slate-500 text-center text-indigo-400/80 leading-snug">
                    (Langsung berisi 8 pemain & gacha terbagi sempurna sesuai rencana)
                  </p>
                </div>

                {/* Seed / Fill teams for unseeded games */}
                <div className="space-y-3.5">
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">
                    Isi Tim Game Terbuka ({games.filter(g => !g.teamsFilled).length})
                  </h4>

                  {games.filter(g => !g.teamsFilled).length === 0 ? (
                    <p className="text-[11px] text-slate-550 text-slate-500 italic">
                      Semua tim game saat ini telah diisi.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {games.filter(g => !g.teamsFilled).map((game) => (
                        <div 
                          key={game.id}
                          className="flex items-center justify-between bg-slate-950/50 p-3 rounded-2xl border border-slate-900 text-xs"
                        >
                          <span className="font-bold text-white truncate max-w-[130px]" title={game.name}>
                            {game.name}
                          </span>
                          <button
                            onClick={() => fillTeams(game.id)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-505 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wide transition duration-200 cursor-pointer"
                          >
                            <Database className="w-3 h-3" />
                            Isi Tim
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/10 p-5 text-slate-450 text-center">
                <Compass className="h-10 w-10 text-slate-800 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Akses Admin Terbatas</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  Hanya admin dengan email terverifikasi <strong>yusufma9292@gmail.com</strong> yang dapat melihat panel kendali rilis game dan inisialisasi tim di sini.
                </p>
              </div>
            )}

            {/* Quick platform features guide card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
                  Panduan Fitur Lobby
                </h4>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-450 text-slate-400 leading-relaxed">
                <li>
                  <strong>1. Sistem Multi-Game:</strong> Anda tidak lagi terbatas pada satu turnamen global. Hubungi admin untuk meluncurkan grup cup baru kapan saja!
                </li>
                <li>
                  <strong>2. Transaksi Enkripsi:</strong> Semua pendataan dan pembagian gacha 6 negara diverifikasi penuh di level basis data Firestore.
                </li>
                <li>
                  <strong>3. Mode Penonton:</strong> Anda dapat mengklik tombol "Mata" pada game yang sedang berjalan untuk memonitor klasemen meski tidak tergabung!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
