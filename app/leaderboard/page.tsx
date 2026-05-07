'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00'); 

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    setLoading(true);
    
    // Ora leggiamo tutto dalla tabella profiles che è già aggiornata!
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, points, points_groups, points_bracket, points_bonus')
      .order('points', { ascending: false });

    if (error) {
      console.error("Errore classifica:", error);
    } else {
      setLeaderboard(data || []);
    }
    
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-yellow-500 font-black animate-pulse uppercase tracking-[0.2em] italic">
        Aggiornamento Classifica...
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-10 mt-6">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
          Classifica
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic opacity-70">
          {isExpired ? '🔒 Risultati Blindati' : 'Road to Glory 2026'}
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-3">
        {/* Header Tabella */}
        <div className="grid grid-cols-5 gap-1 px-6 mb-2 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">
          <div className="col-span-1 text-left">Player</div>
          <div>Gironi</div>
          <div>Finale</div>
          <div>Bonus</div>
          <div className="text-yellow-500 font-bold">Total</div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center p-10 text-slate-600 font-black uppercase italic text-xs">
            Nessun dato disponibile
          </div>
        ) : (
          leaderboard.map((player, index) => (
            <div 
              key={player.id} 
              className={`grid grid-cols-5 gap-1 items-center p-5 rounded-[2rem] border transition-all duration-300 ${
                index === 0 
                  ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' 
                  : 'bg-slate-900/40 border-slate-800/60'
              }`}
            >
              <div className="col-span-1 flex flex-col items-start overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black italic ${index === 0 ? 'text-yellow-500' : 'text-slate-600'}`}>
                    #{index + 1}
                  </span>
                  <span className="text-xs font-black italic uppercase truncate w-full tracking-tight">
                    {player.username}
                  </span>
                </div>
                
                {isExpired ? (
                  <button 
                    onClick={() => router.push(`/riepilogo/${player.id}`)}
                    className="text-[7px] font-black text-yellow-500/60 uppercase tracking-tighter hover:text-yellow-500 transition-colors mt-1 underline decoration-yellow-500/20 text-left"
                  >
                    Vedi Schedina →
                  </button>
                ) : (
                  <span className="text-[7px] font-black text-slate-700 uppercase tracking-tighter italic mt-1">
                    🔒 Hidden
                  </span>
                )}
              </div>
              
              <div className="text-center font-bold text-slate-400 text-sm tracking-tighter">{player.points_groups || 0}</div>
              <div className="text-center font-bold text-slate-400 text-sm tracking-tighter">{player.points_bracket || 0}</div>
              <div className="text-center font-bold text-slate-400 text-sm tracking-tighter">{player.points_bonus || 0}</div>
              
              <div className={`text-center font-black italic text-2xl ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>
                {player.points || 0}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}