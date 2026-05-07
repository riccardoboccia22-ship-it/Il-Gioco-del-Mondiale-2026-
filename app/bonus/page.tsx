'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// DEADLINE: 11 Giugno 2026, ore 21:00 (Ora Italiana)
const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

export default function BonusPage() {
  const [formData, setFormData] = useState({
    total_red_cards: '',
    top_scorer: '',
    high_scoring_match: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Controllo se il tempo è scaduto
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchExistingBonus();
  }, []);

  async function fetchExistingBonus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Recuperiamo le risposte dell'utente dalla tabella corretta
    const { data, error } = await supabase
      .from('user_bonus_answers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setFormData({
        total_red_cards: data.total_red_cards?.toString() || '',
        top_scorer: data.top_scorer || '',
        high_scoring_match: data.high_scoring_match || ''
      });
    }
  }

  const saveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isExpired) {
      toast.error("Tempo scaduto! Giocate chiuse.");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Devi accedere per salvare!");
      router.push('/login');
      return;
    }

    // Upsert dei dati: salviamo tutto in MAIUSCOLO per facilitare il calcolo punti
    const { error } = await supabase
      .from('user_bonus_answers')
      .upsert({
        user_id: user.id,
        total_red_cards: parseInt(formData.total_red_cards),
        top_scorer: formData.top_scorer.toUpperCase().trim(),
        high_scoring_match: formData.high_scoring_match.toUpperCase().trim()
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error("Errore durante il salvataggio.");
      console.error(error);
    } else {
      toast.success("Bonus salvati con successo! 🍀", {
        duration: 4000,
        icon: '🏆',
      });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-10 mt-6">
          <div className="inline-block p-3 bg-yellow-500/10 rounded-full mb-4 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <span className="text-3xl">{isExpired ? '🔒' : '✨'}</span>
          </div>
          <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-tighter">Super Bonus</h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.3em] font-black">
            {isExpired ? 'Giocate Chiuse' : 'Indovina e vinci 30 punti'}
          </p>
        </header>

        <form onSubmit={saveBonus} className="space-y-6">
          <div className={`bg-slate-900/50 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-2xl transition-opacity ${isExpired ? 'opacity-60' : ''}`}>
            
            {/* 1. TOTALE ESPULSIONI */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">🔴 Totale Espulsioni (10pt)</label>
              <input 
                type="number" 
                disabled={isExpired}
                value={formData.total_red_cards}
                placeholder="Esempio: 15"
                className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onChange={(e) => setFormData({...formData, total_red_cards: e.target.value})}
                required
              />
            </div>

            {/* 2. CAPOCANNONIERE */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">👟 Capocannoniere (10pt)</label>
              <input 
                type="text" 
                disabled={isExpired}
                value={formData.top_scorer}
                placeholder="Esempio: MBAPPÉ"
                className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white placeholder:text-slate-600 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                onChange={(e) => setFormData({...formData, top_scorer: e.target.value})}
                required
              />
            </div>

            {/* 3. PARTITA CON PIÙ GOL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">⚽ Partita con più gol (10pt)</label>
              <input 
                type="text" 
                disabled={isExpired}
                value={formData.high_scoring_match}
                placeholder="Esempio: MESSICO - SUDAFRICA"
                className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-4 outline-none focus:border-yellow-500 transition-all font-bold text-white placeholder:text-slate-600 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                onChange={(e) => setFormData({...formData, high_scoring_match: e.target.value})}
                required
              />
              {/* SCRITTA INFORMATIVA EVIDENTE */}
              <p className="text-[10px] text-yellow-500/90 mt-3 ml-2 font-black uppercase italic tracking-tighter">
                ⚠️ VALIDA SOLO PER LA FASE A GIRONI
              </p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || isExpired}
            className={`w-full font-black py-5 rounded-[2rem] uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 ${
              isExpired 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 shadow-none cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-yellow-500/20 shadow-lg'
            }`}
          >
            {loading ? 'Salvataggio...' : isExpired ? '🔒 Bonus Bloccati' : 'Conferma Scommesse Bonus'}
          </button>
        </form>
      </div>
    </main>
  );
}