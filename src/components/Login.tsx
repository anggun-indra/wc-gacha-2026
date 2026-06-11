import React from "react";
import { useAuth } from "../context/AuthContext";
import { Trophy, LogIn, ShieldAlert, Loader2, Sparkles } from "lucide-react";

export const Login: React.FC = () => {
  const { signIn, actionLoading, error, clearError } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      {/* Background Decorative Gradients matching Sleek Interface theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
        {/* Sleek Top Accent Header Color */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-4 ring-indigo-500/10 animate-pointer">
            <Trophy className="h-9 w-9 text-indigo-400" />
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-white uppercase italic">
            World Cup <span className="text-indigo-400">Gacha</span>
          </h1>
          <p className="mt-1.5 font-sans text-xs text-slate-400 font-medium uppercase tracking-widest">
            Prediksi & Alokasi Tim Otomatis
          </p>
        </div>

        <div className="my-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-[11px] font-bold text-indigo-400 uppercase tracking-widest leading-none ring-1 ring-indigo-500/20">
            <Sparkles className="h-3 w-3" />
            Sistem Multi-Room Aktif
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Masuk dengan akun Google Anda untuk mengakses lobby, memilih turnamen yang tersedia, mengundi gacha tim nasional, dan memantau klasemen langsung!
          </p>
        </div>

        {/* Error notifications */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-300">
            <div className="flex gap-2.5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
              <div className="text-xs">
                <p className="font-bold">Gagal Mendaftar / Masuk</p>
                <p className="mt-1 text-slate-400 font-medium leading-relaxed">{error}</p>
              </div>
            </div>
            <button 
              onClick={clearError}
              className="mt-3 font-sans text-xs font-semibold text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              Tutup Pesan
            </button>
          </div>
        )}

        {/* Authenticate Action */}
        <button
          id="google-signin-btn"
          disabled={actionLoading}
          onClick={signIn}
          className={`w-full flex items-center justify-center gap-3 rounded-2xl px-5 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
            actionLoading 
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
              : "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] cursor-pointer text-white shadow-lg shadow-indigo-600/20"
          }`}
        >
          {actionLoading ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin text-slate-400" />
              MEMVERIFIKASI...
            </>
          ) : (
            <>
              <LogIn className="h-4.5 w-4.5" />
              MASUK DENGAN GOOGLE
            </>
          )}
        </button>
        
        <div className="mt-8 border-t border-slate-800/60 pt-5 text-center text-[10px] text-slate-500 tracking-wider">
          FIRESTORE TRANSACTION BIJECTIVE MAP SYSTEM
        </div>
      </div>
    </div>
  );
};
