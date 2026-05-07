'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    runPointsUpdate();
  }, []);

  async function runPointsUpdate() {
    setLoading(true);
    try {
      console.log("Inizio ricalcolo punti...");
      
      const { data: matches } = await supabase.from('matches').select('*').not('home_score_final', 'is', null);
      const { data: allPredictions } = await supabase.from('predictions').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      if (matches && allPredictions && profiles) {
        for (const profile of profiles) {
          let totalPoints = 0;
          const userPreds = allPredictions.filter(p => p.user_id === profile.id);

          userPreds.forEach(pred => {
            const match = matches.find(m => m.id === pred.match_id);
            if (match) {
              // FORZIAMO IL TIPO NUMERO PER IL CONFRONTO
              const pHome = Number(pred.home_score);
              const pAway = Number(pred.away_score);
              const mHome = Number(match.home_score_final);
              const mAway = Number(match.away_score_final);

              if (pHome === mHome && pAway === mAway) {
                totalPoints += 10;
              } else {
                const realDiff = mHome - mAway;
                const predDiff = pHome - pAway;
                if ((realDiff > 0 && predDiff > 0) || (realDiff < 0 && predDiff < 0) || (realDiff === 0 && predDiff === 0)) {
                  totalPoints += 5;
                }
              }
            }
          });

          // Aggiorniamo solo se necessario, ma logghiamo il processo
          console.log(`Punti calcolati per ${profile.username}: ${totalPoints}`);
          
          await supabase
            .from('profiles')
            .update({ 
              points: totalPoints, 
              points_groups: totalPoints 
            })
            .eq('id', profile.id);
        }
      }
      
      // ASPETTIAMO 1 SECONDO PRIMA DI SCARICARE (Importante per Supabase!)
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchLeaderboard();

    } catch (err) {
      console.error("Errore ricalcolo:", err);
      fetchLeaderboard();
    }
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, points, points_groups, points_bracket, points_bonus')
      .order('points', { ascending: false });

    if (error) {
      console.error("Errore fetch:", error);
      toast.error("Errore nel caricamento classifica");
    } else {
      console.log("Classifica scaricata:", data);
      setLeaderboard(data || []);
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-yellow-500 font-black animate-pulse uppercase tracking-[0.2em] italic">
        Aggiornamento Punti...
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
          Risultati Ufficiali 2026
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

        {leaderboard.map((player, index) => (
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
                  {player.username || 'Guerriero'}
                </span>
              </div>
            </div>
            
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_groups || 0}</div>
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_bracket || 0}</div>
            <div className="text-center font-bold text-slate-400 text-sm">{player.points_bonus || 0}</div>
            
            <div className={`text-center font-black italic text-2xl ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>
              {player.points || 0}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}