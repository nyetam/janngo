import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../services/notificationService';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  return await notificationService.mesNotifications();
});

export const marquerLu = createAsyncThunk('notifications/marquerLu', async (id) => {
  return await notificationService.marquerLu(id);
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { liste: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.liste = payload;
      })
      .addCase(marquerLu.fulfilled, (state, { payload }) => {
        const idx = state.liste.findIndex((n) => n.id === payload.id);
        if (idx !== -1) state.liste[idx] = payload;
      });
  },
});

export default notificationSlice.reducer;
