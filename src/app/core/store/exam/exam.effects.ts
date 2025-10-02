import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ExamService } from '../../services/exam.service';
import * as ExamActions from './exam.actions';

@Injectable()
export class ExamEffects {
  private actions$ = inject(Actions);
  private examService = inject(ExamService);

  loadExams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.loadExams),
      switchMap(() =>
        this.examService.getExams().pipe(
          map(exams => ExamActions.loadExamsSuccess({ exams })),
          catchError(error => of(ExamActions.loadExamsFailure({ error: error.message })))
        )
      )
    )
  );

  createExam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExamActions.createExam),
      switchMap(({ examData }) =>
        this.examService.createExam(examData).pipe(
          map(exam => ExamActions.createExamSuccess({ exam })),
          catchError(error => of(ExamActions.createExamFailure({ error: error.message })))
        )
      )
    )
  );
}