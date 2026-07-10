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
  targetSystolic?: number;
  targetDiastolic?: number;
  targetPulseLow?: number;
  targetPulseHigh?: number;
  targetSugarLow?: number;
  targetSugarHigh?: number;
  createdAt: string;
  updatedAt: string;
}
