export type User = {
  uid: string;
  role: 'staff' | 'patient';
  accessCode?: string;
};
