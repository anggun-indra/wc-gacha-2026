import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./components/Login";
import { Lobby } from "./components/Lobby";
import { Dashboard } from "./components/Dashboard";
import { Leaderboard } from "./components/Leaderboard";
import { Trophy, ShieldCheck, Loader2, Sparkles, ArrowLeft, Calendar } from "lucide-react";

const AppContent: React.FC = () => {
  const { user, loading, metadata, currentGameId, currentGame, setCurrentGameId } = useAuth();

  // Loading skeleton screen
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-3" />
        <p className="font-sans text-sm font-semibold tracking-wide text-slate-300">
          Memuat Sistem Turnamen Piala Dunia...
        </p>
      </div>
    );
  }

  // Not signed in -> login component
  if (!user) {
    return <Login />;
  }

  // Not in a game room -> show lobby directory
  if (!currentGameId) {
    return <Lobby />;
  }

  const userCount = metadata?.userCount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12 px-4">
      {/* Active Game Room Ambient Lights */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl pt-6 space-y-6">
        
        {/* Navigation & Header matching mockup design */}
        <nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-900/40 p-4 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentGameId(null)}
              className="w-10 h-10 border border-slate-800 bg-slate-950 hover:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 hover:text-white transition duration-300 cursor-pointer"
              title="Kembali ke Lobby Utama"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white uppercase italic flex items-center gap-2">
                <Trophy className="h-4 w-4 text-indigo-400" />
                {currentGame?.name}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">SERI TURNAMEN INTERAKTIF</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end sm:self-center">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[9px] font-bold text-slate-550 text-slate-500 uppercase tracking-widest block">Anggota Terdaftar</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${userCount >= 8 ? "bg-indigo-505 bg-indigo-500 shadow-[0_0_8px_#6366f1]" : "bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"}`}></span>
                <span className="text-xs font-semibold text-slate-200">
                  {userCount} / 8 Pemain {userCount >= 8 && "(Penuh)"}
                </span>
              </div>
            </div>
            
            <div className="hidden sm:block h-8 w-[1px] bg-slate-800"></div>

            <button
              onClick={() => setCurrentGameId(null)}
              className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-2 px-4 text-xs font-bold uppercase text-white shadow-lg shadow-indigo-600/20 transition duration-300 active:scale-95 cursor-pointer"
            >
              Lobby Game
            </button>
          </div>
        </nav>

        {/* Primary Screen content Columns */}
        <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* LEFT: Participant Squads View, simulations and latest log */}
          <div className="lg:col-span-2 space-y-6">
            <Dashboard />
          </div>

          {/* RIGHT: Selected Room Leaderboard, statistics & background system data */}
          <div className="lg:col-span-1 space-y-6">
            <Leaderboard />

            {/* Quick Informative Info Block */}
            <div className="card-glass p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2.5 mb-3">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pelari Latar Belakang (Lazy Update)
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Skor harian disinkronisasikan secara otomatis pada kedatangan klien pertama di esok harinya. Hal ini memotong biaya infrastruktur menjadi 100% serverless dan gratis.
              </p>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Terakhir Diperbaharui</span>
                <span className="text-xs font-mono text-indigo-300 font-semibold block mt-1">
                  {metadata?.lastUpdated ? (
                    metadata.lastUpdated.toDate 
                      ? metadata.lastUpdated.toDate().toLocaleString("id-ID")
                      : new Date(metadata.lastUpdated).toLocaleString("id-ID")
                  ) : "-"}
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Global footer layout */}
        <footer className="flex flex-col sm:flex-row justify-between items-center px-5 py-3 bg-slate-900/15 rounded-2xl border border-slate-800/80 text-[10px] text-slate-505 text-slate-500 uppercase tracking-widest gap-2">
          <span>Active Collection Path: games/{currentGameId}/players/{`{uid}`}</span>
          <span>Built for World Cup Enthusiests • Zero-Cost Architecture</span>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
