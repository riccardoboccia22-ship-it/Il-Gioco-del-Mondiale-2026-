'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [bonusData, setBonusData] = useState<any>(null);

  const ADMIN_EMAIL = "riccardoboccia22@gmail.com";

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        const { data: m } = await supabase.from('matches').select('*').order('match_date', { ascending: true });
        const { data: b } = await supabase.from('bonuses').select('*').maybeSingle();
        setMatches(m || []);
        setBonusData(b);
      }
      setLoading(false);
    }
    init();
  }, []);

  const updateScore = async (id: number) => {
    const h = (document.getElementById(`h-${id}`) as HTMLInputElement).value;
    const a = (document.getElementById(`a-${id}`) as HTMLInputElement).value;
    const { error } = await supabase.from('matches').update({
      home_score_final: parseInt(h),
      away_score_final: parseInt(a),
      is_finished: true
    }).eq('id', id);
    alert(error ? error.message : "Match aggiornato!");
  };

  const saveBonuses = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from('bonuses').update({
      total_red_cards: parseInt(fd.get('red') as string || '0'),
      top_scorer: fd.get('top') as string,
      high_scoring_match: fd.get('high') as string
    }).eq('id', '00000000-0000-0000-0000-000000000000');
    alert(error ? error.message : "Bonus salvati!");
  };

  const saveQualif = async () => {
    const team = (document.getElementById('q_team') as HTMLInputElement).value.toUpperCase();
    const stage = (document.getElementById('q_stage') as HTMLSelectElement).value;
    const pts: any = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
    
    const { error } = await supabase.from('brackets')
      .update({ points_earned: pts[stage] })
      .match({ stage: stage, team_name: team });
    alert(error ? error.message : team + " confermata!");
  };

  if (loading) return <div className="p-10 text-white">Caricamento...</div>;
  if (!isAdmin) return <div className="p-10 text-red-500">Accesso Negato</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-20 font-sans">
      <h1 className="text-3xl font-black text-yellow-500 italic text-center mb-10 uppercase">Pannello Admin</h1>

      {/* SEZIONE PARTITE */}
      <section className="mb-12 max-w-xl mx-auto">
        <h2 className="text-xl font-bold border-l-4 border-yellow-500 pl-3 mb-4">PARTITE</h2>
        {matches.map(m => (
          <div key={m.id} className="bg-slate-900 p-4 rounded-xl mb-2 flex flex-col gap-2 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold">{m.home_team} vs {m.away_team}</span>
            <div className="flex gap-2">
              <input id={`h-${m.id}`} type="number" defaultValue={m.home_score_final} className="w-full bg-slate-800 p-2 rounded text-center" />
              <input id={`a-${m.id}`} type="number" defaultValue={m.away_score_final} className="w-full bg-slate-800 p-2 rounded text-center" />
              <button onClick={() => updateScore(m.id)} className="bg-yellow-500 text-black px-4 font-bold rounded">OK</button>
            </div>
          </div>
        ))}
      </section>

      {/* SEZIONE BONUS */}
      <section className="mb-12 max-w-xl mx-auto">
        <h2 className="text-xl font-bold border-l-4 border-green-500 pl-3 mb-4 uppercase">Bonus</h2>
        <form onSubmit={saveBonuses} className="bg-slate-900 p-6 rounded-xl space-y-4 border border-slate-800">
          <input name="red" type="number" defaultValue={bonusData?.total_red_cards} placeholder="Rossi totali" className="w-full bg-slate-800 p-3 rounded" />
          <input name="top" placeholder="Capocannoniere" defaultValue={bonusData?.top_scorer} className="w-full bg-slate-800 p-3 rounded uppercase" />
          <input name="high" placeholder="Partita + Gol" defaultValue={bonusData?.high_scoring_match} className="w-full bg-slate-800 p-3 rounded uppercase" />
          <button type="submit" className="w-full bg-green-600 p-4 rounded font-bold uppercase">Salva Bonus</button>
        </form>
      </section>

      {/* SEZIONE QUALIFICAZIONI */}
      <section className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold border-l-4 border-blue-500 pl-3 mb-4 uppercase">Qualificazioni</h2>
        <div className="bg-slate-900 p-6 rounded-xl space-y-4 border border-slate-800">
          <input id="q_team" placeholder="NOME SQUADRA (ES: BRASILE)" className="w-full bg-slate-800 p-3 rounded uppercase" />
          <select id="q_stage" className="w-full bg-slate-800 p-3 rounded uppercase">
            <option value="R32">Sedicesimi (2pt)</option>
            <option value="R16">Ottavi (4pt)</option>
            <option value="QF">Quarti (6pt)</option>
            <option value="SF">Semifinali (8pt)</option>
            <option value="F">Finale (10pt)</option>
            <option value="WINNER">Vincitore (20pt)</option>
          </select>
          <button onClick={saveQualif} className="w-full bg-blue-600 p-4 rounded font-bold uppercase">Conferma Qualificata</button>
        </div>
      </section>
    </div>
  );
}