import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // Accepter identifiant (nouveau) ou email (rétro-compat)
    const id = credentials.identifiant || credentials.email;
    return await authService.login(id, credentials.motDePasse);
  } catch (err) {
    return rejectWithValue(
      err.response?.data?.message || 'Identifiant ou mot de passe incorrect. Veuillez réessayer.'
    );
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    return await authService.getMe();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expirée');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    utilisateur: null,
    token: localStorage.getItem('janngo_token'),
    loading: false,
    error: null,
    // Si pas de token en localStorage, pas besoin de fetchMe → déjà initialisé
    initialized: !localStorage.getItem('janngo_token'),
  },
  reducers: {
    logout(state) {
      state.utilisateur = null;
      state.token = null;
      localStorage.removeItem('janngo_token');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.utilisateur = payload.utilisateur;
        state.token = payload.token;
        state.initialized = true; // session validée par le serveur
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.utilisateur = payload;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.utilisateur = null;
        state.token = null;
        state.initialized = true;
        localStorage.removeItem('janngo_token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
