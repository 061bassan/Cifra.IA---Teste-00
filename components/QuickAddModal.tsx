
import React, { useState, useEffect } from 'react';
import { TransactionType, Category, Transaction, PaymentMethod } from '../types';
import { ICONS } from '../constants';

interface QuickAddModalProps {
  mode?: 'normal' | 'investment';
  initialData?: Transaction | null;
  onAdd: (transaction: Omit<Transaction, 'id' | 'date' | 'userId'>) => void;
  onUpdate?: (id: string, updates: Partial<Transaction>) => void;
  onClose: () => void;
}

const ASSET_TYPES = [
  'CDB / Renda Fixa',
  'Ações (Bolsa)',
  'FIIs (Imobiliário)',
  'Criptoativos',
  'Tesouro Direto',
  'Reserva de Emergência'
];

const QuickAddModal: React.FC<QuickAddModalProps> = ({ mode = 'normal', initialData, onAdd, onUpdate, onClose }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDescription(initialData.description);
      setType(initialData.type);
      setCategory(initialData.category);
      if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
    } else if (mode === 'investment') {
      setType(TransactionType.EXPENSE);
      setCategory(Category.INVESTMENT);
      setDescription(ASSET_TYPES[0]);
    }
  }, [mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || (!description && mode === 'normal')) return;
    
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount)) return;

    if (initialData && onUpdate) {
      onUpdate(initialData.id, {
        amount: numericAmount,
        description,
        type,
        category,
        paymentMethod: type === TransactionType.EXPENSE ? paymentMethod : undefined
      });
    } else {
      onAdd({
        amount: numericAmount,
        description,
        type,
        category,
        paymentMethod: type === TransactionType.EXPENSE ? paymentMethod : undefined
      });
    }
    onClose();
  };

  const handleAmountChange = (val: string) => {
    // Only allow numbers and decimal separator
    const cleanVal = val.replace(/[^0-9.,]/g, '');
    setAmount(cleanVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161920] w-full max-w-md rounded-[2.5rem] p-8 border border-[#23272F] shadow-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {initialData ? 'Editar Registro' : (mode === 'investment' ? 'Novo Investimento' : 'Novo Movimento')}
          </h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1F2937] text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 block">Valor (Números Apenas)</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg group-focus-within:text-[#2DD4BF] transition-colors">R$</span>
              <input 
                type="text" 
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                autoFocus
                className="w-full bg-[#0F1115] border border-[#23272F] focus:border-[#2DD4BF] rounded-2xl py-5 pl-14 pr-4 text-3xl font-black text-white outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'investment' ? (
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 block">Tipo de Ativo</label>
              <div className="grid grid-cols-2 gap-2">
                {ASSET_TYPES.map(asset => (
                  <button
                    key={asset}
                    type="button"
                    onClick={() => setDescription(asset)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black border transition-all uppercase tracking-tighter ${
                      description === asset 
                        ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#2DD4BF]' 
                        : 'bg-[#0F1115] border-[#23272F] text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 p-1 bg-[#0F1115] rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setType(TransactionType.EXPENSE)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === TransactionType.EXPENSE ? 'bg-[#F87171]/10 text-[#F87171] shadow-inner' : 'text-gray-500'}`}
                >
                  Gasto
                </button>
                <button 
                  type="button"
                  onClick={() => setType(TransactionType.INCOME)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${type === TransactionType.INCOME ? 'bg-[#3B82F6]/10 text-[#3B82F6] shadow-inner' : 'text-gray-500'}`}
                >
                  Entrada
                </button>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 block">Descrição</label>
                <input 
                  type="text" 
                  placeholder="Ex: Assinatura Netflix"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#23272F] focus:border-[#2DD4BF] rounded-2xl py-4 px-5 text-white outline-none transition-all placeholder:text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 block">Categoria</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                  className="w-full bg-[#0F1115] border border-[#23272F] focus:border-[#2DD4BF] rounded-2xl py-4 px-5 text-white outline-none appearance-none transition-all font-medium cursor-pointer"
                >
                  {Object.values(Category).filter(c => c !== Category.INVESTMENT).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {type === TransactionType.EXPENSE && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mb-3 block">Origem do Recurso</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(PaymentMethod).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 px-4 rounded-xl text-[10px] font-black border transition-all uppercase tracking-tighter ${
                      paymentMethod === method 
                        ? 'bg-[#2DD4BF]/10 border-[#2DD4BF] text-[#2DD4BF]' 
                        : 'bg-[#0F1115] border-[#23272F] text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit"
            className={`w-full py-5 font-black rounded-2xl hover:translate-y-[-2px] active:translate-y-0 transition-all text-sm tracking-widest ${
              mode === 'investment' 
                ? 'bg-[#2DD4BF] text-black shadow-[0_8px_30px_rgb(45,212,191,0.3)]' 
                : 'bg-white text-black'
            }`}
          >
            {initialData ? 'SALVAR ALTERAÇÕES' : (mode === 'investment' ? 'INVESTIR AGORA' : 'ADICIONAR AGORA')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickAddModal;
