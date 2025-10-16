import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IpActivity {
  id: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  endpoint: string;
  method: string;
  statusCode: number;
  userId?: string;
  examId?: string;
  metadata?: any;
  isSuspicious: boolean;
  isBlocked: boolean;
  blockReason?: string;
  country: string;
  city: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IpStats {
  total_requests: number;
  suspicious_requests: number;
  login_attempts: number;
  exam_attempts: number;
  unique_users: number;
  unique_exams: number;
}

export interface SuspiciousIp {
  ipAddress: string;
  total_requests: number;
  suspicious_requests: number;
  last_activity: Date;
}

export interface IpActivityFilter {
  ipAddress?: string;
  action?: string;
  isSuspicious?: boolean;
  isBlocked?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BlockIpRequest {
  ipAddress: string;
  reason: string;
  expiresAt?: string;
  blockType?: string;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IpMonitoringService {
  private readonly apiUrl = `${environment.apiUrl}/ip-monitoring`;

  constructor(private http: HttpClient) {}

  logActivity(activity: Partial<IpActivity>): Observable<IpActivity> {
    return this.http.post<IpActivity>(`${this.apiUrl}/log-activity`, activity);
  }

  getActivities(filter: IpActivityFilter = {}): Observable<{
    activities: IpActivity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Filter out undefined values to prevent them from being sent as "undefined" strings
    const cleanFilter = Object.fromEntries(
      Object.entries(filter).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    );
    
    return this.http.get<{
      activities: IpActivity[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.apiUrl}/activities`, { params: cleanFilter as any });
  }

  getIpStats(ipAddress: string, hours: number = 24): Observable<IpStats> {
    return this.http.get<IpStats>(`${this.apiUrl}/ip-stats/${ipAddress}`, {
      params: { hours: hours.toString() }
    });
  }

  getSuspiciousIps(hours: number = 24): Observable<SuspiciousIp[]> {
    return this.http.get<SuspiciousIp[]>(`${this.apiUrl}/suspicious-ips`, {
      params: { hours: hours.toString() }
    });
  }

  blockIp(blockRequest: BlockIpRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/block-ip`, blockRequest);
  }

  unblockIp(ipAddress: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/unblock-ip/${ipAddress}`, {});
  }

  isIpBlocked(ipAddress: string): Observable<{ ipAddress: string; isBlocked: boolean }> {
    return this.http.get<{ ipAddress: string; isBlocked: boolean }>(`${this.apiUrl}/is-blocked/${ipAddress}`);
  }

  // Helper method to get current user's IP (simplified)
  getCurrentUserIp(): string {
    // In a real application, you might get this from a service or API
    return 'unknown';
  }

  // Helper method to log current user activity
  logCurrentUserActivity(action: string, metadata?: any): void {
    const activity = {
      ipAddress: this.getCurrentUserIp(),
      userAgent: navigator.userAgent,
      action,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
      }
    };

    this.logActivity(activity).subscribe({
      next: () => console.log('Activity logged successfully'),
      error: (error) => console.error('Failed to log activity:', error)
    });
  }
}

