export interface Payment {
  id: number;
  name: string;
  normalizedName: string;
  active: boolean;
}

export interface CreatePaymentFormData {
  name: string;
}

export interface UpdatePaymentFormData extends CreatePaymentFormData {
  id: number;
}
