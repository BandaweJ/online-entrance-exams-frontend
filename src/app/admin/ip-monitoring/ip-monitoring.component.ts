import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { IpMonitoringService, IpActivity, IpStats, SuspiciousIp, IpActivityFilter } from '../../core/services/ip-monitoring.service';
import { SchoolLogoComponent } from '../../shared/components/school-logo/school-logo.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-ip-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SchoolLogoComponent,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="ip-monitoring-container">
      <!-- Header -->
      <div class="header glassmorphism">
        <div class="header-content">
          <div class="logo-section">
            <app-school-logo size="small"></app-school-logo>
            <div class="title-section">
              <h1>IP Monitoring & Security</h1>
              <p>Monitor and manage IP addresses, detect suspicious activity</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card glassmorphism">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>security</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalActivities }}</h3>
                <p>Total Activities</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card glassmorphism">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ suspiciousActivities }}</h3>
                <p>Suspicious Activities</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card glassmorphism">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>block</mat-icon>
            </div>
            <div class="stat-info">
              <h3>{{ blockedIps }}</h3>
              <p>Blocked IPs</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card glassmorphism">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>public</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ uniqueIps }}</h3>
                <p>Unique IPs</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content -->
      <mat-tab-group class="main-tabs">
        <!-- Activities Tab -->
        <mat-tab label="Activities">
          <div class="tab-content">
            <!-- Filters -->
            <mat-card class="filters-card glassmorphism">
              <mat-card-content>
                <form [formGroup]="filterForm" class="filters-form">
                  <div class="filter-row">
                    <mat-form-field appearance="outline" class="filter-field">
                      <mat-label>IP Address</mat-label>
                      <input matInput formControlName="ipAddress" placeholder="Enter IP address">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="filter-field">
                      <mat-label>Action</mat-label>
                      <mat-select formControlName="action">
                        <mat-option value="">All Actions</mat-option>
                        <mat-option value="login">Login</mat-option>
                        <mat-option value="exam_start">Exam Start</mat-option>
                        <mat-option value="exam_submit">Exam Submit</mat-option>
                        <mat-option value="answer_submit">Answer Submit</mat-option>
                        <mat-option value="admin">Admin Actions</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="filter-field">
                      <mat-label>Status</mat-label>
                      <mat-select formControlName="status">
                        <mat-option value="">All Status</mat-option>
                        <mat-option value="suspicious">Suspicious</mat-option>
                        <mat-option value="blocked">Blocked</mat-option>
                        <mat-option value="normal">Normal</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <button mat-raised-button color="primary" (click)="applyFilters()">
                      <mat-icon>search</mat-icon>
                      Filter
                    </button>

                    <button mat-button (click)="clearFilters()">
                      <mat-icon>clear</mat-icon>
                      Clear
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>

            <!-- Activities Table -->
            <mat-card class="table-card glassmorphism">
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="dataSource" class="activities-table">
                    <!-- IP Address Column -->
                    <ng-container matColumnDef="ipAddress">
                      <th mat-header-cell *matHeaderCellDef>IP Address</th>
                      <td mat-cell *matCellDef="let activity">
                        <div class="ip-cell">
                          <span class="ip-address">{{ activity.ipAddress }}</span>
                          <div class="chip-container">
                            <mat-chip *ngIf="activity.isSuspicious" color="warn" selected>
                              Suspicious
                            </mat-chip>
                            <mat-chip *ngIf="activity.isBlocked" color="accent" selected>
                              Blocked
                            </mat-chip>
                          </div>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Action Column -->
                    <ng-container matColumnDef="action">
                      <th mat-header-cell *matHeaderCellDef>Action</th>
                      <td mat-cell *matCellDef="let activity">
                        <mat-chip [color]="getActionColor(activity.action)">
                          {{ activity.action }}
                        </mat-chip>
                      </td>
                    </ng-container>

                    <!-- Endpoint Column -->
                    <ng-container matColumnDef="endpoint">
                      <th mat-header-cell *matHeaderCellDef>Endpoint</th>
                      <td mat-cell *matCellDef="let activity">
                        <span class="endpoint">{{ activity.endpoint }}</span>
                      </td>
                    </ng-container>

                    <!-- Status Code Column -->
                    <ng-container matColumnDef="statusCode">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let activity">
                        <span [class]="getStatusCodeClass(activity.statusCode)">
                          {{ activity.statusCode }}
                        </span>
                      </td>
                    </ng-container>

                    <!-- Location Column -->
                    <ng-container matColumnDef="location">
                      <th mat-header-cell *matHeaderCellDef>Location</th>
                      <td mat-cell *matCellDef="let activity">
                        <div class="location">
                          <span>{{ activity.city }}, {{ activity.country }}</span>
                        </div>
                      </td>
                    </ng-container>

                    <!-- Timestamp Column -->
                    <ng-container matColumnDef="createdAt">
                      <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                      <td mat-cell *matCellDef="let activity">
                        {{ activity.createdAt | date:'short' }}
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let activity">
                        <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #actionMenu="matMenu">
                          <button mat-menu-item (click)="viewIpDetails(activity.ipAddress)">
                            <mat-icon>info</mat-icon>
                            View Details
                          </button>
                          <button mat-menu-item (click)="blockIp(activity.ipAddress)" 
                                  *ngIf="!activity.isBlocked">
                            <mat-icon>block</mat-icon>
                            Block IP
                          </button>
                          <button mat-menu-item (click)="unblockIp(activity.ipAddress)" 
                                  *ngIf="activity.isBlocked">
                            <mat-icon>check_circle</mat-icon>
                            Unblock IP
                          </button>
                        </mat-menu>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>

                  <!-- Pagination -->
                  <mat-paginator
                    [length]="totalActivities"
                    [pageSize]="pageSize"
                    [pageSizeOptions]="[10, 25, 50, 100]"
                    (page)="onPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Suspicious IPs Tab -->
        <mat-tab label="Suspicious IPs">
          <div class="tab-content">
            <mat-card class="table-card glassmorphism">
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="suspiciousIpsDataSource" class="suspicious-ips-table">
                    <!-- IP Address Column -->
                    <ng-container matColumnDef="ipAddress">
                      <th mat-header-cell *matHeaderCellDef>IP Address</th>
                      <td mat-cell *matCellDef="let ip">
                        <span class="ip-address">{{ ip.ipAddress }}</span>
                      </td>
                    </ng-container>

                    <!-- Total Requests Column -->
                    <ng-container matColumnDef="totalRequests">
                      <th mat-header-cell *matHeaderCellDef>Total Requests</th>
                      <td mat-cell *matCellDef="let ip">
                        {{ ip.total_requests }}
                      </td>
                    </ng-container>

                    <!-- Suspicious Requests Column -->
                    <ng-container matColumnDef="suspiciousRequests">
                      <th mat-header-cell *matHeaderCellDef>Suspicious Requests</th>
                      <td mat-cell *matCellDef="let ip">
                        <span class="suspicious-count">{{ ip.suspicious_requests }}</span>
                      </td>
                    </ng-container>

                    <!-- Last Activity Column -->
                    <ng-container matColumnDef="lastActivity">
                      <th mat-header-cell *matHeaderCellDef>Last Activity</th>
                      <td mat-cell *matCellDef="let ip">
                        {{ ip.last_activity | date:'short' }}
                      </td>
                    </ng-container>

                    <!-- Actions Column -->
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let ip">
                        <button mat-raised-button color="warn" (click)="blockIp(ip.ipAddress)">
                          <mat-icon>block</mat-icon>
                          Block IP
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="suspiciousIpsColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: suspiciousIpsColumns;"></tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner></mat-spinner>
      </div>
    </div>
  `,
  styles: [`
    .ip-monitoring-container {
      padding: 20px;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--anarchy-blue) 0%, var(--anarchy-gold) 100%);
    }

    .header {
      margin-bottom: 30px;
      border-radius: 16px;
      padding: 24px;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .title-section h1 {
      margin: 0;
      color: var(--anarchy-blue);
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      font-weight: 700;
    }

    .title-section p {
      margin: 8px 0 0 0;
      color: var(--anarchy-grey);
      font-size: 1.1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      border-radius: 12px;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--anarchy-blue), var(--anarchy-gold));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: var(--anarchy-blue);
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: var(--anarchy-grey);
      font-size: 0.9rem;
    }

    .main-tabs {
      background: transparent;
    }

    .tab-content {
      padding: 20px 0;
    }

    .filters-card {
      margin-bottom: 20px;
      border-radius: 12px;
    }

    .filters-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: end;
    }

    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: end;
      width: 100%;
    }

    .filter-field {
      flex: 1;
      min-width: 200px;
    }

    .table-card {
      border-radius: 12px;
    }

    .table-container {
      overflow-x: auto;
    }

    .activities-table, .suspicious-ips-table {
      width: 100%;
    }

    .ip-cell {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .ip-address {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: var(--anarchy-blue);
    }

    .chip-container {
      display: flex;
      gap: 4px;
      margin-top: 4px;
    }

    .endpoint {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: var(--anarchy-grey);
    }

    .location {
      font-size: 0.9rem;
      color: var(--anarchy-grey);
    }

    .suspicious-count {
      color: var(--anarchy-gold);
      font-weight: 600;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .ip-monitoring-container {
        padding: 10px;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .logo-section {
        flex-direction: column;
        gap: 10px;
      }

      .title-section h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 15px;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-field {
        min-width: unset;
      }

      .table-container {
        font-size: 0.8rem;
      }
    }
  `]
})
export class IpMonitoringComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  activities: IpActivity[] = [];
  suspiciousIps: SuspiciousIp[] = [];
  dataSource = new MatTableDataSource<IpActivity>();
  suspiciousIpsDataSource = new MatTableDataSource<SuspiciousIp>();

  // Display columns
  displayedColumns = ['ipAddress', 'action', 'endpoint', 'statusCode', 'location', 'createdAt', 'actions'];
  suspiciousIpsColumns = ['ipAddress', 'totalRequests', 'suspiciousRequests', 'lastActivity', 'actions'];

  // Stats
  totalActivities = 0;
  suspiciousActivities = 0;
  blockedIps = 0;
  uniqueIps = 0;

  // Filters
  filterForm: FormGroup;
  loading = false;

  // Pagination
  pageSize = 25;
  currentPage = 0;

  constructor(
    private ipMonitoringService: IpMonitoringService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      ipAddress: [''],
      action: [''],
      status: [''],
      startDate: [''],
      endDate: ['']
    });

    // Debounce filter changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadActivities();
    this.loadSuspiciousIps();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadActivities(): void {
    this.loading = true;
    const filter = this.getFilterParams();
    
    this.ipMonitoringService.getActivities(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.activities = response.activities;
          this.dataSource.data = this.activities;
          this.totalActivities = response.total;
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading activities:', error);
          this.snackBar.open('Error loading activities', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadSuspiciousIps(): void {
    this.ipMonitoringService.getSuspiciousIps(24)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (suspiciousIps) => {
          this.suspiciousIps = suspiciousIps;
          this.suspiciousIpsDataSource.data = this.suspiciousIps;
        },
        error: (error) => {
          console.error('Error loading suspicious IPs:', error);
        }
      });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadActivities();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadActivities();
  }

  getFilterParams(): IpActivityFilter {
    const formValue = this.filterForm.value;
    return {
      ipAddress: formValue.ipAddress || undefined,
      action: formValue.action || undefined,
      isSuspicious: formValue.status === 'suspicious' ? true : formValue.status === 'normal' ? false : undefined,
      isBlocked: formValue.status === 'blocked' ? true : undefined,
      startDate: formValue.startDate ? formValue.startDate.toISOString() : undefined,
      endDate: formValue.endDate ? formValue.endDate.toISOString() : undefined,
      page: this.currentPage + 1,
      limit: this.pageSize
    };
  }

  calculateStats(): void {
    this.suspiciousActivities = this.activities.filter(a => a.isSuspicious).length;
    this.blockedIps = this.activities.filter(a => a.isBlocked).length;
    this.uniqueIps = new Set(this.activities.map(a => a.ipAddress)).size;
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'login': 'primary',
      'exam_start': 'accent',
      'exam_submit': 'accent',
      'answer_submit': 'primary',
      'admin': 'warn',
      'view': 'basic'
    };
    return colorMap[action] || 'basic';
  }

  getStatusCodeClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 400 && statusCode < 500) return 'status-warning';
    if (statusCode >= 500) return 'status-error';
    return 'status-info';
  }

  viewIpDetails(ipAddress: string): void {
    // TODO: Implement IP details dialog
    this.snackBar.open(`Viewing details for IP: ${ipAddress}`, 'Close', { duration: 3000 });
  }

  blockIp(ipAddress: string): void {
    const reason = prompt('Enter reason for blocking this IP:');
    if (reason) {
      this.ipMonitoringService.blockIp({
        ipAddress,
        reason,
        blockType: 'manual'
      }).subscribe({
        next: () => {
          this.snackBar.open(`IP ${ipAddress} blocked successfully`, 'Close', { duration: 3000 });
          this.loadActivities();
        },
        error: (error) => {
          console.error('Error blocking IP:', error);
          this.snackBar.open('Error blocking IP', 'Close', { duration: 3000 });
        }
      });
    }
  }

  unblockIp(ipAddress: string): void {
    this.ipMonitoringService.unblockIp(ipAddress).subscribe({
      next: () => {
        this.snackBar.open(`IP ${ipAddress} unblocked successfully`, 'Close', { duration: 3000 });
        this.loadActivities();
      },
      error: (error) => {
        console.error('Error unblocking IP:', error);
        this.snackBar.open('Error unblocking IP', 'Close', { duration: 3000 });
      }
    });
  }
}
