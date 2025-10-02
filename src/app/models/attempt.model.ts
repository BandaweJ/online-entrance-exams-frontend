export interface ExamAttempt {
  id: string;
  status: 'in_progress' | 'paused' | 'submitted' | 'timed_out' | 'disqualified';
  startTime: string;
  endTime: string;
  startedAt?: string;
  submittedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  timeSpent: number;
  questionsAnswered: number;
  totalQuestions: number;
  score: number;
  totalMarks: number;
  percentage: number;
  isGraded: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  examId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  exam?: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  answers?: Answer[];
}

export interface Answer {
  id: string;
  answerText?: string;
  selectedOptions?: string[];
  isCorrect?: boolean;
  score: number;
  maxScore: number;
  isGraded: boolean;
  feedback?: string;
  questionIndex: number;
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

export interface CreateAttemptRequest {
  examId: string;
}

export interface UpdateAttemptRequest {
  status?: 'in_progress' | 'paused' | 'submitted' | 'timed_out' | 'disqualified';
  timeSpent?: number;
  questionsAnswered?: number;
  score?: number;
  percentage?: number;
  isGraded?: boolean;
}

export interface AnswerRequest {
  questionId: string;
  attemptId: string;
  answerText?: string;
  selectedOptions?: string[];
}

export interface AttemptStats {
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  pausedAttempts: number;
  averageScore: number;
  totalTimeSpent: number;
}
