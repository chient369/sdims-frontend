export interface PaymentTerm {
  id?: number;
  termNumber: number | string;
  description: string;
  dueDate: string;
  amount: number | string;
  percentage?: number | string;
  status: 'unpaid' | 'invoiced' | 'paid' | 'overdue';
  paidAmount: number | string;
  paidDate?: string | null;
  notes?: string | null;
}

export interface PaymentTermsApiResponse {
  status: string;
  code: number;
  data: Array<{
    id: number;
    termNumber: number;
    dueDate: string;
    amount: number;
    percentage: number;
    description: string;
    status: string;
    paidDate: string | null;
    paidAmount: number | null;
    notes: string | null;
  }>;
  errors: null;
  message: null;
  pageableInfo: null;
} 