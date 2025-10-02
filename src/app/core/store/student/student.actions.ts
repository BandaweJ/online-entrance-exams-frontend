import { createAction, props } from '@ngrx/store';
import { Student } from '../../../models/student.model';
import { CreateStudentRequest } from '../../../models/student.model';

export const loadStudents = createAction('[Student] Load Students');

export const loadStudentsSuccess = createAction(
  '[Student] Load Students Success',
  props<{ students: Student[] }>()
);

export const loadStudentsFailure = createAction(
  '[Student] Load Students Failure',
  props<{ error: string }>()
);

export const createStudent = createAction(
  '[Student] Create Student',
  props<{ studentData: CreateStudentRequest }>()
);

export const createStudentSuccess = createAction(
  '[Student] Create Student Success',
  props<{ student: Student }>()
);

export const createStudentFailure = createAction(
  '[Student] Create Student Failure',
  props<{ error: string }>()
);

export const updateStudent = createAction(
  '[Student] Update Student',
  props<{ id: string; studentData: Partial<Student> }>()
);

export const updateStudentSuccess = createAction(
  '[Student] Update Student Success',
  props<{ student: Student }>()
);

export const updateStudentFailure = createAction(
  '[Student] Update Student Failure',
  props<{ error: string }>()
);

export const deleteStudent = createAction(
  '[Student] Delete Student',
  props<{ id: string }>()
);

export const deleteStudentSuccess = createAction(
  '[Student] Delete Student Success',
  props<{ id: string }>()
);

export const deleteStudentFailure = createAction(
  '[Student] Delete Student Failure',
  props<{ error: string }>()
);

// Student stats actions
export const loadStudentStats = createAction('[Student] Load Student Stats');
export const loadStudentStatsSuccess = createAction('[Student] Load Student Stats Success', props<{ stats: any }>());
export const loadStudentStatsFailure = createAction('[Student] Load Student Stats Failure', props<{ error: string }>());

// Resend credentials actions
export const resendCredentials = createAction('[Student] Resend Credentials', props<{ id: string }>());
export const resendCredentialsSuccess = createAction('[Student] Resend Credentials Success', props<{ student: Student }>());
export const resendCredentialsFailure = createAction('[Student] Resend Credentials Failure', props<{ error: string }>());