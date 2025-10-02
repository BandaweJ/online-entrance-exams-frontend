import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Result } from '../../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getResults(): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.API_URL}/results`);
  }

  getResult(id: string): Observable<Result> {
    return this.http.get<Result>(`${this.API_URL}/results/${id}`);
  }

  getStudentResults(): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.API_URL}/results/student`);
  }

  getExamResults(examId: string): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.API_URL}/results/exam/${examId}`);
  }

  getExamStats(examId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/results/exam/${examId}/stats`);
  }

  publishResult(id: string): Observable<Result> {
    return this.http.patch<Result>(`${this.API_URL}/results/${id}/publish`, {});
  }

  generateResult(attemptId: string): Observable<Result> {
    return this.http.post<Result>(`${this.API_URL}/results/generate/${attemptId}`, {});
  }
}