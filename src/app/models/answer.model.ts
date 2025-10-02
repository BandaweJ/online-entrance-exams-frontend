export interface Answer {
  id: string;
  answerText: string;
  selectedOptions?: string[];
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  isGraded: boolean;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  questionId: string;
  attemptId: string;
  question?: {
    id: string;
    questionText: string;
    type: string;
    marks: number;
  };
}

export interface CreateAnswerRequest {
  questionId: string;
  attemptId: string;
  answerText: string;
  selectedOptions?: string[];
}

export interface UpdateAnswerRequest {
  answerText?: string;
  selectedOptions?: string[];
}
