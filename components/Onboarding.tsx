
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onGoToLogin: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onGoToLogin }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    email: '',
    password: '',
    birthDate: '',
    documentType: 'CPF',
    documentValue: '',
    monthlyIncome: 0,
    fixedExpenses: 0,
    currency: 'BRL'
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const next = () => {
    setError('');
    if (step === 2) {
      const age = calculateAge(profile.birthDate);
      if (age < 16) {
        setError('Acesso restrito: Você deve ter pelo menos 16 anos para usar o cifra.ia.');
        return;
      }
    }
    setStep(s => s + 1);
  };
  
  const prev = () => {
    setError('');
    setStep(s => s - 1);
  };

  const formatDocument = (value: string, type: 'CPF' | 'CNPJ') => {
    const digits = value.replace(/\D/g, '');
    if (type === 'CPF') {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .slice(0, 14);
    } else {
      return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .slice(0, 18);
    }
  };

  const handlePasswordChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '');
    setProfile({ ...profile, password: numericVal });
  };

  const isStep1Valid = profile.name.trim().length > 3;
  const isStep2Valid = 
    profile.email.includes('@') && 
    profile.password && 
    profile.password.length >= 4 && 
    profile.documentValue.length >= (profile.documentType === 'CPF' ? 14 : 18) && 
    profile.birthDate;
  const isStep3Valid = profile.monthlyIncome > 0;

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-[#2DD4BF]' : 'w-4 bg-gray-800'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-center mb-4">
               <div className="w-16 h-16 bg-gradient-to-tr from-[#2DD4BF] to-blue-600 rounded-2xl shadow-2xl flex items-center justify-center">
                  <span className="text-black font-black text-2xl">C</span>
               </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white">Olá, qual o <span className="text-[#2DD4BF]">nome</span>?</h1>
              <p className="text-gray-400">Pode ser o seu nome pessoal ou o nome da sua empresa.</p>
            </div>
            <input 
              type="text"
              placeholder="escreva aqui"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="w-full bg-transparent border-b-2 border-gray-800 focus:border-[#2DD4BF] py-4 text-3xl font-bold outline-none transition-colors text-center text-white"
              autoFocus
            />
            <div className="space-y-4">
              <button 
                disabled={!isStep1Valid}
                onClick={next}
                className={`w-full py-4 font-black rounded-2xl transition-all ${isStep1Valid ? 'bg-[#2DD4BF] text-[#0F1115] hover:scale-105' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                CONTINUAR
              </button>
              <button onClick={onGoToLogin} className="text-gray-500 text-sm hover:text-gray-300">Já tenho uma conta</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
            <div className="space-y-2 text-center mb-4">
              <h1 className="text-3xl font-black tracking-tight text-white">Seus <span className="text-[#2DD4BF]">dados</span></h1>
              <p className="text-gray-400">Segurança máxima para suas finanças.</p>
            </div>
            
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs font-bold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">E-mail</label>
                <input 
                  type="email"
                  placeholder="seu@email.com"
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-[#161920] border border-[#23272F] focus:border-[#2DD4BF] rounded-xl py-3 px-4 text-white outline-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] text-[#2DD4BF] font-black uppercase tracking-tighter opacity-80 mb-0.5">🔒 Dados criptografados</span>
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none">Documento Identificador</label>
                  </div>
                  <div className="flex p-1 bg-[#0F1115] border border-[#23272F] rounded-lg">
                    <button 
                      onClick={() => setProfile({...profile, documentType: 'CPF', documentValue: ''})}
                      className={`px-3 py-1 text-[9px] font-black rounded ${profile.documentType === 'CPF' ? 'bg-[#2DD4BF] text-black' : 'text-gray-500'}`}
                    >CPF</button>
                    <button 
                      onClick={() => setProfile({...profile, documentType: 'CNPJ', documentValue: ''})}
                      className={`px-3 py-1 text-[9px] font-black rounded ${profile.documentType === 'CNPJ' ? 'bg-[#2DD4BF] text-black' : 'text-gray-500'}`}
                    >CNPJ</button>
                  </div>
                </div>
                <input 
                  type="text"
                  placeholder={profile.documentType === 'CPF' ? "000.000.000-00" : "00.000.000/0000-00"}
                  value={profile.documentValue}
                  onChange={e => setProfile({...profile, documentValue: formatDocument(e.target.value, profile.documentType)})}
                  className="w-full bg-[#161920] border border-[#23272F] focus:border-[#2DD4BF] rounded-xl py-3 px-4 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Nascimento / Abertura (Mín. 16 anos)</label>
                <input 
                  type="date"
                  value={profile.birthDate}
                  onChange={e => setProfile({...profile, birthDate: e.target.value})}
                  className="w-full bg-[#161920] border border-[#23272F] focus:border-[#2DD4BF] rounded-xl py-3 px-4 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Senha de Acesso (Apenas Números)</label>
                <input 
                  type="text"
                  inputMode="numeric"
                  placeholder="Mínimo 4 dígitos"
                  value={profile.password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  className="w-full bg-[#161920] border border-[#23272F] focus:border-[#2DD4BF] rounded-xl py-3 px-4 text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button onClick={prev} className="flex-1 py-4 bg-gray-800 text-gray-400 font-black rounded-2xl">VOLTAR</button>
              <button 
                disabled={!isStep2Valid}
                onClick={next}
                className={`flex-[2] py-4 font-black rounded-2xl transition-all ${isStep2Valid ? 'bg-[#2DD4BF] text-[#0F1115]' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}
              >
                PROXIMO
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-white">Quanto você <span className="text-blue-400">recebe</span> por mês?</h1>
              <p className="text-gray-400">Sua renda mensal ou faturamento médio.</p>
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-gray-600 font-bold">R$</span>
              <input 
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={profile.monthlyIncome || ''}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9.]/g, '');
                  setProfile({...profile, monthlyIncome: parseFloat(val) || 0});
                }}
                className="w-full bg-transparent border-b-2 border-gray-800 focus:border-blue-400 py-4 pl-12 text-5xl font-bold outline-none transition-colors text-center text-white"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
               <button onClick={prev} className="flex-1 py-4 bg-gray-800 text-gray-400 font-black rounded-2xl">VOLTAR</button>
               <button 
                disabled={!isStep3Valid}
                onClick={() => onComplete(profile)}
                className={`flex-[2] py-4 font-black rounded-2xl transition-all ${isStep3Valid ? 'bg-blue-500 text-white hover:scale-105' : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}
              >
                FINALIZAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
