import { createReducer, on } from '@ngrx/store';
import * as ExamActions from './exam.actions';
import { Exam } from '../../../models/exam.model';

export interface ExamState {
  exams: Exam[];
  currentExam: Exam | null;
  sections: any[];
  questions: any[];
  activeExams: Exam[];
  isLoading: boolean;
  error: string | null;
}

export const initialExamState: ExamState = {
  exams: [],
  currentExam: null,
  sections: [],
  questions: [],
  activeExams: [],
  isLoading: false,
  error: null,
};

export const examReducer = createReducer(
  initialExamState,
  
  // Load exams
  on(ExamActions.loadExams, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadExamsSuccess, (state, { exams }) => ({
    ...state,
    exams,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.loadExamsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load single exam
  on(ExamActions.loadExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadExamSuccess, (state, { exam }) => ({
    ...state,
    currentExam: exam,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.loadExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create exam
  on(ExamActions.createExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.createExamSuccess, (state, { exam }) => ({
    ...state,
    exams: [...state.exams, exam],
    isLoading: false,
    error: null,
  })),
  on(ExamActions.createExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Update exam
  on(ExamActions.updateExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.updateExamSuccess, (state, { exam }) => ({
    ...state,
    exams: state.exams.map(e => e.id === exam.id ? exam : e),
    currentExam: state.currentExam?.id === exam.id ? exam : state.currentExam,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.updateExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Delete exam
  on(ExamActions.deleteExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.deleteExamSuccess, (state, { id }) => ({
    ...state,
    exams: state.exams.filter(e => e.id !== id),
    currentExam: state.currentExam?.id === id ? null : state.currentExam,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.deleteExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Publish exam
  on(ExamActions.publishExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.publishExamSuccess, (state, { exam }) => ({
    ...state,
    exams: state.exams.map(e => e.id === exam.id ? exam : e),
    currentExam: state.currentExam?.id === exam.id ? exam : state.currentExam,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.publishExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Close exam
  on(ExamActions.closeExam, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.closeExamSuccess, (state, { exam }) => ({
    ...state,
    exams: state.exams.map(e => e.id === exam.id ? exam : e),
    currentExam: state.currentExam?.id === exam.id ? exam : state.currentExam,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.closeExamFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load sections
  on(ExamActions.loadSections, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadSectionsSuccess, (state, { sections }) => ({
    ...state,
    sections,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.loadSectionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create section
  on(ExamActions.createSection, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.createSectionSuccess, (state, { section }) => ({
    ...state,
    sections: [...state.sections, section],
    isLoading: false,
    error: null,
  })),
  on(ExamActions.createSectionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load questions
  on(ExamActions.loadQuestions, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadQuestionsSuccess, (state, { questions }) => ({
    ...state,
    questions,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.loadQuestionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Create question
  on(ExamActions.createQuestion, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.createQuestionSuccess, (state, { question }) => ({
    ...state,
    questions: [...state.questions, question],
    isLoading: false,
    error: null,
  })),
  on(ExamActions.createQuestionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Load active exams
  on(ExamActions.loadActiveExams, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(ExamActions.loadActiveExamsSuccess, (state, { exams }) => ({
    ...state,
    activeExams: exams,
    isLoading: false,
    error: null,
  })),
  on(ExamActions.loadActiveExamsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  // Clear exam data on logout
  on(ExamActions.clearExamData, (state) => ({
    ...initialExamState
  }))
);