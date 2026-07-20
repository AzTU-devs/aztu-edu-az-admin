import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { EnforcementMode, MeData, RoleRef } from '../../types/rbac';

interface AuthUser {
  name?: string;
  surname?: string;
  father_name?: string;
  fin_kod?: string;
  email?: string;
  birth_date?: string;
  created_at?: string;
  updated_at?: string | null;
}

interface AuthState {
  name: string | null;
  surname: string | null;
  father_name: string | null;
  fin_kod: string | null;
  email: string | null;
  birth_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  token: string | null;
  user_id: number | null;
  username: string | null;
  role: RoleRef | null;
  permissions: string[];
  is_super_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
  enforcement_mode: EnforcementMode;
}

const initialState: AuthState = {
  name: null,
  surname: null,
  father_name: null,
  fin_kod: null,
  email: null,
  birth_date: null,
  created_at: null,
  updated_at: null,
  token: null,
  user_id: null,
  username: null,
  role: null,
  permissions: [],
  is_super_admin: false,
  is_active: false,
  last_login_at: null,
  // Fail safe: assume the permissive mode until /me says otherwise, so a session
  // that never reached /me cannot bounce an admin off every screen.
  enforcement_mode: 'audit',
};

/**
 * Copies only the keys the caller actually supplied. `loginSuccess({ token })`
 * used to null every other field, which would have wiped the session the first
 * time a token refresh landed.
 */
const mergeUser = (state: AuthState, user: AuthUser | undefined) => {
  if (!user) return;
  if (user.name !== undefined) state.name = user.name;
  if (user.surname !== undefined) state.surname = user.surname;
  if (user.father_name !== undefined) state.father_name = user.father_name;
  if (user.fin_kod !== undefined) state.fin_kod = user.fin_kod;
  if (user.email !== undefined) state.email = user.email;
  if (user.birth_date !== undefined) state.birth_date = user.birth_date;
  if (user.created_at !== undefined) state.created_at = user.created_at;
  if (user.updated_at !== undefined) state.updated_at = user.updated_at;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (
      state: AuthState,
      action: PayloadAction<{ token?: string; user?: AuthUser }>
    ) => {
      if (action.payload.token) state.token = action.payload.token;
      mergeUser(state, action.payload.user);
    },

    /** A refresh only ever carries a new access token — everything else survives. */
    tokenRefreshed: (state: AuthState, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },

    /** Authoritative snapshot of GET /api/auth/me. Never touches the token. */
    setSession: (state: AuthState, action: PayloadAction<MeData>) => {
      const me = action.payload;
      state.user_id = me.id;
      state.username = me.username;
      state.is_active = me.is_active;
      state.last_login_at = me.last_login_at;
      state.role = me.role;
      state.is_super_admin = me.is_super_admin;
      state.permissions = me.permissions ?? [];
      state.enforcement_mode = me.enforcement_mode ?? 'audit';
    },

    logout: () => initialState,
  },
});

export const { loginSuccess, tokenRefreshed, setSession, logout } = authSlice.actions;
export default authSlice.reducer;
