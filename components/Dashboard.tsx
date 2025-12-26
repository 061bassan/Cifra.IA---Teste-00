
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, TransactionType, Category, UserProfile } from '../types';
import Card from './Card';
import { ICONS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  userProfile: UserProfile;
}

const PIE_COLORS = ['#2DD4BF', '#3B82F6', '#F87171', '#A78BFA', '#FBBF24', '#6EE7B7', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161920] border border-[#23272F] p-3 rounded-xl shadow-2xl backdrop-blur-md">
        {label && <p className="text-gray-500 font-bold text-[10px] uppercase mb-2">{label}</p>}
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">
                {item.name === 'income' ? 'Movimentação +' : item.name === 'expense' ? 'Movimentação -' : item.name}
              </span>
            </div>
            <span className="text-white font-bold text-xs">
              R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ transactions, userProfile }) => {
  const stats = useMemo(() => {
    // Apenas lançamentos reais para os cards de entrada/saída
    const incomeMovements = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenseMovements = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);

    // Saldo real considerando orçamento base
    const balance = (userProfile.monthlyIncome + incomeMovements) - (userProfile.fixedExpenses + expenseMovements);

    return { 
      incomeMovements, 
      expenseMovements, 
      balance 
    };
  }, [transactions, userProfile.monthlyIncome, userProfile.fixedExpenses]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, { income: number; expense: number }> = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!dataMap[date]) dataMap[date] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) dataMap[date].income += t.amount;
      else dataMap[date].expense += t.amount;
    });

    return Object.entries(dataMap).map(([date, vals]) => ({ date, ...vals }));
  }, [transactions]);

  const categoryData = useMemo(() => {
    return Object.values(Category).map(cat => {
      const total = transactions
        .filter(t => t.category === cat && t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + t.amount, 0);
      return { name: cat, value: total };
    }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <Card className="hover:border-[#3B82F6]/30 transition-all">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Entradas (Lançamentos)</p>
        <p className="text-3xl font-black text-blue-400">R$ {stats.incomeMovements.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p className="text-[10px] text-gray-700 mt-2 font-bold uppercase tracking-tighter">Aportes e Ganhos Reais</p>
      </Card>

      <Card className="hover:border-red-400/30 transition-all">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Saídas (Lançamentos)</p>
        <p className="text-3xl font-black text-white">R$ {stats.expenseMovements.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p className="text-[10px] text-gray-700 mt-2 font-bold uppercase tracking-tighter">Gastos e Investimentos</p>
      </Card>

      <Card className="bg-gradient-to-br from-[#2DD4BF]/5 to-[#161920] border-[#2DD4BF]/20 hover:border-[#2DD4BF]/50 transition-all">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Saldo em Conta</p>
        <p className="text-3xl font-black text-[#2DD4BF]">R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <div className="flex items-center gap-1 text-[10px] text-[#2DD4BF]/70 mt-2 font-bold uppercase tracking-tighter">
          <ICONS.Sparkles /> <span>Sua saúde financeira atual</span>
        </div>
      </Card>

      <Card title="Movimento de Caixa" className="md:col-span-2 min-h-[350px]">
        <div className="h-[280px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F87171" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F87171" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#23272F" vertical={false} opacity={0.5} />
              <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tick={{dy: 10}} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2DD4BF', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="income" stroke="#3B82F6" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} animationDuration={1000} />
              <Area type="monotone" dataKey="expense" stroke="#F87171" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Gastos por Categoria" className="flex flex-col">
        <div className="h-[220px] w-full mt-4">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1200}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-xs font-bold uppercase tracking-widest">Nada registrado</div>
          )}
        </div>
        <div className="mt-6 w-full space-y-3">
          {categoryData.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-[10px] group">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                <span className="text-gray-400 group-hover:text-white transition-colors">{item.name}</span>
              </div>
              <span className="text-white font-bold">R$ {item.value.toLocaleString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
