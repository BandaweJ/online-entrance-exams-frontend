import { createAction } from '@ngrx/store';

export const toggleTheme = createAction('[UI] Toggle Theme');
export const setTheme = createAction('[UI] Set Theme', (theme: 'light' | 'dark') => ({ theme }));
