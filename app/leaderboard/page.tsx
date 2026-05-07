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
      console.log("🚀 AVVIO RICALCOLO TOTALE - REGOLE: 10, 6, 4, 2");
      
      // 1. Recupero dati necessari
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
              const pHome = Number(pred.home_score);
              const pAway = Number(pred.away_score);
              const mHome = Number(match.home_score_final);
              const mAway = Number(match.away_score_final);

              // CALCOLO SEGNI
              const pResult = pHome > pAway ? '1' : pHome < pAway ? '2' : 'X';
              const mResult = mHome > mAway ? '1' : mHome < mAway ? '2' : 'X';
              
              const homeOk = pHome === mHome;
              const awayOk = pAway === mAway;
              const signOk = pResult === mResult;

              // --- LOGICA RICKY (10, 6, 4, 2) ---
              if (homeOk && awayOk) {
                totalPoints += 10; // Risultato Esatto
              } else if (signOk && (homeOk || awayOk)) {
                totalPoints += 6;  // Segno + un gol esatto
              } else if (signOk) {
                totalPoints += 4;  // Solo Segno
              } else if (homeOk || awayOk) {
                totalPoints += 2;  // Solo un gol esatto (Segno sbagliato)
              }
              // ----------------------------------
            }
          });

          // 2. Aggiornamento forzato sul DB
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              points: totalPoints, 
              points_groups: totalPoints 
            })
            .eq('id', profile.id)
            .select(); // Forza la conferma della transazione

          if (updateError) console.error(`Errore per ${profile.username}:`, updateError);
          else console.log(`✅ ${profile.username}: ${totalPoints}pt`);
        }
      }
      
      // Attesa tecnica per sincronizzazione Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchLeaderboard();

    } catch (err) {
      console.error("Errore critico ricalcolo:", err);
      fetchLeaderboard();
    }
  }

  async function fetchLeaderboard() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, points, points_groups, points_bracket, points_bonus')
      .order('points', { ascending: false });

    if (error) {
      console.error("Errore fetch classifica:", error);
      toast.error("Errore nel caricamento");
    } else {
      setLeaderboard(data || []);
    }
    setLoading(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <div className="text-yellow-500 font-black animate-pulse uppercase tracking-[0.3em] italic text-sm">
        Sincronizzazione Classifica...
      </div>
      <div className="text-slate-600 text-[10px] font-bold uppercase mt-4 tracking-widest">
        Applicazione regole 10 - 6 - 4 - 2
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans selection:bg-yellow-500 selection:text-black">
      <header className="text-center mb-12 mt-8">
        <div className="inline-block bg-yellow-500/10 border border-yellow-500/20 px-4 py-1 rounded-full mb-4">
            <span className="text-yellow-500 text-[8px] font-black uppercase tracking-[0.3em]">Official Stats</span>
        </div>
        <h1 className="text-6xl font-black text-yellow-500 uppercase italic tracking-tighter drop-shadow-[0_0_25px_rgba(234,179,8,0.4)]">
          Classifica
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3 italic opacity-60">
          Mondiale 2026 • Group Stage
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header Tabella */}
        <div className="grid grid-cols-5 gap-2 px-8 mb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
          <div className="col-span-1 text-left opacity-50">Guerriero</div>
          <div className="opacity-50">Match</div>
          <div className="opacity-50">Tabellone</div>
          <div className="opacity-50">Extra</div>
          <div className="text-yellow-500">Totale</div>
        </div>

        {leaderboard.map((player, index) => (
          <div 
            key={player.id} 
            className={`grid grid-cols-5 gap-2 items-center p-6 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] ${
              index === 0 
                ? 'bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.2)]' 
                : 'bg-slate-900/50 border-slate-800/80'
            }`}
          >
            <div className="col-span-1 flex flex-col items-start overflow-hidden">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black italic ${index === 0 ? 'text-yellow-500' : 'text-slate-600'}`}>
                  #{index + 1}
                </span>
                <span className="text-sm font-black italic uppercase truncate tracking-tight">
                  {player.username || 'Anonimo'}
                </span>
              </div>
            </div>
            
            <div className="text-center font-bold text-slate-400 text-base">{player.points_groups || 0}</div>
            <div className="text-center font-bold text-slate-400 text-base">{player.points_bracket || 0}</div>
            <div className="text-center font-bold text-slate-400 text-base">{player.points_bonus || 0}</div>
            
            <div className={`text-center font-black italic text-3xl ${index === 0 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-white'}`}>
              {player.points || 0}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}