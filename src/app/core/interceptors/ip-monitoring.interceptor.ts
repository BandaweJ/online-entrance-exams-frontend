import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IpMonitoringService } from '../services/ip-monitoring.service';

@Injectable()
export class IpMonitoringInterceptor implements HttpInterceptor {
  constructor(private ipMonitoringService: IpMonitoringService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip logging for certain requests
    if (this.shouldSkipLogging(req)) {
      return next.handle(req);
    }

    const startTime = Date.now();
    
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          this.logActivity(req, event, duration);
        }
      })
    );
  }

  private shouldSkipLogging(req: HttpRequest<any>): boolean {
    const url = req.url;
    
    // Skip logging for:
    // - Static assets
    // - Health checks
    // - IP monitoring endpoints (to avoid infinite loops)
    return (
      url.includes('.css') ||
      url.includes('.js') ||
      url.includes('.png') ||
      url.includes('.jpg') ||
      url.includes('.svg') ||
      url.includes('.ico') ||
      url.includes('/health') ||
      url.includes('/ip-monitoring/log-activity')
    );
  }

  private logActivity(req: HttpRequest<any>, res: HttpResponse<any>, duration: number): void {
    try {
      const action = this.determineAction(req);
      const metadata = {
        duration,
        statusCode: res.status,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
      };

      this.ipMonitoringService.logCurrentUserActivity(action, metadata);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  private determineAction(req: HttpRequest<any>): string {
    const url = req.url;
    const method = req.method;

    // Authentication actions
    if (url.includes('/auth/login')) return 'login';
    if (url.includes('/auth/logout')) return 'logout';
    if (url.includes('/auth/refresh')) return 'token_refresh';

    // Exam actions
    if (url.includes('/attempts') && method === 'POST') return 'exam_start';
    if (url.includes('/attempts') && method === 'PATCH') {
      if (url.includes('/submit')) return 'exam_submit';
      if (url.includes('/pause')) return 'exam_pause';
      if (url.includes('/resume')) return 'exam_resume';
      return 'exam_update';
    }

    // Answer actions
    if (url.includes('/answers') && method === 'POST') return 'answer_submit';
    if (url.includes('/answers') && method === 'PATCH') return 'answer_update';

    // Admin actions
    if (url.includes('/admin/') && method === 'GET') return 'admin_view';
    if (url.includes('/admin/') && method === 'POST') return 'admin_create';
    if (url.includes('/admin/') && method === 'PATCH') return 'admin_update';
    if (url.includes('/admin/') && method === 'DELETE') return 'admin_delete';

    // Student actions
    if (url.includes('/students') && method === 'GET') return 'student_view';
    if (url.includes('/students') && method === 'POST') return 'student_create';
    if (url.includes('/students') && method === 'PATCH') return 'student_update';

    // Results actions
    if (url.includes('/results') && method === 'GET') return 'results_view';
    if (url.includes('/results') && method === 'POST') return 'results_generate';

    // Default action based on method
    switch (method) {
      case 'GET': return 'view';
      case 'POST': return 'create';
      case 'PATCH': return 'update';
      case 'DELETE': return 'delete';
      default: return 'unknown';
    }
  }
}






