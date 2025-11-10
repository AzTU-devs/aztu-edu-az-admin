import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  name: string | null;
  surname: string | null;
  father_name: string | null;
  fin_kod: string | null;
  role: number | null;
  email: string | null;
  birth_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  token: string | null;
}

const initialState: AuthState = {
  name: null,
  surname: null,
  father_name: null,
  fin_kod: null,
  role: null,
  email: null,
  birth_date: null,
  created_at: null,
  updated_at: null,
  token: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state: AuthState,
      action: PayloadAction<{
        token: string;
        user?: {
          name?: string;
          surname?: string;
          father_name?: string;
          fin_kod?: string;
          role?: number;
          email?: string;
          birth_date?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      }>
    ) => {
      const user = action.payload.user || {};
      state.name = user.name || null;
      state.surname = user.surname || null;
      state.father_name = user.father_name || null;
      state.fin_kod = user.fin_kod || null;
      state.email = user.email || null;
      state.role = user.role || null;
      state.token = action.payload.token || null;
      state.birth_date = user.birth_date || null;
      state.created_at = user.created_at || null;
      state.updated_at = user.updated_at || null;
    },
    logout: () => initialState,
    clearLoginSteps: (state: AuthState) => {
      state.fin_kod = null;
      state.name = null;
      state.surname = null;
      state.father_name = null;
      state.role = null;
      state.token = null;
      state.role = null;
      state.email = null;
      state.created_at = null;
      state.updated_at = null;
    },
  },
});

export const {
  loginSuccess,
  clearLoginSteps,
  logout
} = authSlice.actions;
export default authSlice.reducer;