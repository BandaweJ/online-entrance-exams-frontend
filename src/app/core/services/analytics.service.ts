import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PerformanceTrends {
  period: string;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  totalAttempts: number;
  completionRate: number;
}

export interface StudentPerformanceMetrics {
  studentId: string;
  studentName: string;
  totalExams: number;
  averageScore: number;
  averagePercentage: number;
  bestGrade: string;
  improvementTrend: 'improving' | 'declining' | 'stable';
  lastExamDate: string;
  totalTimeSpent: number;
}

export interface ExamAnalytics {
  examId: string;
  examTitle: string;
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  completionRate: number;
  averageTimeSpent: number;
  gradeDistribution: Record<string, number>;
  difficultyAnalysis: {
    easyQuestions: number;
    mediumQuestions: number;
    hardQuestions: number;
  };
  questionPerformance: Array<{
    questionId: string;
    questionText: string;
    correctAnswers: number;
    totalAttempts: number;
    accuracyRate: number;
    averageTimeSpent: number;
  }>;
}

export interface TimeBasedAnalytics {
  hourly: Array<{ hour: number; attempts: number; averageScore: number }>;
  daily: Array<{ date: string; attempts: number; averageScore: number }>;
  weekly: Array<{ week: string; attempts: number; averageScore: number }>;
  monthly: Array<{ month: string; attempts: number; averageScore: number }>;
}

export interface SubjectPerformance {
  subject: string;
  totalQuestions: number;
  averageAccuracy: number;
  totalAttempts: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface DashboardSummary {
  performanceTrends: PerformanceTrends[];
  topStudents: StudentPerformanceMetrics[];
  recentActivity: Array<{ date: string; attempts: number; averageScore: number }>;
  subjectPerformance: SubjectPerformance[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/api/analytics`;

  constructor(private http: HttpClient) {}

  getPerformanceTrends(
    period: 'week' | 'month' | 'quarter' | 'year' = 'month',
    examId?: string
  ): Observable<PerformanceTrends[]> {
    let params = new HttpParams().set('period', period);
    if (examId) {
      params = params.set('examId', examId);
    }
    return this.http.get<PerformanceTrends[]>(`${this.apiUrl}/performance-trends`, { params });
  }

  getStudentPerformance(
    limit: number = 50,
    sortBy: 'averageScore' | 'improvement' | 'totalExams' = 'averageScore'
  ): Observable<StudentPerformanceMetrics[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('sortBy', sortBy);
    return this.http.get<StudentPerformanceMetrics[]>(`${this.apiUrl}/student-performance`, { params });
  }

  getExamAnalytics(examId: string): Observable<ExamAnalytics> {
    return this.http.get<ExamAnalytics>(`${this.apiUrl}/exam-analytics/${examId}`);
  }

  getTimeBasedAnalytics(
    period: 'day' | 'week' | 'month' = 'week',
    examId?: string
  ): Observable<TimeBasedAnalytics> {
    let params = new HttpParams().set('period', period);
    if (examId) {
      params = params.set('examId', examId);
    }
    return this.http.get<TimeBasedAnalytics>(`${this.apiUrl}/time-based`, { params });
  }

  getSubjectPerformance(): Observable<SubjectPerformance[]> {
    return this.http.get<SubjectPerformance[]>(`${this.apiUrl}/subject-performance`);
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard-summary`);
  }

  exportData(
    type: 'performance' | 'students' | 'exams' | 'time-based',
    format: 'csv' | 'json' = 'json',
    filters?: {
      period?: string;
      examId?: string;
      limit?: number;
      sortBy?: string;
    }
  ): Observable<any> {
    let params = new HttpParams()
      .set('format', format);
    
    if (filters) {
      if (filters.period) params = params.set('period', filters.period);
      if (filters.examId) params = params.set('examId', filters.examId);
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sortBy) params = params.set('sortBy', filters.sortBy);
    }

    return this.http.get(`${this.apiUrl}/export/${type}`, { 
      params,
      responseType: format === 'csv' ? 'text' : 'json'
    });
  }
}
