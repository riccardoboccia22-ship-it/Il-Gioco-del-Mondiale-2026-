'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DettaglioSchedinaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        // 1. Recupero Profilo e Bonus
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${id},username.eq.${id}`)
          .maybeSingle();
        
        if (pError || !profileData) {
          console.error("Profilo non trovato");
          setLoading(false);
          return;
        }
        setProfile(profileData);

        // 2. Recupero Pronostici con Join sui Match
        const { data: predData, error: predError } = await supabase
          .from('predictions')
          .select(`
            home_score,
            away_score,
            matches (
              home_team,
              away_team,
              "group",
              stage
            )
          `)
          .eq('user_id', profileData.id);

        if (predError) console.error("Errore pronostici:", predError.message);
        setPredictions(predData || []);

      } catch (err) {
        console.error("Errore generico:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Logica di suddivisione per fasi
  const gironi = predictions.filter(p => !p.matches?.stage || p.matches?.stage === 'Gironi');
  const faseFinale = predictions.filter(p => p.matches?.stage && p.matches?.stage !== 'Gironi');

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-sans">
      <div className="text-yellow-500 font-black animate-pulse tracking-widest text-xs uppercase">Caricamento Schedina...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-20 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="max-w-md mx-auto">
        
        {/* BACK BUTTON */}
        <button 
          onClick={() => router.back()} 
          className="mb-6 text-[10px] font-black uppercase text-slate-500 hover:text-yellow-500 transition-colors italic tracking-widest"
        >
          ← Torna alla classifica
        </button>

        {/* PROFILO HEADER */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] mb-6 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-2 italic">Riepilogo Ufficiale</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4 leading-none">
            {profile?.username}
          </h1>
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-slate-950 px-6 py-2 rounded-full font-black shadow-lg shadow-yellow-500/20">
            <span className="text-xl">{profile?.points || 0}</span>
            <span className="text-[10px] uppercase tracking-widest">Punti Totali</span>
          </div>
        </div>

        {/* SEZIONE BONUS SPECIALI */}
        <div className="mb-10">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 italic mb-4">🏆 Bonus & Anteprime</h2>
          <div className="grid grid-cols-1 gap-2">
            <BonusCard label="Vincitore Mondiale" value={profile?.bonus_winner} />
            <BonusCard label="Capocannoniere" value={profile?.bonus_top_scorer} />
            <BonusCard label="Partita con più gol" value={profile?.bonus_most_goals_match} />
            <BonusCard label="Totale Cartellini Rossi" value={profile?.bonus_total_red_cards} />
          </div>
        </div>

        {/* SEZIONE FASE FINALE */}
        {faseFinale.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4 ml-2">
               <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] italic">🔥 Fase Finale</h2>
               <div className="h-[1px] flex-1 bg-yellow-500/20"></div>
            </div>
            <div className="space-y-2">
              {faseFinale.map((p, i) => <PredictionRow key={i} p={p} />)}
            </div>
          </div>
        )}

        {/* SEZIONE GIRONI */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4 ml-2">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">⚽ Fase a Gironi</h2>
            <div className="h-[1px] flex-1 bg-slate-800"></div>
          </div>
          <div className="space-y-2">
            {gironi.map((p, i) => <PredictionRow key={i} p={p} />)}
          </div>
          
          {predictions.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-900 rounded-[2rem]">
              <p className="text-[10px] text-slate-700 font-black uppercase italic">Nessun pronostico salvato</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

// COMPONENTE: Riga Match
function PredictionRow({ p }: { p: any }) {
  const isFaseFinale = p.matches?.stage && p.matches.stage !== 'Gironi';
  
  return (
    <div className={`
      p-4 rounded-2xl flex justify-between items-center transition-all border
      ${isFaseFinale 
        ? 'bg-yellow-500/5 border-yellow-500/10 hover:border-yellow-500/30' 
        : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700'}
    `}>
      <div className="flex-1">
        <p className={`text-[7px] font-black uppercase mb-1 ${isFaseFinale ? 'text-yellow-500/60' : 'text-slate-600'}`}>
          {isFaseFinale ? p.matches.stage : `Gruppo ${p.matches?.group || '-'}`}
        </p>
        <p className="text-[11px] font-black uppercase italic text-slate-200 tracking-tight">
          {p.matches?.home_team} <span className="text-slate-600 mx-0.5">vs</span> {p.matches?.away_team}
        </p>
      </div>
      <div className={`
        px-3 py-1.5 rounded-xl font-black text-lg italic tracking-tighter shadow-inner border
        ${isFaseFinale 
          ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' 
          : 'bg-slate-800 border-slate-700 text-slate-300'}
      `}>
        {p.home_score} - {p.away_score}
      </div>
    </div>
  );
}

// COMPONENTE: Card Bonus
function BonusCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition-colors">
      <span className="text-[9px] font-black uppercase text-slate-500 italic group-hover:text-slate-400 transition-colors">
        {label}
      </span>
      <span className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">
        {value || '---'}
      </span>
    </div>
  );
}