import { createAction, props } from '@ngrx/store';
import { Exam } from '../../../models/exam.model';
import { CreateExamRequest } from '../../../models/exam.model';

export const loadExams = createAction('[Exam] Load Exams');

export const loadExamsSuccess = createAction(
  '[Exam] Load Exams Success',
  props<{ exams: Exam[] }>()
);

export const loadExamsFailure = createAction(
  '[Exam] Load Exams Failure',
  props<{ error: string }>()
);

export const createExam = createAction(
  '[Exam] Create Exam',
  props<{ examData: CreateExamRequest }>()
);

export const createExamSuccess = createAction(
  '[Exam] Create Exam Success',
  props<{ exam: Exam }>()
);

export const createExamFailure = createAction(
  '[Exam] Create Exam Failure',
  props<{ error: string }>()
);

export const updateExam = createAction(
  '[Exam] Update Exam',
  props<{ id: string; examData: Partial<Exam> }>()
);

export const updateExamSuccess = createAction(
  '[Exam] Update Exam Success',
  props<{ exam: Exam }>()
);

export const updateExamFailure = createAction(
  '[Exam] Update Exam Failure',
  props<{ error: string }>()
);

export const deleteExam = createAction(
  '[Exam] Delete Exam',
  props<{ id: string }>()
);

export const deleteExamSuccess = createAction(
  '[Exam] Delete Exam Success',
  props<{ id: string }>()
);

export const deleteExamFailure = createAction(
  '[Exam] Delete Exam Failure',
  props<{ error: string }>()
);

// Additional exam actions
export const loadExam = createAction('[Exam] Load Exam', props<{ id: string }>());
export const loadExamSuccess = createAction('[Exam] Load Exam Success', props<{ exam: Exam }>());
export const loadExamFailure = createAction('[Exam] Load Exam Failure', props<{ error: string }>());

export const publishExam = createAction('[Exam] Publish Exam', props<{ id: string }>());
export const publishExamSuccess = createAction('[Exam] Publish Exam Success', props<{ exam: Exam }>());
export const publishExamFailure = createAction('[Exam] Publish Exam Failure', props<{ error: string }>());

export const closeExam = createAction('[Exam] Close Exam', props<{ id: string }>());
export const closeExamSuccess = createAction('[Exam] Close Exam Success', props<{ exam: Exam }>());
export const closeExamFailure = createAction('[Exam] Close Exam Failure', props<{ error: string }>());

export const loadExamDetails = createAction('[Exam] Load Exam Details', props<{ id: string }>());
export const loadExamDetailsSuccess = createAction('[Exam] Load Exam Details Success', props<{ exam: Exam }>());
export const loadExamDetailsFailure = createAction('[Exam] Load Exam Details Failure', props<{ error: string }>());

// Section actions
export const loadSections = createAction('[Exam] Load Sections', props<{ examId: string }>());
export const loadSectionsSuccess = createAction('[Exam] Load Sections Success', props<{ sections: any[] }>());
export const loadSectionsFailure = createAction('[Exam] Load Sections Failure', props<{ error: string }>());

export const createSection = createAction('[Exam] Create Section', props<{ examId: string, section: any }>());
export const createSectionSuccess = createAction('[Exam] Create Section Success', props<{ section: any }>());
export const createSectionFailure = createAction('[Exam] Create Section Failure', props<{ error: string }>());

// Question actions
export const loadQuestions = createAction('[Exam] Load Questions', props<{ sectionId: string }>());
export const loadQuestionsSuccess = createAction('[Exam] Load Questions Success', props<{ questions: any[] }>());
export const loadQuestionsFailure = createAction('[Exam] Load Questions Failure', props<{ error: string }>());

export const createQuestion = createAction('[Exam] Create Question', props<{ sectionId: string, question: any }>());
export const createQuestionSuccess = createAction('[Exam] Create Question Success', props<{ question: any }>());
export const createQuestionFailure = createAction('[Exam] Create Question Failure', props<{ error: string }>());

// Student exam actions
export const loadActiveExams = createAction('[Exam] Load Active Exams');
export const loadActiveExamsSuccess = createAction('[Exam] Load Active Exams Success', props<{ exams: Exam[] }>());
export const loadActiveExamsFailure = createAction('[Exam] Load Active Exams Failure', props<{ error: string }>());

// Clear exam data on logout
export const clearExamData = createAction('[Exam] Clear Exam Data');