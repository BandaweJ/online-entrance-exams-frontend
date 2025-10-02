import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/users`, userData);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}`, userData);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}`, { isActive });
  }

  updateUserRole(id: string, role: string): Observable<any> {
    return this.http.patch(`${this.API_URL}/users/${id}/role`, { role });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/users/${id}`);
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/users/stats`);
  }
}

