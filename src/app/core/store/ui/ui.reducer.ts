import { createReducer, on } from '@ngrx/store';

export interface UIState {
  sidebarOpen: boolean;
  loading: boolean;
  theme: 'light' | 'dark';
}

export const initialState: UIState = {
  sidebarOpen: true,
  loading: false,
  theme: 'light',
};

export const uiReducer = createReducer(initialState);
