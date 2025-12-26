
import React from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { ICONS } from '../constants';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const MoneyBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 inline-block mr-1 align-text-bottom">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit }) => {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-[#1F2937] p-4 rounded-full mb-4 opacity-50">
          <ICONS.Wallet />
        </div>
        <p className="text-gray-500 font-medium">Nada por aqui ainda.</p>
        <p className="text-gray-600 text-xs">Seu dinheiro em movimento aparece aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice().reverse().map((t) => (
        <div 
          key={t.id} 
          className="group flex items-center justify-between p-4 bg-[#1F2937]/20 hover:bg-[#1F2937]/40 rounded-2xl border border-transparent hover:border-[#2DD4BF]/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div 
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm
                ${t.type === TransactionType.INCOME ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}
            >
              {t.type === TransactionType.INCOME ? 'IN' : 'OUT'}
            </div>
            <div>
              <p className="font-bold text-white/90 leading-tight">{t.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 bg-[#23272F] text-gray-400 rounded-md font-bold uppercase tracking-tighter">
                  {t.category}
                </span>
                {t.paymentMethod && (
                   <span className="text-[10px] text-[#2DD4BF]/60 font-medium">
                     • {t.paymentMethod}
                   </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`font-black ${t.type === TransactionType.INCOME ? 'text-blue-400' : 'text-white'}`}>
                {t.type === TransactionType.EXPENSE && <span className="text-red-500"><MoneyBagIcon /></span>}
                {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-600">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEdit(t)}
                className="p-2 text-gray-600 hover:text-[#2DD4BF] hover:bg-[#2DD4BF]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black"
              >
                EDITAR
              </button>
              <button 
                onClick={() => onDelete(t.id)}
                className="p-2 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <ICONS.Trash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
