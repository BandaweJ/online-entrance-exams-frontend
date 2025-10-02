import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamAttempt, CreateAttemptRequest, UpdateAttemptRequest } from '../../models/attempt.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttemptsService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAttempts(): Observable<ExamAttempt[]> {
    return this.http.get<ExamAttempt[]>(`${this.API_URL}/attempts`);
  }

  getAttempt(id: string): Observable<ExamAttempt> {
    return this.http.get<ExamAttempt>(`${this.API_URL}/attempts/${id}`);
  }

  getCurrentAttempt(examId: string): Observable<ExamAttempt | null> {
    return this.http.get<ExamAttempt | null>(`${this.API_URL}/attempts/current/${examId}`);
  }

  createAttempt(attemptData: CreateAttemptRequest): Observable<ExamAttempt> {
    return this.http.post<ExamAttempt>(`${this.API_URL}/attempts`, attemptData);
  }

  updateAttempt(id: string, attemptData: UpdateAttemptRequest): Observable<ExamAttempt> {
    return this.http.patch<ExamAttempt>(`${this.API_URL}/attempts/${id}`, attemptData);
  }

  pauseAttempt(id: string): Observable<ExamAttempt> {
    return this.http.patch<ExamAttempt>(`${this.API_URL}/attempts/${id}/pause`, {});
  }

  resumeAttempt(id: string): Observable<ExamAttempt> {
    return this.http.patch<ExamAttempt>(`${this.API_URL}/attempts/${id}/resume`, {});
  }

  submitAttempt(id: string): Observable<ExamAttempt> {
    return this.http.patch<ExamAttempt>(`${this.API_URL}/attempts/${id}/submit`, {});
  }

  deleteAttempt(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/attempts/${id}`);
  }
}
