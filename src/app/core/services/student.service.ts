import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudentRequest } from '../../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.API_URL}/students`);
  }

  getStudent(id: string): Observable<Student> {
    return this.http.get<Student>(`${this.API_URL}/students/${id}`);
  }

  createStudent(studentData: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(`${this.API_URL}/students`, studentData);
  }

  updateStudent(id: string, studentData: Partial<Student>): Observable<Student> {
    return this.http.patch<Student>(`${this.API_URL}/students/${id}`, studentData);
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/students/${id}`);
  }

  getStudentStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/students/stats`);
  }

  resendCredentials(id: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/students/${id}/resend-credentials`, {});
  }
}