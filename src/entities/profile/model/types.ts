export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  birthDate?: string;
  diagnosis?: string;
  bloodType?: string;
  allergies?: string;
  doctorName?: string;
  doctorPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
