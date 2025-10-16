import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.reducer';

export const selectUIState = createFeatureSelector<UIState>('ui');

export const selectTheme = createSelector(
  selectUIState,
  (state) => state.theme
);

export const selectSidebarOpen = createSelector(
  selectUIState,
  (state) => state.sidebarOpen
);

export const selectLoading = createSelector(
  selectUIState,
  (state) => state.loading
);
