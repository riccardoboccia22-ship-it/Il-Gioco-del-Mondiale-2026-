'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DettaglioSchedinaPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [bonusData, setBonusData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${id},username.eq.${id}`)
          .maybeSingle();
        
        if (!profileData) {
          setLoading(false);
          return;
        }
        setProfile(profileData);

        const { data: bData } = await supabase
          .from('user_bonus_answers')
          .select('*')
          .eq('user_id', profileData.id)
          .maybeSingle();
        setBonusData(bData);

        const { data: predData, error: predError } = await supabase
          .from('predictions')
          .select(`
            home_score,
            away_score,
            matches (
              home_team,
              away_team,
              stage
            )
          `)
          .eq('user_id', profileData.id);

        if (!predError) setPredictions(predData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // --- LOGICA FILTRI CORRETTA ---
  
  // 1. Fase Finale: Solo se lo stage contiene parole chiavi specifiche
  const faseFinale = predictions.filter(p => {
    const s = p.matches?.stage?.toLowerCase() || '';
    return s.includes('ottav') || s.includes('quart') || s.includes('semi') || s.includes('final');
  });

  // 2. Fase a Gironi: Tutto il resto finisce qui (inclusi quelli con stage vuoto o "Gironi")
  const gironi = predictions.filter(p => {
    const s = p.matches?.stage?.toLowerCase() || '';
    const isFinale = s.includes('ottav') || s.includes('quart') || s.includes('semi') || s.includes('final');
    return !isFinale;
  });

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black uppercase text-[10px]">Caricamento...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-24 font-sans italic">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="mb-8 text-[10px] font-black uppercase text-slate-500 hover:text-yellow-500 tracking-widest">
          ← Torna alla classifica
        </button>

        {/* PROFILO */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] mb-10 text-center shadow-2xl">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-2 italic">Schedina Ufficiale</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">{profile?.username}</h1>
          <div className="inline-flex items-center gap-3 bg-yellow-500 text-slate-950 px-8 py-2.5 rounded-full font-black text-sm uppercase italic">
            {profile?.points || 0} Punti
          </div>
        </div>

        {/* BONUS */}
        <div className="mb-12">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-4 mb-4 italic">🏆 Super Bonus</h2>
          <div className="grid grid-cols-1 gap-2.5">
            <BonusCard label="Capocannoniere" value={bonusData?.top_scorer} />
            <BonusCard label="Partita più gol" value={bonusData?.high_scoring_match} />
            <BonusCard label="Cartellini Rossi" value={bonusData?.total_red_cards} />
          </div>
        </div>

        {/* FASE A GIRONI (Spostata sopra o sotto a tua scelta, qui è prima della finale) */}
        <div className="mb-12">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] ml-4 mb-4 italic">⚽ Fase a Gironi</h2>
          <div className="space-y-3">
            {gironi.length > 0 ? gironi.map((p, i) => <PredictionRow key={i} p={p} />) : <p className="text-[9px] text-slate-800 uppercase font-black ml-4 italic">Nessun dato</p>}
          </div>
        </div>

        {/* FASE FINALE */}
        <div className="mb-12">
          <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] ml-4 mb-4 italic">🔥 Fase Finale</h2>
          <div className="space-y-3">
            {faseFinale.length > 0 ? faseFinale.map((p, i) => <PredictionRow key={i} p={p} />) : <p className="text-[9px] text-slate-800 uppercase font-black ml-4 italic">Nessun pronostico fase finale</p>}
          </div>
        </div>
      </div>
    </main>
  );
}

function PredictionRow({ p }: { p: any }) {
  return (
    <div className="p-5 rounded-[1.8rem] flex justify-between items-center bg-slate-900/40 border border-slate-800">
      <div className="flex-1">
        <p className="text-[7px] font-black uppercase mb-1 text-slate-600 tracking-widest">{p.matches?.stage || 'Gironi'}</p>
        <p className="text-[11px] font-black uppercase text-slate-200">{p.matches?.home_team} vs {p.matches?.away_team}</p>
      </div>
      <div className="bg-slate-800 px-5 py-2 rounded-2xl font-black text-xl text-yellow-500 border border-slate-700 min-w-[80px] text-center">
        {p.home_score} - {p.away_score}
      </div>
    </div>
  );
}

function BonusCard({ label, value }: { label: string, value: any }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
      <span className="text-[9px] font-black uppercase text-slate-500 italic">{label}</span>
      <span className="text-[11px] font-black uppercase text-yellow-500 tracking-widest font-bold">{value || '---'}</span>
    </div>
  );
}