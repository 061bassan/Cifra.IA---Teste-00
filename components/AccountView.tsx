
import React, { useState } from 'react';
import { UserProfile } from '../types';
import Card from './Card';

interface AccountViewProps {
  user: UserProfile;
}

const AccountView: React.FC<AccountViewProps> = ({ user }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isAdmin = user.documentType === 'CNPJ';

  const InfoRow = ({ label, value, isSensitive = false }: { label: string; value: string; isSensitive?: boolean }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#23272F] last:border-0">
      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 sm:mb-0">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-bold">
          {isSensitive && !showPassword ? '••••••••' : value}
        </span>
        {isSensitive && (
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="text-[10px] text-[#2DD4BF] font-black hover:underline"
          >
            {showPassword ? 'OCULTAR' : 'VER'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">
            {isAdmin ? 'Perfil Administrativo' : 'Minha Conta'}
        </h2>
        <p className="text-gray-500">
            {isAdmin ? 'Dados empresariais e segurança da conta corporativa.' : 'Gerencie seus dados e preferências de segurança.'}
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="space-y-2">
          <InfoRow label={isAdmin ? "Razão Social" : "Nome Completo"} value={user.name} />
          <InfoRow label="E-mail" value={user.email} />
          <InfoRow label={user.documentType} value={user.documentValue} />
          <InfoRow label={isAdmin ? "Data de Abertura" : "Data de Nascimento"} value={new Date(user.birthDate).toLocaleDateString('pt-BR')} />
          <InfoRow label="Senha de Acesso" value={user.password || ''} isSensitive />
        </div>
      </Card>

      <div className="mt-8 p-6 rounded-3xl bg-[#2DD4BF]/5 border border-[#2DD4BF]/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#2DD4BF]/20 flex items-center justify-center text-[#2DD4BF] shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1">Criptografia Ativa</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Seus dados estão protegidos por criptografia militar. Somente você tem acesso ao histórico de {isAdmin ? 'faturamentos' : 'gastos'} e movimentações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountView;
