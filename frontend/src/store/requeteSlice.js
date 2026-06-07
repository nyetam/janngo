import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requeteService from '../services/requeteService';

export const fetchRequetes = createAsyncThunk('requetes/fetch', async (_, { rejectWithValue }) => {
  try { return await requeteService.lister(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

export const fetchRequete = createAsyncThunk('requetes/fetchOne', async (id, { rejectWithValue }) => {
  try { return await requeteService.detail(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Erreur'); }
});

const requeteSlice = createSlice({
  name: 'requetes',
  initialState: {
    liste: [],
    courante: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCourante(state) { state.courante = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequetes.pending, (state) => { state.loading = true; })
      .addCase(fetchRequetes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.liste = payload;
      })
      .addCase(fetchRequetes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchRequete.fulfilled, (state, { payload }) => {
        state.courante = payload;
      });
  },
});

export const { clearCourante, clearError } = requeteSlice.actions;
export default requeteSlice.reducer;
