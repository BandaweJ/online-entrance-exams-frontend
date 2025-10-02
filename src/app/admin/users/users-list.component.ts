import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from '../../core/store/app.reducer';
import { User } from '../../models/user.model';
import { UserService } from '../../core/services/user.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users-list',
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
    MatSelectModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <h1>User Management</h1>
        <p>Manage admin users and their permissions</p>
      </div>

      <mat-card class="users-card">
        <mat-card-header>
          <mat-card-title>Admin Users</mat-card-title>
          <mat-card-subtitle>Manage system administrators</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="table-controls">
            <div class="search-controls">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search users</mat-label>
                <input matInput [value]="searchTerm" (input)="onSearchChange($event)" placeholder="Search by name or email">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="filter-field">
                <mat-label>Filter by role</mat-label>
                <mat-select [value]="selectedRole" (selectionChange)="onRoleChange($event)">
                  <mat-option value="">All Roles</mat-option>
                  <mat-option value="admin">Admin</mat-option>
                  <mat-option value="student">Student</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <button mat-raised-button color="primary" (click)="createUser()">
              <mat-icon>person_add</mat-icon>
              Add User
            </button>
          </div>

          <div *ngIf="isLoading; else usersTable" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading users...</p>
          </div>

          <ng-template #usersTable>
            <div class="table-container">
              <table mat-table [dataSource]="filteredUsers" class="users-table">
                <!-- Name Column -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let user">
                    <div class="user-info">
                      <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                      <div class="user-email">{{ user.email }}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Role Column -->
                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Role</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="'role-chip ' + user.role">
                      {{ user.role | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [class]="'status-chip ' + (user.isActive ? 'active' : 'inactive')">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </mat-chip>
                  </td>
                </ng-container>

                <!-- Created Date Column -->
                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let user">
                    {{ user.createdAt | date:'short' }}
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button [matMenuTriggerFor]="userMenu" [matMenuTriggerData]="{user: user}">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <div *ngIf="filteredUsers.length === 0" class="no-data">
                <mat-icon>people_outline</mat-icon>
                <p>No users found</p>
              </div>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- User Actions Menu -->
    <mat-menu #userMenu="matMenu">
      <ng-template matMenuContent let-user="user">
        <button mat-menu-item (click)="viewUser(user)">
          <mat-icon>visibility</mat-icon>
          <span>View Details</span>
        </button>
        <button mat-menu-item (click)="editUser(user)">
          <mat-icon>edit</mat-icon>
          <span>Edit User</span>
        </button>
        <button mat-menu-item (click)="toggleUserStatus(user)" *ngIf="user.id !== currentUserId">
          <mat-icon>{{ user.isActive ? 'block' : 'check_circle' }}</mat-icon>
          <span>{{ user.isActive ? 'Deactivate' : 'Activate' }}</span>
        </button>
        <button mat-menu-item (click)="changeUserRole(user)" *ngIf="user.id !== currentUserId">
          <mat-icon>swap_horiz</mat-icon>
          <span>Change Role</span>
        </button>
        <button mat-menu-item (click)="deleteUser(user)" *ngIf="user.id !== currentUserId" class="delete-action">
          <mat-icon>delete</mat-icon>
          <span>Delete User</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [`
    .users-container {
      padding: 20px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 28px;
      font-weight: 500;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .users-card {
      width: 100%;
    }

    .table-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .search-controls {
      display: flex;
      gap: 16px;
      flex: 1;
    }

    .search-field, .filter-field {
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-email {
      font-size: 14px;
      color: #666;
    }

    .role-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .role-chip.admin {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .role-chip.student {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-chip {
      font-size: 12px;
      font-weight: 500;
    }

    .status-chip.active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-chip.inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
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

    .delete-action {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .search-controls {
        flex-direction: column;
      }

      .search-field, .filter-field {
        min-width: unset;
      }
    }
  `]
})
export class UsersListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedColumns: string[] = ['name', 'role', 'status', 'createdAt', 'actions'];
  isLoading = false;
  searchTerm = '';
  selectedRole = '';
  currentUserId: string | null = null;
  private subscription = new Subscription();

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.loadUsers();
    
    // Get current user ID
    this.subscription.add(
      this.store.select(state => state.auth.user).subscribe(user => {
        this.currentUserId = user?.id || null;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load users', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  onRoleChange(event: any) {
    this.selectedRole = event.value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = !this.selectedRole || user.role === this.selectedRole;
      
      return matchesSearch && matchesRole;
    });
  }

  createUser() {
    this.router.navigate(['/admin/users/create']);
  }

  viewUser(user: User) {
    // Implement view user details
  }

  editUser(user: User) {
    // Implement edit user
  }

  toggleUserStatus(user: User) {
    const action = user.isActive ? 'deactivate' : 'activate';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUserStatus(user.id, !user.isActive).subscribe({
          next: () => {
            user.isActive = !user.isActive;
            this.snackBar.open(`User ${action}d successfully`, 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.snackBar.open(`Failed to ${action} user`, 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  changeUserRole(user: User) {
    // Implement change user role
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.snackBar.open('User deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.snackBar.open('Failed to delete user', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}
