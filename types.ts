
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum PaymentMethod {
  PIX = 'Pix',
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  OTHER = 'Outro'
}

export enum Category {
  FOOD = 'Alimentação',
  BILLS = 'Contas',
  LEISURE = 'Lazer',
  TRANSPORT = 'Transporte',
  STUDY = 'Estudos',
  INVESTMENT = 'Investimento',
  OTHER = 'Outros',
  SALARY = 'Salário',
  EXTRA = 'Renda Extra'
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  paymentMethod?: PaymentMethod;
  date: string;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'alert' | 'success' | 'info';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  birthDate: string;
  documentType: 'CPF' | 'CNPJ';
  documentValue: string;
  monthlyIncome: number;
  fixedExpenses: number;
  currency: string;
}

export interface AppState {
  transactions: Transaction[];
  userProfile: UserProfile | null;
  onboardingComplete: boolean;
}
