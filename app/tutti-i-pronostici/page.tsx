'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// DEADLINE: 11 Giugno, 21:00
const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

export default function AllPredictionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Controlliamo se la deadline è passata
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    if (isExpired) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [isExpired]);

  async function fetchAllData() {
    setLoading(true);
    // Recupero dati incrociati in parallelo
    const [profilesRes, bonusesRes, bracketsRes] = await Promise.all([
      supabase.from('profiles').select('id, username'),
      supabase.from('bonuses').select('*'),
      supabase.from('brackets').select('*')
    ]);

    const combined = profilesRes.data?.map(user => ({
      id: user.id,
      username: user.username || 'Anonimo',
      bonus: bonusesRes.data?.find(b => b.user_id === user.id),
      bracket: bracketsRes.data?.filter(b => b.user_id === user.id)
    })) || [];

    setData(combined);
    setLoading(false);
  }

  // 1. Protezione anti-spionaggio pre-mondiale
  if (!isExpired) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <span className="text-7xl">🔒</span>
        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
      </div>
      <h1 className="text-yellow-500 font-black uppercase italic text-3xl tracking-tighter shadow-sm">Area Riservata</h1>
      <div className="h-1 w-12 bg-yellow-500 my-4"></div>
      <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black max-w-xs leading-relaxed">
        Le giocate di tutti i partecipanti saranno sbloccate l'11 Giugno alle 21:00.
      </p>
      <button 
        onClick={() => router.push('/')}
        className="mt-10 text-white border border-slate-800 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all"
      >
        Torna alla Home
      </button>
    </div>
  );

  // 2. Stato di caricamento
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-blue-400 font-black animate-pulse uppercase italic tracking-widest text-sm">
        Generazione Bacheca Mondiale...
      </div>
    </div>
  );

  // 3. Visualizzazione Pubblica (dopo l'11 Giugno)
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-12 pt-8">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter">
          Bacheca Giocate
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic opacity-60">
          Analizza le strategie dei tuoi avversari
        </p>
      </header>

      <div className="max-w-xl mx-auto space-y-6">
        {data.length === 0 ? (
          <p className="text-center text-slate-700 font-black uppercase italic text-xs">Nessun dato trovato.</p>
        ) : (
          data.map((user, idx) => (
            <div key={user.id} className="bg-slate-900/40 border border-slate-800/60 rounded-[2.5rem] p-7 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
              
              {/* Header Card */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex flex-col">
                   <div className="flex items-center gap-3">
                      <div className="h-5 w-1 bg-blue-500 rounded-full"></div>
                      <h2 className="text-xl font-black uppercase italic tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        {user.username}
                      </h2>
                   </div>
                   <span className="text-[7px] text-slate-600 font-black uppercase tracking-[0.2em] mt-1 ml-4">Mondiale Qatar 2026</span>
                </div>
                <button 
                  onClick={() => router.push(`/riepilogo/${user.id}`)}
                  className="text-[8px] font-black text-blue-400 border border-blue-400/30 px-4 py-2 rounded-full uppercase hover:bg-blue-400 hover:text-slate-950 transition-all shadow-lg active:scale-90"
                >
                  Analizza Schedina →
                </button>
              </div>

              {/* Grid Dati Rapidi */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-slate-950/60 p-5 rounded-[1.5rem] border border-slate-800/50 backdrop-blur-sm">
                  <p className="text-[7px] text-slate-500 uppercase font-black mb-2 tracking-widest">👟 Capocannoniere</p>
                  <p className="text-xs font-black text-yellow-500 uppercase italic truncate">
                    {user.bonus?.top_scorer || '---'}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-5 rounded-[1.5rem] border border-slate-800/50 backdrop-blur-sm">
                  <p className="text-[7px] text-slate-500 uppercase font-black mb-2 tracking-widest">🏆 Vincitore</p>
                  <p className="text-xs font-black text-white uppercase italic truncate">
                    {user.bracket?.find((b:any) => b.stage === 'WINNER')?.team_name || '---'}
                  </p>
                </div>
              </div>

              {/* Decorazione di sfondo (Numero carta) */}
              <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-700">
                <span className="text-[120px] italic font-black leading-none">
                  #{(idx + 1).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}