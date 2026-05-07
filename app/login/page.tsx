'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [stats, setStats] = useState({ 
    total: 0, 
    groups: 0, 
    bracket: 0, 
    bonus: 0, 
    rank: '--' 
  });
  const router = useRouter();

  const ADMIN_EMAIL = "riccardoboccia22@gmail.com"; 

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUserProfile({ ...user, username: profile?.username || 'Guerriero' });
      setStats({ 
        total: profile?.points || 0, 
        groups: profile?.points_groups || 0,
        bracket: profile?.points_bracket || 0,
        bonus: profile?.points_bonus || 0,
        rank: profile?.rank || '--' 
      });
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id, 
            username: username, 
            points: 0,
            points_groups: 0,
            points_bracket: 0,
            points_bonus: 0
          }]);

        if (profileError) console.error("Errore profilo:", profileError);
        toast.success('Account creato! Benvenuto nel Mondiale.');
        setIsRegistering(false);
        window.location.reload();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Credenziali non valide");
      } else {
        window.location.reload();
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
      toast.success("Disconnesso");
      // Forza il refresh totale per pulire la cache di Supabase/Next.js
      window.location.href = '/login'; 
    } catch (error) {
      console.error("Errore logout:", error);
      window.location.href = '/login';
    }
  };

  const checkIsAdmin = () => userProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-32 flex items-center justify-center">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {userProfile ? (
          <div className="space-y-6">
            
            {/* Header Profilo */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                {checkIsAdmin() && <span className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-1 rounded-full border border-red-500/20 uppercase tracking-widest">Admin</span>}
              </div>
              
              <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-950 text-3xl font-black border-4 border-slate-800 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                {userProfile.username.charAt(0).toUpperCase()}
              </div>
              
              <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                {userProfile.username}
              </h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1 italic">World Cup Challenger</p>
            </div>

            {/* RESOCONTO PUNTI DETTAGLIATO */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Resoconto Punti</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {/* GRUPPI */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase italic mb-1">Fase a Gironi</p>
                  <p className="text-2xl font-black text-white">{stats.groups} <span className="text-[10px] text-slate-500">PT</span></p>
                </div>

                {/* BRACKET */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase italic mb-1">Fase Finale</p>
                  <p className="text-2xl font-black text-white">{stats.bracket} <span className="text-[10px] text-slate-500">PT</span></p>
                </div>

                {/* BONUS */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase italic mb-1">Super Bonus</p>
                  <p className="text-2xl font-black text-white">{stats.bonus} <span className="text-[10px] text-slate-500">PT</span></p>
                </div>

                {/* POSIZIONE */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl">
                  <p className="text-[8px] font-black text-slate-500 uppercase italic mb-1">Posizione</p>
                  <p className="text-2xl font-black text-white">#{stats.rank}</p>
                </div>
              </div>

              {/* TOTALE GENERALE */}
              <div className="bg-yellow-500 p-6 rounded-[2rem] flex items-center justify-between shadow-lg shadow-yellow-500/10">
                <div>
                  <p className="text-[9px] font-black text-slate-950 uppercase tracking-widest italic">Punteggio Totale</p>
                  <p className="text-4xl font-black text-slate-950 tracking-tighter">{stats.total}</p>
                </div>
                <div className="text-3xl text-slate-950/20 font-black italic">TOTAL</div>
              </div>
            </div>

            {/* Menu Azioni */}
            <div className="space-y-3 pt-2">
              {checkIsAdmin() && (
                <Link href="/admin" className="w-full flex items-center justify-center gap-2 py-4 bg-red-600/10 text-red-500 border border-red-600/20 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest text-[10px]">
                  ⚙️ Gestione Risultati
                </Link>
              )}
              
              <button onClick={() => router.push('/matches')} className="w-full py-4 bg-white/5 text-white border border-white/10 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">
                Vai ai Match
              </button>

              <button onClick={handleLogout} className="w-full py-4 text-slate-500 font-black rounded-2xl hover:text-red-400 transition-all uppercase tracking-widest text-[9px]">
                Esci dall&apos;account
              </button>
            </div>
          </div>

        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-yellow-500 uppercase tracking-tighter italic">
                {isRegistering ? 'Iscriviti' : 'Entra'}
              </h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic">
                World Cup 2026 Prediction
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <input
                  type="text"
                  placeholder="USERNAME (ES: BOMBER99)"
                  className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 transition-all text-white font-black text-xs uppercase"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              )}
              
              <input
                type="email"
                placeholder="EMAIL"
                className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 transition-all text-white font-black text-xs uppercase"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="PASSWORD"
                className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 transition-all text-white font-black text-xs uppercase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-yellow-500 text-slate-950 font-black rounded-2xl hover:bg-yellow-400 transition-all uppercase tracking-widest text-xs mt-4 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Sincronizzazione...' : isRegistering ? 'Crea Account' : 'Inizia a Giocare'}
              </button>
            </form>

            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full mt-8 text-[9px] font-black text-slate-500 hover:text-yellow-500 transition-colors uppercase tracking-widest italic"
            >
              {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo giocatore? Registrati'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}