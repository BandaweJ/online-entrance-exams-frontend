import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { StudentService } from '../../services/student.service';
import * as StudentActions from './student.actions';

@Injectable()
export class StudentEffects {
  private actions$ = inject(Actions);
  private studentService = inject(StudentService);

  loadStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentActions.loadStudents),
      switchMap(() =>
        this.studentService.getStudents().pipe(
          map(students => StudentActions.loadStudentsSuccess({ students })),
          catchError(error => of(StudentActions.loadStudentsFailure({ error: error.message })))
        )
      )
    )
  );

  createStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StudentActions.createStudent),
      switchMap(({ studentData }) =>
        this.studentService.createStudent(studentData).pipe(
          map(student => StudentActions.createStudentSuccess({ student })),
          catchError(error => of(StudentActions.createStudentFailure({ error: error.message })))
        )
      )
    )
  );
}