'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* EFFETTI DI LUCE SULLO SFONDO */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>

      <div className="max-w-3xl w-full text-center z-10">
        
        {/* BADGE SUPERIORE */}
        <div className="inline-block px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">
            Road to World Cup 2026 🇺🇸 🇲🇽 🇨🇦
          </p>
        </div>

        {/* TITOLO PRINCIPALE AGGIORNATO */}
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-6">
          IL GIOCO DEL <br />
          <span className="text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] text-6xl md:text-8xl">MONDIALE 2026!</span>
        </h1>

        {/* SOTTOTITOLO AGGIORNATO */}
        <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto mb-10 leading-relaxed">
          Sfida i tuoi amici nel gioco di pronostici del Mondiale. <br className="hidden md:block" />
          Indovina i risultati, scala la classifica e domina il tabellone.
        </p>

        {/* AZIONI PRINCIPALI */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button 
            onClick={() => router.push('/login')}
            className="px-10 py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95"
          >
            Inizia a Giocare
          </button>
          
          <button 
            onClick={() => router.push('/matches')}
            className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Vedi i Match
          </button>
        </div>

        {/* STATS RAPIDE */}
        <div className="grid grid-cols-3 gap-8 mt-20 border-t border-slate-900 pt-10">
          <div>
            <p className="text-2xl font-black text-white">48</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Squadre</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">104</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Partite</p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">1</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Campione</p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-8 text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">
        © 2026 World Cup Prediction Game
      </footer>
    </main>
  );
}