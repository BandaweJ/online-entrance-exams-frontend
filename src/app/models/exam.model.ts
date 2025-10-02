export interface Exam {
  id: string;
  title: string;
  description?: string;
  year: number;
  examDate: string;
  durationMinutes: number;
  status: 'draft' | 'published' | 'closed';
  totalMarks: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  totalMarks: number;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  examId: string;
  questions?: Question[];
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface Question {
  id: string;
  questionText: string;
  type: QuestionType;
  description?: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  order: number;
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sectionId: string;
  section?: Section;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  year: number;
  examDate: string;
  durationMinutes: number;
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  order: number;
}

export interface CreateQuestionRequest {
  questionText: string;
  type: QuestionType;
  description?: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  order: number;
  explanation?: string;
}
