import { createReducer, on } from '@ngrx/store';
import { toggleTheme, setTheme } from './ui.actions';

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

export const uiReducer = createReducer(
  initialState,
  on(toggleTheme, (state) => ({
    ...state,
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  on(setTheme, (state, { theme }) => ({
    ...state,
    theme
  }))
);
