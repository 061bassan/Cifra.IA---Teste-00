
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, UserProfile, TransactionType, AIInsight, Category } from './types';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import QuickAddModal from './components/QuickAddModal';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import AIInsightPanel from './components/AIInsightPanel';
import InvestmentView from './components/InvestmentView';
import AccountView from './components/AccountView';
import Card from './components/Card';
import { ICONS } from './constants';
import { getFinancialInsights } from './services/geminiService';

type Tab = 'overview' | 'investments' | 'account';
type AuthView = 'login' | 'signup' | 'app';

const App: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [modalMode, setModalMode] = useState<'normal' | 'investment'>('normal');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isEditingFixed, setIsEditingFixed] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempFixed, setTempFixed] = useState('0');
  const [tempIncome, setTempIncome] = useState('0');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Session & User Recovery
  useEffect(() => {
    const session = localStorage.getItem('cifra_active_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        const users: UserProfile[] = JSON.parse(localStorage.getItem('cifra_users') || '[]');
        const verifiedUser = users.find(u => u.id === user.id);
        if (verifiedUser) {
          setCurrentUser(verifiedUser);
          setView('app');
        }
      } catch (e) {
        localStorage.removeItem('cifra_active_session');
      }
    }
  }, []);

  // 2. Load Transactions
  useEffect(() => {
    if (currentUser?.id) {
      const storageKey = `cifra_transactions_${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        setTransactions([]);
      }
      setTempFixed(currentUser.fixedExpenses.toString());
      setTempIncome(currentUser.monthlyIncome.toString());
    }
  }, [currentUser?.id]);

  // 3. Memoized Insights
  useEffect(() => {
    if (view === 'app' && currentUser && transactions.length >= 1) {
      const timer = setTimeout(async () => {
        setLoadingInsights(true);
        const newInsights = await getFinancialInsights(transactions, currentUser);
        setInsights(newInsights);
        setLoadingInsights(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactions.length, view, currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('cifra_active_session', JSON.stringify(user));
    setView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('cifra_active_session');
    setCurrentUser(null);
    setTransactions([]);
    setView('login');
  };

  const handleUpdateFixedExpenses = () => {
    if (!currentUser) return;
    const value = parseFloat(tempFixed.replace(',', '.')) || 0;
    const updatedUser = { ...currentUser, fixedExpenses: value };
    const users: UserProfile[] = JSON.parse(localStorage.getItem('cifra_users') || '[]');
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('cifra_users', JSON.stringify(updatedUsers));
    localStorage.setItem('cifra_active_session', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setIsEditingFixed(false);
  };

  const handleUpdateIncome = () => {
    if (!currentUser) return;
    const value = parseFloat(tempIncome.replace(',', '.')) || 0;
    const updatedUser = { ...currentUser, monthlyIncome: value };
    const users: UserProfile[] = JSON.parse(localStorage.getItem('cifra_users') || '[]');
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    localStorage.setItem('cifra_users', JSON.stringify(updatedUsers));
    localStorage.setItem('cifra_active_session', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setIsEditingIncome(false);
  };

  const handleAddTransaction = (newT: Omit<Transaction, 'id' | 'date' | 'userId'>) => {
    if (!currentUser) return;
    const transaction: Transaction = {
      ...newT,
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date: new Date().toISOString(),
    };
    const updated = [...transactions, transaction];
    setTransactions(updated);
    localStorage.setItem(`cifra_transactions_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    if (!currentUser) return;
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updated);
    localStorage.setItem(`cifra_transactions_${currentUser.id}`, JSON.stringify(updated));
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!currentUser) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(`cifra_transactions_${currentUser.id}`, JSON.stringify(updated));
  };

  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setModalMode(t.category === Category.INVESTMENT ? 'investment' : 'normal');
    setShowAddModal(true);
  };

  if (view === 'login') return <Login onLogin={handleLogin} onGoToSignup={() => setView('signup')} />;
  if (view === 'signup') return <Onboarding onComplete={handleLogin} onGoToLogin={() => setView('login')} />;

  const isAdmin = currentUser?.documentType === 'CNPJ';

  return (
    <div className="min-h-screen pb-32 lg:pb-12 bg-[#0F1115] text-white selection:bg-[#2DD4BF]/30">
      <header className="sticky top-0 z-40 bg-[#0F1115]/80 backdrop-blur-xl border-b border-[#23272F]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#2DD4BF] to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-black font-black text-xl">C</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">cifra.ia</h1>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-1.5 pl-4 bg-[#161920] border border-[#23272F] rounded-full hover:border-[#2DD4BF]/50 transition-all">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60 leading-none mb-1">{isAdmin ? 'Perfil PJ' : 'Perfil PF'}</p>
                <p className="text-sm font-bold leading-none">{currentUser?.name.split(' ')[0]}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1F2937] to-[#111827] border border-[#23272F] flex items-center justify-center font-bold text-[#2DD4BF]">
                {currentUser?.name?.[0]?.toUpperCase()}
              </div>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-[#161920] border border-[#23272F] rounded-3xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="pb-4 mb-4 border-b border-[#23272F]">
                  <p className="text-white font-black">{currentUser?.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{currentUser?.email}</p>
                </div>
                <button onClick={() => { setActiveTab('account'); setShowProfileMenu(false); }} className="w-full text-left p-3 hover:bg-white/5 rounded-2xl transition-all text-sm font-bold flex items-center gap-3 text-gray-400 hover:text-white mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#2DD4BF]"></div> Minha Conta
                </button>
                <button onClick={handleLogout} className="w-full text-left p-3 hover:bg-red-500/10 rounded-2xl transition-all text-sm font-bold flex items-center gap-3 text-red-400">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-4 border-b border-[#23272F]">
          <button onClick={() => setActiveTab('overview')} className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'overview' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Visão Geral {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2DD4BF] rounded-t-full"></div>}
          </button>
          <button onClick={() => setActiveTab('investments')} className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'investments' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            Investimentos {activeTab === 'investments' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2DD4BF] rounded-t-full"></div>}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            {activeTab === 'overview' && (
              <>
                <section>
                  <Dashboard transactions={transactions} userProfile={currentUser!} />
                </section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold tracking-tight">Atividade Recente</h2>
                    <Card className="min-h-[400px]">
                      <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} onEdit={handleEditClick} />
                    </Card>
                  </section>
                  <section className="space-y-8">
                    <AIInsightPanel insights={insights} loading={loadingInsights} />
                    <Card title="Planejamento" className="relative group">
                      <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-[#0F1115] border border-[#23272F] transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Faturamento Mensal</span>
                            <button onClick={() => setIsEditingIncome(!isEditingIncome)} className="text-[10px] text-[#2DD4BF] font-bold">{isEditingIncome ? 'CANCELAR' : 'EDITAR'}</button>
                          </div>
                          {isEditingIncome ? (
                            <div className="flex gap-2">
                              <input type="text" inputMode="decimal" value={tempIncome} onChange={e => setTempIncome(e.target.value.replace(/[^0-9.,]/g, ''))} className="flex-1 bg-[#161920] border-b border-[#2DD4BF] outline-none text-xl font-black py-2 px-3 text-white" autoFocus />
                              <button onClick={handleUpdateIncome} className="px-4 py-2 bg-[#2DD4BF] text-black rounded-xl text-xs font-black">OK</button>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-gray-500 text-sm font-bold">R$</span>
                              <span className="text-3xl font-black text-white">{currentUser!.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>

                        <div className="p-5 rounded-2xl bg-[#0F1115] border border-[#23272F] transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Gastos Fixos</span>
                            <button onClick={() => setIsEditingFixed(!isEditingFixed)} className="text-[10px] text-[#2DD4BF] font-bold">{isEditingFixed ? 'CANCELAR' : 'EDITAR'}</button>
                          </div>
                          {isEditingFixed ? (
                            <div className="flex gap-2">
                              <input type="text" inputMode="decimal" value={tempFixed} onChange={e => setTempFixed(e.target.value.replace(/[^0-9.,]/g, ''))} className="flex-1 bg-[#161920] border-b border-[#2DD4BF] outline-none text-xl font-black py-2 px-3 text-white" autoFocus />
                              <button onClick={handleUpdateFixedExpenses} className="px-4 py-2 bg-[#2DD4BF] text-black rounded-xl text-xs font-black">OK</button>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-gray-500 text-sm font-bold">R$</span>
                              <span className="text-3xl font-black text-white">{currentUser!.fixedExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>

                        {currentUser!.monthlyIncome > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-gray-500 font-bold uppercase tracking-tighter">Comprometimento de Renda</span>
                              <span className="text-white font-black">{(currentUser!.fixedExpenses / currentUser!.monthlyIncome * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-[#0F1115] rounded-full overflow-hidden border border-[#23272F]">
                              <div className={`h-full transition-all duration-1000 ${ (currentUser!.fixedExpenses / currentUser!.monthlyIncome) > 0.6 ? 'bg-red-500' : 'bg-[#2DD4BF]'}`} style={{ width: `${Math.min(100, (currentUser!.fixedExpenses / currentUser!.monthlyIncome * 100))}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </section>
                </div>
              </>
            )}
            {activeTab === 'investments' && <InvestmentView transactions={transactions} userProfile={currentUser!} onDelete={handleDeleteTransaction} onEdit={handleEditClick} />}
            {activeTab === 'account' && currentUser && <AccountView user={currentUser} />}
          </div>
        </div>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => { setEditingTransaction(null); setModalMode(activeTab === 'investments' ? 'investment' : 'normal'); setShowAddModal(true); }} className={`flex items-center gap-3 px-10 py-5 rounded-full font-black shadow-2xl transition-all group ${activeTab === 'investments' ? 'bg-[#2DD4BF] text-black' : 'bg-white text-black'} hover:scale-105 active:scale-95`}>
          <div className="p-1 rounded-md bg-black text-white"><ICONS.Plus /></div>
          <span className="tracking-widest text-xs">{activeTab === 'investments' ? 'NOVO INVESTIMENTO' : 'NOVO LANÇAMENTO'}</span>
        </button>
      </div>

      {showAddModal && (
        <QuickAddModal 
          mode={modalMode} 
          initialData={editingTransaction}
          onClose={() => { setShowAddModal(false); setEditingTransaction(null); }} 
          onAdd={handleAddTransaction} 
          onUpdate={handleUpdateTransaction}
        />
      )}
    </div>
  );
};

export default App;
