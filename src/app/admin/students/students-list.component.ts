import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Student, StudentStats } from '../../models/student.model';
import { StudentService } from '../../core/services/student.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StudentDetailDialogComponent } from '../../shared/components/student-detail-dialog/student-detail-dialog.component';
import { StudentEditDialogComponent } from '../../shared/components/student-edit-dialog/student-edit-dialog.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ],
  template: `
    <div class="students-container">
      <div class="students-header">
        <h1>Student Management</h1>
        <button mat-raised-button color="primary" routerLink="/admin/students/create">
          <mat-icon>person_add</mat-icon>
          Add Student
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">people</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.totalStudents }}</h3>
                <p>Total Students</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.activeStudents }}</h3>
                <p>Active Students</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">email</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.credentialsSent }}</h3>
                <p>Credentials Sent</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">schedule</mat-icon>
              <div class="stat-info">
                <h3>{{ stats.credentialsPending }}</h3>
                <p>Pending</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <div class="table-header">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search students</mat-label>
              <input matInput (input)="filterStudents($event)" placeholder="Search by name, email, or student ID">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <!-- Desktop Table View -->
          <div class="table-container tablet-up">
            <table mat-table [dataSource]="filteredStudents" class="students-table">
              <!-- Student ID Column -->
              <ng-container matColumnDef="studentId">
                <th mat-header-cell *matHeaderCellDef>Student ID</th>
                <td mat-cell *matCellDef="let student">{{ student.studentId }}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let student">
                  <div class="student-name">
                    <h4>{{ student.firstName }} {{ student.lastName }}</h4>
                    <p class="student-email">{{ student.email }}</p>
                  </div>
                </td>
              </ng-container>

              <!-- School Column -->
              <ng-container matColumnDef="school">
                <th mat-header-cell *matHeaderCellDef>School</th>
                <td mat-cell *matCellDef="let student">
                  <div class="student-school">
                    <p>{{ student.school || 'Not specified' }}</p>
                    <span class="student-grade">{{ student.grade || 'N/A' }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let student">
                  {{ student.phone || 'Not provided' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let student">
                  <div class="status-chips">
                    <mat-chip [class]="student.isActive ? 'status-active' : 'status-inactive'">
                      {{ student.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                    <mat-chip [class]="student.credentialsSent ? 'status-sent' : 'status-pending'">
                      {{ student.credentialsSent ? 'Credentials Sent' : 'Pending' }}
                    </mat-chip>
                  </div>
                </td>
              </ng-container>

              <!-- Created Column -->
              <ng-container matColumnDef="created">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let student">
                  {{ student.createdAt | date:'short' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let student">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="viewStudent(student.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editStudent(student.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="resendCredentials(student)" *ngIf="!student.credentialsSent">
                      <mat-icon>email</mat-icon>
                      Send Credentials
                    </button>
                    <button mat-menu-item (click)="resendCredentials(student)" *ngIf="student.credentialsSent">
                      <mat-icon>refresh</mat-icon>
                      Resend Credentials
                    </button>
                    <button mat-menu-item (click)="toggleStudentStatus(student)">
                      <mat-icon>{{ student.isActive ? 'block' : 'check_circle' }}</mat-icon>
                      {{ student.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button mat-menu-item (click)="deleteStudent(student)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-students-list mobile-only" *ngIf="filteredStudents.length > 0">
            <mat-card *ngFor="let student of filteredStudents" class="student-card">
              <mat-card-content>
                <div class="student-card-header">
                  <div class="student-info">
                    <h3>{{ student.firstName }} {{ student.lastName }}</h3>
                    <p class="student-email">{{ student.email }}</p>
                    <p class="student-id">ID: {{ student.studentId }}</p>
                  </div>
                  <button mat-icon-button [matMenuTriggerFor]="mobileMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #mobileMenu="matMenu">
                    <button mat-menu-item (click)="viewStudent(student.id)">
                      <mat-icon>visibility</mat-icon>
                      View
                    </button>
                    <button mat-menu-item (click)="editStudent(student.id)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="resendCredentials(student)" *ngIf="!student.credentialsSent">
                      <mat-icon>email</mat-icon>
                      Send Credentials
                    </button>
                    <button mat-menu-item (click)="resendCredentials(student)" *ngIf="student.credentialsSent">
                      <mat-icon>refresh</mat-icon>
                      Resend Credentials
                    </button>
                    <button mat-menu-item (click)="toggleStudentStatus(student)">
                      <mat-icon>{{ student.isActive ? 'block' : 'check_circle' }}</mat-icon>
                      {{ student.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button mat-menu-item (click)="deleteStudent(student)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </div>
                
                <div class="student-details">
                  <div class="detail-row">
                    <span class="detail-label">School:</span>
                    <span>{{ student.school || 'Not specified' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Grade:</span>
                    <span>{{ student.grade || 'N/A' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span>{{ student.phone || 'Not provided' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <div class="status-chips">
                      <mat-chip [class]="student.isActive ? 'status-active' : 'status-inactive'">
                        {{ student.isActive ? 'Active' : 'Inactive' }}
                      </mat-chip>
                      <mat-chip [class]="student.credentialsSent ? 'status-sent' : 'status-pending'">
                        {{ student.credentialsSent ? 'Sent' : 'Pending' }}
                      </mat-chip>
                    </div>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Created:</span>
                    <span>{{ student.createdAt | date:'short' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="no-data" *ngIf="filteredStudents.length === 0 && !isLoading">
            <mat-icon>people</mat-icon>
            <h3>No students found</h3>
            <p>Add your first student to get started</p>
            <button mat-raised-button color="primary" routerLink="/admin/students/create">
              <mat-icon>person_add</mat-icon>
              Add Student
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Loading students...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .students-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .students-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .students-header h1 {
      margin: 0;
      color: #1976d2;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .table-header {
      margin-bottom: 20px;
    }

    .search-field {
      width: 300px;
    }

    .table-container {
      overflow-x: auto;
    }

    .students-table {
      width: 100%;
    }

    .student-name h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .student-email {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .student-school p {
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .student-grade {
      font-size: 12px;
      color: #666;
      background-color: #f5f5f5;
      padding: 2px 8px;
      border-radius: 12px;
    }

    .status-chips {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #f44336;
    }

    .status-sent {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .delete-action {
      color: #f44336;
    }

    .no-data {
      text-align: center;
      padding: 40px;
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-data p {
      margin: 0 0 24px 0;
      color: #999;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    /* Mobile-specific styles */
    .mobile-students-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .student-card {
      margin: 0;
    }

    .student-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .student-card-header .student-info h3 {
      margin: 0 0 4px 0;
      font-size: 1.125rem;
      font-weight: 500;
      color: #1976d2;
    }

    .student-card-header .student-info .student-email {
      margin: 0 0 2px 0;
      color: #666;
      font-size: 0.875rem;
    }

    .student-card-header .student-info .student-id {
      margin: 0;
      color: #999;
      font-size: 0.75rem;
    }

    .student-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
      font-size: 0.875rem;
    }

    .detail-row span:last-child {
      color: #333;
      font-size: 0.875rem;
    }

    .detail-row .status-chips {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Mobile header adjustments */
    @media (max-width: 768px) {
      .students-container {
        padding: 16px;
      }

      .students-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        margin-bottom: 20px;
      }

      .students-header h1 {
        font-size: 1.5rem;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }

      .stat-card {
        padding: 12px;
      }

      .stat-content {
        gap: 12px;
      }

      .stat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-info h3 {
        font-size: 18px;
      }

      .stat-info p {
        font-size: 12px;
      }

      .search-field {
        width: 100%;
      }
    }

    /* Small mobile devices */
    @media (max-width: 480px) {
      .students-container {
        padding: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .student-card-header .student-info h3 {
        font-size: 1rem;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }

      .detail-label {
        font-size: 0.75rem;
      }

      .detail-row span:last-child {
        font-size: 0.875rem;
      }
    }
  `]
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  stats: StudentStats | null = null;
  displayedColumns: string[] = ['studentId', 'name', 'school', 'phone', 'status', 'created', 'actions'];
  isLoading = false;

  constructor(
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudents();
    this.loadStats();
  }

  private loadStudents() {
    this.isLoading = true;
    this.studentService.getStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = [...students];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Error loading students', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadStats() {
    this.studentService.getStudentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  filterStudents(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      student.email.toLowerCase().includes(searchTerm) ||
      student.studentId.toLowerCase().includes(searchTerm)
    );
  }

  viewStudent(id: string) {
    const student = this.students.find(s => s.id === id);
    if (student) {
      this.dialog.open(StudentDetailDialogComponent, {
        data: { student },
        width: '600px'
      });
    }
  }

  editStudent(id: string) {
    const student = this.students.find(s => s.id === id);
    if (student) {
      this.dialog.open(StudentEditDialogComponent, {
        data: { student },
        width: '600px'
      }).afterClosed().subscribe(result => {
        if (result) {
          this.studentService.updateStudent(id, result).subscribe({
            next: (updatedStudent) => {
              const index = this.students.findIndex(s => s.id === id);
              if (index !== -1) {
                this.students[index] = updatedStudent;
                this.filteredStudents = [...this.students];
              }
              this.snackBar.open('Student updated successfully', 'Close', { duration: 3000 });
            },
            error: (error) => {
              console.error('Error updating student:', error);
              this.snackBar.open('Error updating student', 'Close', { duration: 3000 });
            }
          });
        }
      });
    }
  }

  resendCredentials(student: Student) {
    this.studentService.resendCredentials(student.id).subscribe({
      next: () => {
        student.credentialsSent = true;
        this.snackBar.open('Credentials sent successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error sending credentials:', error);
        this.snackBar.open('Error sending credentials', 'Close', { duration: 3000 });
      }
    });
  }

  toggleStudentStatus(student: Student) {
    const newStatus = !student.isActive;
    this.studentService.updateStudent(student.id, { isActive: newStatus }).subscribe({
      next: () => {
        student.isActive = newStatus;
        this.snackBar.open(`Student ${newStatus ? 'activated' : 'deactivated'} successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error updating student status:', error);
        this.snackBar.open('Error updating student status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteStudent(student: Student) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Student',
        message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.studentService.deleteStudent(student.id).subscribe({
          next: () => {
            this.students = this.students.filter(s => s.id !== student.id);
            this.filteredStudents = this.filteredStudents.filter(s => s.id !== student.id);
            this.snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error deleting student:', error);
            this.snackBar.open('Error deleting student', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
