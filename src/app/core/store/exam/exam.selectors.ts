import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ExamState } from './exam.reducer';
import { Exam } from '../../../models/exam.model';
import { ExamCalculationsUtil } from '../../utils/exam-calculations.util';

export const selectExamState = createFeatureSelector<ExamState>('exam');

export const selectAllExams = createSelector(
  selectExamState,
  (state: ExamState) => state.exams
);

export const selectCurrentExam = createSelector(
  selectExamState,
  (state: ExamState) => state.currentExam
);

export const selectExamSections = createSelector(
  selectExamState,
  (state: ExamState) => state.sections
);

export const selectExamQuestions = createSelector(
  selectExamState,
  (state: ExamState) => state.questions
);

export const selectActiveExams = createSelector(
  selectExamState,
  (state: ExamState) => state.activeExams
);

export const selectExamLoading = createSelector(
  selectExamState,
  (state: ExamState) => state.isLoading
);

export const selectExamError = createSelector(
  selectExamState,
  (state: ExamState) => state.error
);

// Dynamic calculation selectors
export const selectExamsWithCalculatedStats = createSelector(
  selectAllExams,
  (exams: Exam[]) => {
    return exams.map(exam => ({
      ...exam,
      calculatedTotalQuestions: ExamCalculationsUtil.calculateTotalQuestions(exam),
      calculatedTotalMarks: ExamCalculationsUtil.calculateTotalMarks(exam)
    }));
  }
);

export const selectCurrentExamWithCalculatedStats = createSelector(
  selectCurrentExam,
  (exam: Exam | null) => {
    if (!exam) return null;
    return {
      ...exam,
      calculatedTotalQuestions: ExamCalculationsUtil.calculateTotalQuestions(exam),
      calculatedTotalMarks: ExamCalculationsUtil.calculateTotalMarks(exam)
    };
  }
);

// Selector for a specific exam by ID with calculated stats
export const selectExamByIdWithCalculatedStats = (examId: string) => createSelector(
  selectAllExams,
  (exams: Exam[]) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return null;
    
    return {
      ...exam,
      calculatedTotalQuestions: ExamCalculationsUtil.calculateTotalQuestions(exam),
      calculatedTotalMarks: ExamCalculationsUtil.calculateTotalMarks(exam)
    };
  }
);

