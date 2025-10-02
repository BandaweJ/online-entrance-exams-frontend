import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer } from '../../models/answer.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnswersService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAnswersByAttempt(attemptId: string): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.API_URL}/answers/attempt/${attemptId}`);
  }

  getAnswer(id: string): Observable<Answer> {
    return this.http.get<Answer>(`${this.API_URL}/answers/${id}`);
  }

  createAnswer(answerData: CreateAnswerRequest): Observable<Answer> {
    return this.http.post<Answer>(`${this.API_URL}/answers`, answerData);
  }

  updateAnswer(id: string, answerData: UpdateAnswerRequest): Observable<Answer> {
    return this.http.patch<Answer>(`${this.API_URL}/answers/${id}`, answerData);
  }

  deleteAnswer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/answers/${id}`);
  }

  getAnswerByQuestion(questionId: string, attemptId: string): Observable<Answer | null> {
    return this.http.get<Answer | null>(`${this.API_URL}/answers/question/${questionId}/attempt/${attemptId}`);
  }

  getUnansweredQuestions(attemptId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/answers/attempt/${attemptId}/unanswered`);
  }

  getAnswerStats(attemptId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/answers/attempt/${attemptId}/stats`);
  }
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
