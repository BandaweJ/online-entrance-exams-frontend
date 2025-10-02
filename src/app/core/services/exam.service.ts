import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exam, CreateExamRequest } from '../../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.API_URL}/exams`);
  }

  getExam(id: string): Observable<Exam> {
    return this.http.get<Exam>(`${this.API_URL}/exams/${id}`);
  }

  createExam(examData: CreateExamRequest): Observable<Exam> {
    return this.http.post<Exam>(`${this.API_URL}/exams`, examData);
  }

  updateExam(id: string, examData: Partial<Exam>): Observable<Exam> {
    return this.http.patch<Exam>(`${this.API_URL}/exams/${id}`, examData);
  }

  deleteExam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/exams/${id}`);
  }

  getActiveExams(): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.API_URL}/exams/active`);
  }

  publishExam(id: string): Observable<Exam> {
    return this.http.patch<Exam>(`${this.API_URL}/exams/${id}/publish`, {});
  }

  closeExam(id: string): Observable<Exam> {
    return this.http.patch<Exam>(`${this.API_URL}/exams/${id}/close`, {});
  }

  getSections(examId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/exams/${examId}/sections`);
  }

  createSection(examId: string, section: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/exams/${examId}/sections`, section);
  }

  updateSection(examId: string, sectionId: string, section: any): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/exams/${examId}/sections/${sectionId}`, section);
  }

  deleteSection(examId: string, sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/exams/${examId}/sections/${sectionId}`);
  }

  getQuestions(sectionId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/sections/${sectionId}/questions`);
  }

  createQuestion(sectionId: string, question: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/sections/${sectionId}/questions`, question);
  }

  updateQuestion(sectionId: string, questionId: string, question: any): Observable<any> {
    return this.http.patch<any>(`${this.API_URL}/sections/${sectionId}/questions/${questionId}`, question);
  }

  deleteQuestion(sectionId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sections/${sectionId}/questions/${questionId}`);
  }

  duplicateQuestion(questionId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/questions/${questionId}/duplicate`, {});
  }
}