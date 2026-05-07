'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const WORLD_CUP_START_DATE = new Date('2026-01-01T21:00:00+02:00'); 

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    runPointsUpdate();
  }, []);

  // --- FUNZIONE MAGICA: CALCOLA I PUNTI ---
  async function runPointsUpdate() {
    setLoading(true);
    try {
      // 1. Prendi tutti i match che hanno un risultato ufficiale (home_score_final)
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .not('home_score_final', 'is', null);

      // 2. Prendi tutti i pronostici
      const { data: allPredictions } = await supabase
        .from('predictions')
        .select('*');

      // 3. Prendi tutti i profili
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (matches && allPredictions && profiles) {
        // Ciclo su ogni profilo per calcolare i punti
        for (const profile of profiles) {
          let totalPoints = 0;
          
          // Filtra i pronostici di questo specifico utente
          const userPreds = allPredictions.filter(p => p.user_id === profile.id);

          userPreds.forEach(pred => {
            const match = matches.find(m => m.id === pred.match_id);
            if (match) {
              // LOGICA PUNTI: 10 punti se il risultato è IDENTICO
              if (pred.home_score === match.home_score_final && pred.away_score === match.away_score_final) {
                totalPoints += 10;
              } 
              // OPZIONALE: 5 punti se indovini solo il segno (1X2)
              else {
                const realDiff = match.home_score_final - match.away_score_final;
                const predDiff = pred.home_score - pred.away_score;
                if ((realDiff > 0 && predDiff > 0) || (realDiff < 0 && predDiff < 0) || (realDiff === 0 && predDiff === 0)) {
                  totalPoints += 5;
                }
              }
            }
          });

          // Aggiorna il profilo sul database solo se i punti sono cambiati
          if (profile.points !== totalPoints) {
            await supabase
              .from('profiles')
              .update({ 
                points: totalPoints, 
                points_groups: totalPoints // Per ora mettiamoli qui
              })
              .eq('id', profile.id);
          }
        }
      }
      
      // Dopo il calcolo, scarica la classifica aggiornata
      fetchLeaderboard();
    } catch (err) {
      console.error("Errore calcolo:", err);
      fetchLeaderboard();
    }
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, points, points_groups, points_bracket, points_bonus')
      .order('points', { ascending: false });

    if (!error) setLeaderboard(data || []);
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-yellow-500 font-black animate-pulse uppercase tracking-[0.2em] italic">
        Calcolo Risultati in corso...
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
          Aggiornata in tempo reale
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-3">
        <div className="grid grid-cols-5 gap-1 px-6 mb-2 text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">
          <div className="col-span-1 text-left">Player</div>
          <div>Gironi</div>
          <div>Finale</div>
          <div>Bonus</div>
          <div className="text-yellow-500 font-bold">Total</div>
        </div>

        {leaderboard.map((player, index) => (
          <div key={player.id} className={`grid grid-cols-5 gap-1 items-center p-5 rounded-[2rem] border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'bg-slate-900/40 border-slate-800/60'}`}>
            <div className="col-span-1 flex flex-col items-start overflow-hidden">
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black italic ${index === 0 ? 'text-yellow-500' : 'text-slate-600'}`}>#{index + 1}</span>
                <span className="text-xs font-black italic uppercase truncate w-full tracking-tight">{player.username}</span>
              </div>
            </div>
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_groups || 0}</div>
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_bracket || 0}</div>
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_bonus || 0}</div>
            <div className={`text-center font-black italic text-2xl ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>{player.points || 0}</div>
          </div>
        ))}
      </div>
    </main>
  );
}