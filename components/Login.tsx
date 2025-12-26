
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onGoToSignup: () => void;
}

const TEST_USER: UserProfile = {
  id: 'test-bassan',
  name: 'Bassan',
  email: 'bassan@cifra.ia',
  password: '123456',
  birthDate: '1990-01-01',
  documentType: 'CPF',
  documentValue: '000.000.000-00',
  monthlyIncome: 0,
  fixedExpenses: 0,
  currency: 'BRL'
};

const Login: React.FC<LoginProps> = ({ onLogin, onGoToSignup }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    const usersRaw = localStorage.getItem('cifra_users');
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    const user = users.find(u => 
      (u.name.toLowerCase() === name.toLowerCase() || u.email?.toLowerCase() === name.toLowerCase()) && 
      u.password === password
    ) || (name.toLowerCase() === 'bassan' && password === '123456' ? TEST_USER : null);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais incorretas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10 animate-in fade-in zoom-in-95 duration-500 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#2DD4BF] to-blue-600 rounded-[2rem] shadow-2xl shadow-[#2DD4BF]/10 flex items-center justify-center transform hover:scale-110 transition-transform duration-500">
             <span className="text-black font-black text-4xl">C</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-white">cifra.ia</h1>
            <p className="text-gray-500 font-semibold tracking-wide uppercase text-[10px]">Financial Intelligence Suite</p>
          </div>
        </div>

        <div className="bg-[#161920] border border-[#23272F] p-8 rounded-[2.5rem] shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Usuário ou E-mail</label>
              <input 
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                className="w-full bg-[#0F1115] border border-[#23272F] focus:border-[#2DD4BF] rounded-2xl py-4 px-6 text-white outline-none transition-all placeholder:text-gray-800"
                placeholder="Seu nome ou e-mail"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest ml-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-[#0F1115] border border-[#23272F] focus:border-[#2DD4BF] rounded-2xl py-4 px-6 text-white outline-none transition-all placeholder:text-gray-800"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#2DD4BF] text-xs font-bold"
                >
                  {showPassword ? 'OCULTAR' : 'VER'}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl">
                <p className="text-red-400 text-xs font-bold text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              className="w-full py-5 bg-[#2DD4BF] text-black font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#2DD4BF]/20 mt-4 tracking-[0.2em] text-xs"
            >
              ACESSAR DASHBOARD
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-sm font-medium">
          Ainda não faz parte? <button onClick={onGoToSignup} className="text-[#2DD4BF] font-black hover:underline underline-offset-4">Criar conta grátis</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
