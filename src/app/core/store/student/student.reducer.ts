import { createReducer, on } from '@ngrx/store';
import * as StudentActions from './student.actions';
import { Student } from '../../../models/student.model';

export interface StudentState {
  students: Student[];
  currentStudent: Student | null;
  stats: any;
  isLoading: boolean;
  error: string | null;
}

export const initialStudentState: StudentState = {
  students: [],
  currentStudent: null,
  stats: null,
  isLoading: false,
  error: null,
};

export const studentReducer = createReducer(
  initialStudentState,
  
  // Load students
  on(StudentActions.loadStudents, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.loadStudentsSuccess, (state, { students }) => ({
    ...state,
    students,
    isLoading: false,
    error: null,
  })),
  on(StudentActions.loadStudentsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create student
  on(StudentActions.createStudent, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.createStudentSuccess, (state, { student }) => ({
    ...state,
    students: [...state.students, student],
    isLoading: false,
    error: null,
  })),
  on(StudentActions.createStudentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update student
  on(StudentActions.updateStudent, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.updateStudentSuccess, (state, { student }) => ({
    ...state,
    students: state.students.map(s => s.id === student.id ? student : s),
    currentStudent: state.currentStudent?.id === student.id ? student : state.currentStudent,
    isLoading: false,
    error: null,
  })),
  on(StudentActions.updateStudentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete student
  on(StudentActions.deleteStudent, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.deleteStudentSuccess, (state, { id }) => ({
    ...state,
    students: state.students.filter(s => s.id !== id),
    currentStudent: state.currentStudent?.id === id ? null : state.currentStudent,
    isLoading: false,
    error: null,
  })),
  on(StudentActions.deleteStudentFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load student stats
  on(StudentActions.loadStudentStats, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.loadStudentStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    isLoading: false,
    error: null,
  })),
  on(StudentActions.loadStudentStatsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Resend credentials
  on(StudentActions.resendCredentials, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(StudentActions.resendCredentialsSuccess, (state, { student }) => ({
    ...state,
    students: state.students.map(s => s.id === student.id ? student : s),
    isLoading: false,
    error: null,
  })),
  on(StudentActions.resendCredentialsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  }))
);