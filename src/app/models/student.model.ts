export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  school?: string;
  grade?: string;
  isActive: boolean;
  credentialsSent: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateStudentRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  school?: string;
  grade?: string;
  isActive?: boolean;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  credentialsSent: number;
  credentialsPending: number;
}
