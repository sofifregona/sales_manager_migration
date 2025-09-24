export interface Bartable {
  id: number;
  number: number;
  active: boolean;
}

export interface CreateBartableFormData {
  number: number;
}

export interface UpdateBartableFormData extends CreateBartableFormData {
  id: number;
}
