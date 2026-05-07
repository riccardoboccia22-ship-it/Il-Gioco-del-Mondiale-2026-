'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// DEADLINE: 11 Giugno 2026, ore 21:00
const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

export default function BonusPage() {
  const [formData, setFormData] = useState({
    total_red_cards: '',
    top_scorer: '',
    high_scoring_match: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchExistingBonus();
  }, []);

  async function fetchExistingBonus() {
    try {
      // 1. Controlla sessione utente
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log("Nessuna sessione trovata");
        router.push('/login');
        return;
      }

      const user = session.user;

      // 2. Recupera i dati
      const { data, error } = await supabase
        .from('user_bonus_answers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Errore recupero dati:", error.message);
      }

      if (data) {
        setFormData({
          total_red_cards: data.total_red_cards !== null ? data.total_red_cards.toString() : '',
          top_scorer: data.top_scorer || '',
          high_scoring_match: data.high_scoring_match || ''
        });
      }
    } catch (err) {
      console.error("Errore imprevisto durante il fetch:", err);
    } finally {
      // IMPORTANTE: Questo garantisce che la scritta "Caricamento" sparisca sempre
      setFetching(false);
    }
  }

  const saveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      toast.error("Tempo scaduto!");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const redCardsClean = formData.total_red_cards.trim() === "" 
        ? 0 
        : parseInt(formData.total_red_cards);

      const { error } = await supabase
        .from('user_bonus_answers')
        .upsert({
          user_id: user.id,
          total_red_cards: redCardsClean,
          top_scorer: (formData.top_scorer || "").toUpperCase().trim(),
          high_scoring_match: (formData.high_scoring_match || "").toUpperCase().trim()
        });

      if (error) throw error;
      toast.success("Bonus salvati! 🏆");
    } catch (err: any) {
      console.error("Errore salvataggio:", err.message);
      toast.error("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
      <div className="text-yellow-500 font-black animate-pulse uppercase text-[10px] tracking-widest">Sincronizzazione Bonus...</div>
      <button 
        onClick={() => setFetching(false)} 
        className="mt-4 text-[8px] text-slate-600 uppercase underline"
      >
        Forza caricamento
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32 font-sans italic">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter">Super Bonus</h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-black italic">Configura i tuoi premi speciali</p>
        </header>

        <form onSubmit={saveBonus} className="space-y-6">
          <div className={`bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 space-y-6 ${isExpired ? 'opacity-50' : ''}`}>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">🔴 Totale Espulsioni (10pt)</label>
              <input 
                type="number" 
                disabled={isExpired}
                value={formData.total_red_cards}
                onChange={(e) => setFormData({ ...formData, total_red_cards: e.target.value })}
                placeholder="Esempio: 15"
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white italic"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">👟 Capocannoniere (10pt)</label>
              <input 
                type="text" 
                disabled={isExpired}
                value={formData.top_scorer}
                onChange={(e) => setFormData({ ...formData, top_scorer: e.target.value })}
                placeholder="Esempio: MBAPPÉ"
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white uppercase italic"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">⚽ Partita con più gol (10pt)</label>
              <input 
                type="text" 
                disabled={isExpired}
                value={formData.high_scoring_match}
                onChange={(e) => setFormData({ ...formData, high_scoring_match: e.target.value })}
                placeholder="Esempio: MESSICO - SUDAFRICA"
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white uppercase italic"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || isExpired}
            className="w-full font-black py-5 rounded-[2.2rem] uppercase text-xs tracking-[0.2em] bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20 active:scale-95 transition-all disabled:bg-slate-800 disabled:text-slate-600 italic"
          >
            {loading ? 'Salvataggio...' : isExpired ? '🔒 Chiuso' : 'Conferma Scommesse Bonus'}
          </button>
        </form>
      </div>
    </main>
  );
}