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
        // 1. Cerchiamo il profilo (accetta sia l'UUID che lo username nell'URL)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${id},username.eq.${id}`)
          .maybeSingle();
        
        if (profileError || !profileData) {
          console.error("Profilo non trovato");
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // 2. Recuperiamo i pronostici
        // NOTA: Usiamo "group" con le virgolette per evitare l'errore SQL visto in console
        const { data: predData, error: predError } = await supabase
          .from('predictions')
          .select(`
            home_score,
            away_score,
            matches (
              home_team,
              away_team,
              "group"
            )
          `)
          .eq('user_id', profileData.id);

        if (predError) {
          console.error("Errore caricamento pronostici:", predError.message);
          
          // Se l'errore persiste su "group", facciamo un tentativo di emergenza senza quella colonna
          const { data: fallbackData } = await supabase
            .from('predictions')
            .select(`
              home_score,
              away_score,
              matches (home_team, away_team)
            `)
            .eq('user_id', profileData.id);
          
          setPredictions(fallbackData || []);
        } else {
          setPredictions(predData || []);
        }
      } catch (err) {
        console.error("Errore imprevisto:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-yellow-500 font-black uppercase tracking-widest">
        <div className="animate-spin mb-4 text-2xl">⚽</div>
        Analisi in corso...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32 relative overflow-hidden font-sans">
      <div className="max-w-md mx-auto z-10 relative">
        
        {/* PULSANTE INDIETRO */}
        <button 
          onClick={() => router.back()} 
          className="mb-8 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-yellow-500 transition-colors italic"
        >
          ← Torna alla lista
        </button>

        {/* HEADER UTENTE */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] mb-8 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full"></div>
          
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 mb-1.5 italic">Schedina Ufficiale</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-3">
            {profile?.username}
          </h1>
          
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-slate-950 px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/10">
            <span className="text-xl font-black">{profile?.points ?? 0}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Punti</span>
          </div>
        </div>

        {/* LISTA PRONOSTICI */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2 italic mb-4">Pronostici Salvati</h2>
          
          {predictions.length > 0 ? (
            predictions.map((p, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition-colors">
                <div className="flex-1">
                  <p className="text-[8px] text-slate-600 font-black uppercase tracking-tighter mb-1">
                    {p.matches?.group ? `Gruppo ${p.matches.group}` : 'Partita'}
                  </p>
                  <p className="text-[10px] font-black uppercase italic text-slate-300">
                    {p.matches?.home_team} <span className="mx-1 text-slate-700">vs</span> {p.matches?.away_team}
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-yellow-500 font-black text-lg italic tracking-tighter shadow-md">
                  {p.home_score} - {p.away_score}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl mt-6">
              <p className="text-[10px] text-slate-600 font-black uppercase italic tracking-widest">
                Nessuna giocata trovata per questo utente
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-[2rem] text-center opacity-40">
          <p className="text-[8px] text-slate-600 font-black uppercase leading-relaxed italic tracking-widest">
            Dati sincronizzati con il database ufficiale.
          </p>
        </div>
      </div>
    </main>
  );
}