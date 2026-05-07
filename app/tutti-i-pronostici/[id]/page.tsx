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
      
      // Recupera profilo utente
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      // Recupera pronostici salvati
      const { data: predData } = await supabase
        .from('predictions')
        .select(`
          home_score,
          away_score,
          matches (home_team, away_team, group)
        `)
        .eq('user_id', id);

      setProfile(profileData);
      setPredictions(predData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black uppercase tracking-widest animate-pulse text-xs">Analisi in corso...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32 relative overflow-hidden font-sans">
      
      <div className="max-w-md mx-auto z-10 relative">
        {/* PULSANTE INDIETRO */}
        <button onClick={() => router.back()} className="mb-8 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors italic">
          ← Torna alla lista
        </button>

        {/* HEADER UTENTE ALLINEATO AI COLORI DELL'APP */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] mb-8 text-center relative overflow-hidden shadow-2xl">
          {/* Effetto luce interno */}
          <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
          
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-1.5 italic">Schedina Ufficiale</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">{profile?.username}</h1>
          
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-slate-950 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/10">
            <span className="text-xl font-black">{profile?.points}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Punti</span>
          </div>
        </div>

        {/* LISTA PRONOSTICI */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic mb-4">Fase a Gironi</h2>
          
          {predictions.map((p, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition-colors">
              <div className="flex-1">
                <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter mb-1">Gruppo {p.matches?.group}</p>
                <p className="text-[10px] font-black uppercase italic text-slate-300">
                  {p.matches?.home_team} <span className="mx-1 text-slate-700">vs</span> {p.matches?.away_team}
                </p>
              </div>
              {/* Risultato ora in giallo coerente */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-yellow-500 font-black text-lg italic tracking-tighter shadow-md">
                {p.home_score} - {p.away_score}
              </div>
            </div>
          ))}
          
          {predictions.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl mt-6">
              <p className="text-[10px] text-slate-600 font-black uppercase italic tracking-widest">L'utente non ha ancora salvato giocate</p>
            </div>
          )}
        </div>

        {/* FOOTER INFORMATIVO DISCRETO */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-[2rem] text-center opacity-60">
          <p className="text-[8px] text-slate-600 font-black uppercase leading-relaxed italic tracking-widest">
            Questi dati sono congelati e validati. Le modifiche non sono più consentite dopo l'inizio del Mondiale.
          </p>
        </div>
      </div>
    </main>
  );
}