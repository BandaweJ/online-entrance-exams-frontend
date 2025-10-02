export interface Result {
  id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  rank: number;
  totalStudents: number;
  questionsAnswered: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  isPassed: boolean;
  passPercentage?: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  examId: string;
  attemptId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  exam?: {
    id: string;
    title: string;
    year: number;
  };
  questionResults?: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksObtained: number;
  totalMarks: number;
  explanation?: string;
}

export interface ExamStats {
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averagePercentage: number;
  passRate: number;
  gradeDistribution: Record<string, number>;
}

export interface StudentStats {
  totalExams: number;
  averageScore: number;
  averagePercentage: number;
  totalTimeSpent: number;
  examsPassed: number;
  bestGrade: string | null;
  recentExams: Result[];
}
