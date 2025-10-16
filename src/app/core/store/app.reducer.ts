import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { examReducer, ExamState } from './exam/exam.reducer';
import { uiReducer, UIState } from './ui/ui.reducer';

export interface AppState {
  auth: AuthState;
  exam: ExamState;
  ui: UIState;
}

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  exam: examReducer,
  ui: uiReducer,
};