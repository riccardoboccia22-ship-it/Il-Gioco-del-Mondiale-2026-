'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TuttiIPronosticiPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      // Recupera tutti gli utenti ordinati per punti
      const { data } = await supabase
        .from('profiles')
        .select('id, username, points')
        .order('points', { ascending: false });
      
      setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black uppercase tracking-widest animate-pulse text-xs">Sincronizzazione Rivali...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32 relative overflow-hidden font-sans">
      
      {/* EFFETTI DI LUCE AMBIENTALE */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/5 blur-[120px] rounded-full"></div>
      
      <div className="max-w-md mx-auto z-10 relative">
        {/* HEADER TITOLO */}
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
          Tutte le <span className="text-yellow-500 text-5xl block">Giocate</span>
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mb-10 italic opacity-80">Analizza le strategie dei tuoi avversari</p>

        {/* LISTA UTENTI */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          {users.map((user) => (
            <div key={user.id} className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] flex justify-between items-center group shadow-xl">
              <div className="flex-1">
                <p className="text-lg font-black uppercase italic tracking-tight">{user.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{user.points} Punti</p>
                </div>
              </div>
              <button 
                onClick={() => router.push(`/tutti-i-pronostici/${user.id}`)}
                className="bg-slate-950 border border-slate-800 text-yellow-500 text-[9px] font-black uppercase px-4 py-3 rounded-xl transition-all active:scale-95 shadow-md group-hover:bg-yellow-500 group-hover:text-slate-950 group-hover:border-yellow-500"
              >
                Analizza 🔍
              </button>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-[10px] text-slate-600 font-black uppercase italic tracking-widest">Nessun rivale trovato</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}