
import React, { useMemo } from 'react';
import { Transaction, Category, UserProfile } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import Card from './Card';
import { ICONS } from '../constants';

interface InvestmentViewProps {
  transactions: Transaction[];
  userProfile: UserProfile;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const PIE_COLORS = ['#2DD4BF', '#3B82F6', '#818CF8', '#A78BFA', '#F472B6', '#10B981', '#FBBF24'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161920] border border-[#23272F] p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[#2DD4BF] font-black text-[10px] uppercase tracking-widest mb-1">
          {payload[0].name}
        </p>
        <p className="text-white font-bold text-sm">
          R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const InvestmentView: React.FC<InvestmentViewProps> = ({ transactions, userProfile, onDelete, onEdit }) => {
  const investments = useMemo(() => 
    transactions.filter(t => t.category === Category.INVESTMENT), 
    [transactions]
  );

  const totalInvested = useMemo(() => 
    investments.reduce((acc, t) => acc + t.amount, 0), 
    [investments]
  );
  
  const assetData = useMemo(() => {
    const acc: Record<string, number> = {};
    investments.forEach(t => {
      acc[t.description] = (acc[t.description] || 0) + t.amount;
    });
    return Object.entries(acc)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [investments]);

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente remover este investimento? Esta ação atualizará seu portfólio imediatamente.')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Patrimônio em Ativos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-[#2DD4BF]">
              R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-4 leading-relaxed">
            Seus aportes representam <span className="text-white font-bold">{(totalInvested / (userProfile.monthlyIncome || 1) * 100).toFixed(1)}%</span> do seu faturamento base.
          </p>
        </Card>

        <Card title="Alocação de Portfólio">
          <div className="h-[220px] w-full mt-2">
            {assetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {assetData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-[10px] font-black uppercase tracking-widest">Sem ativos para exibir</div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Histórico de Aportes">
        {investments.length > 0 ? (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {investments.slice().reverse().map(t => (
              <div key={t.id} className="group flex items-center justify-between p-5 bg-[#0F1115] rounded-3xl border border-[#23272F] hover:border-[#2DD4BF]/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                     <ICONS.Wallet />
                   </div>
                   <div>
                    <p className="font-bold text-white text-sm group-hover:text-[#2DD4BF] transition-colors">{t.description}</p>
                    <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-black text-[#2DD4BF] text-lg">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">{t.paymentMethod || 'Direto'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-2 text-gray-400 hover:text-[#2DD4BF] hover:bg-[#2DD4BF]/10 rounded-xl transition-all"
                      title="Alterar Investimento"
                    >
                      <span className="text-[10px] font-black uppercase">Editar</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Excluir Investimento"
                    >
                      <ICONS.Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0F1115] rounded-3xl border border-dashed border-[#23272F]">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Nenhum aporte registrado</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvestmentView;
